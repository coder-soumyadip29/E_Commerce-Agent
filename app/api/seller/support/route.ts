import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import {
  getSellerSupportTickets,
  createSellerSupportTicket,
  replySellerSupportTicket,
} from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const tickets = getSellerSupportTickets(seller.id);

    return NextResponse.json({
      tickets,
    });
  } catch (error: any) {
    console.error("Seller support tickets error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch support tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "reply") {
      const { ticket_id, message } = body;
      if (!ticket_id || !message?.trim()) {
        return NextResponse.json({ error: "Ticket ID and message are required" }, { status: 400 });
      }

      const result = replySellerSupportTicket(seller.id, Number(ticket_id), message);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        message: "Reply sent successfully",
        ticket: result.ticket,
      });
    }

    // Default: Create new ticket
    const { subject, category, message, priority } = body;
    if (!subject?.trim() || !category || !message?.trim()) {
      return NextResponse.json({ error: "Subject, category, and message are required" }, { status: 400 });
    }

    const result = createSellerSupportTicket(seller.id, {
      subject,
      category,
      message,
      priority,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "Support ticket opened successfully. Ticket team will respond shortly.",
      ticket: result.ticket,
    });
  } catch (error: any) {
    console.error("Seller support action error:", error);
    return NextResponse.json({ error: error.message || "Failed to process support request" }, { status: 500 });
  }
}

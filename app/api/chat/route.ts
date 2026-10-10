import { NextRequest, NextResponse } from "next/server";
import { handleChat } from "@/lib/agent";
import { ChatMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    try {
      const assistantResponse = await handleChat(messages);
      return NextResponse.json({ success: true, message: assistantResponse });
    } catch (chatError) {
      console.error("Chat agent execution error, falling back to deterministic catalog engine:", chatError);
      const { handleMockChat } = await import("@/lib/agent/mock");
      const fallbackResponse = await handleMockChat(messages);
      return NextResponse.json({ success: true, message: fallbackResponse });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing message." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { PaymentModel } from "@/lib/models/Payment";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sigHeader = req.headers.get("stripe-signature");

    const rawBody = await req.text();

    // Verify webhook signature if secret is configured
    if (webhookSecret && sigHeader) {
      const parts = sigHeader.split(",").reduce((acc, part) => {
        const [k, v] = part.split("=");
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {} as Record<string, string>);

      const timestamp = parts["t"];
      const signature = parts["v1"];

      if (timestamp && signature) {
        const signedPayload = `${timestamp}.${rawBody}`;
        const expectedSignature = crypto
          .createHmac("sha256", webhookSecret)
          .update(signedPayload)
          .digest("hex");

        if (signature !== expectedSignature) {
          console.warn("[Stripe Webhook] Invalid signature rejected");
          return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
        }
      }
    }

    const event = JSON.parse(rawBody);
    console.log(`[Stripe Webhook] Received event: ${event.type} (ID: ${event.id})`);

    await connectToDatabase();

    // Handle payment intent succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const paymentId = paymentIntent.id;
      const orderId = paymentIntent.metadata?.orderId || paymentIntent.id;

      await PaymentModel.findOneAndUpdate(
        { $or: [{ paymentId }, { orderId }] },
        {
          $set: {
            status: "paid",
            paymentDetails: {
              stripePaymentIntentId: paymentId,
              stripeCurrency: paymentIntent.currency,
              stripeStatus: paymentIntent.status,
            },
            updatedAt: new Date(),
          },
        },
        { upsert: false }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}

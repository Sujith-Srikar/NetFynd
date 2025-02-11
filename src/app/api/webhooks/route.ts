import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import User from "@/lib/models/User";
import { connectDB } from "@/lib/services/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB(); // ✅ Ensure MongoDB is connected

    const SIGNING_SECRET = process.env.SIGNING_SECRET;
    if (!SIGNING_SECRET) {
      return NextResponse.json(
        { error: "Missing SIGNING_SECRET" },
        { status: 500 }
      );
    }

    const wh = new Webhook(SIGNING_SECRET);
    const headerPayload = await headers();

    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 400 }
      );
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error: Webhook verification failed:", err);
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 }
      );
    }

    // ✅ Check the event type
    const eventType = evt.type;
    if (eventType === "user.created") {
      const email = evt.data.email_addresses?.[0]?.email_address;
      if (email) {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
          await User.create({ email });
          console.log("✅ User saved to MongoDB:", email);
        }
      }
    }

    return NextResponse.json({ message: "Webhook received" });
  } catch (error) {
    console.error("❌ Clerk Webhook Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

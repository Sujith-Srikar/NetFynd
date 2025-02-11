import { google } from "googleapis";
import { connectDB } from "@/lib/services/db";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const auth = new google.auth.JWT({
      email: process.env.GMAIL_SERVICE_ACCOUNT_EMAIL!,
      key: (process.env.GMAIL_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
    });

    const gmail = google.gmail({ version: "v1", auth });

    // ✅ Search for emails with subject "recharge 5 credits"
    const response = await gmail.users.messages.list({
      userId: "22l31a0579@vignaniit.edu.in",
      q: 'subject:"recharge 5 credits"',
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return NextResponse.json({ message: "No recharge emails found" });
    }

    console.log(response.data.messages)

    for (const message of response.data.messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      const emailData = msg.data.payload?.headers?.find(
        (h) => h.name === "From"
      )?.value;
      const email = emailData?.match(/<(.+)>/)?.[1]; // Extract email address

      if (email) {
        const user = await User.findOne({ email });

        if (user) {
          if (user.credits < 5) {
            user.credits = 5;
            await user.save();
            console.log(`✅ Recharged 5 credits for ${email}`);
          } else {
            console.log(`⚡ User ${email} already has credits`);
          }
        }
      }
    }

    return NextResponse.json({ message: "Checked for recharge emails" });
  } catch (error) {
    console.error("❌ Gmail API Error:", error);
    return NextResponse.json(
      { error: "Failed to check emails" },
      { status: 500 }
    );
  }
}
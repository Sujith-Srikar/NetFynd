import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

interface Attachment {
  file_name: string;
  content: string;
  content_type: string;
  size: number;
  disposition?: string;
}

interface CloudMailinPayload {
  headers: {
    received: string;
    date: string;
    from: string;
    to: string;
    message_id: string;
    subject: string;
    mime_version: string;
    content_type: string;
    dkim_signature: string;
    x_google_dkim_signature: string;
    x_gm_message_state: string;
    x_gm_gg: string;
    x_google_smtp_source: string;
    x_received: string;
    x_gm_features: string;
  };
  envelope: {
    to: string;
    recipients: string[];
    from: string;
    helo_domain: string;
    remote_ip: string;
    tls: boolean;
    tls_cipher: string;
    md5: string;
    spf: {
      result: string;
      domain: string;
    };
  };
  plain: string;
  html: string;
  reply_plain: string | null;
  attachments: Attachment[];
}

interface ClerkUser {
  id: string;
  email_addresses?: { email_address: string }[];
  public_metadata?: {
    credits?: number;
    recharged?: boolean | number;
    [key: string]: unknown;
  };
}

function extractEmail(input: string): string {
  const match = input.match(/<([^>]+)>/);
  return match ? match[1].toLowerCase().trim() : input.toLowerCase().trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const payload = (await req.json()) as CloudMailinPayload;

    if (payload.headers.subject.trim().toLowerCase() === "recharge 5 credits") {
      const senderEmail = extractEmail(payload.envelope.from);

      const searchRes = await fetch(
        `https://api.clerk.dev/v1/users?email_address=${encodeURIComponent(
          senderEmail
        )}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!searchRes.ok) {
        console.error("Failed to search user in Clerk:", searchRes.statusText);
        return NextResponse.json(
          { error: "Failed to search user in Clerk" },
          { status: searchRes.status }
        );
      }
      const searchData = await searchRes.json();
      const users: ClerkUser[] = searchData.data || searchData;
      if (!users || users.length === 0) {
        console.error("User not found for email:", senderEmail);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const user = users[0];
      const userEmail = user.email_addresses?.[0]?.email_address;
      if (!userEmail) {
        console.error("Email not found in Clerk user data.");
        return NextResponse.json({ error: "Email not found" }, { status: 400 });
      }

      const currentCredits = user.public_metadata?.credits ?? 0;
      const alreadyRecharged = Boolean(user.public_metadata?.recharged);

      if (currentCredits > 0 || alreadyRecharged) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD,
            },
          });

          await transporter.sendMail({
            from: `"Investor Finder" <${process.env.GMAIL_USER}>`,
            to: userEmail,
            subject: "Trial Completed",
            text: `You have already completed your trial. Thank you for trying our service!`,
          });

        } catch (emailError) {
          console.error("Error sending trial completion email:", emailError);
        }
        return NextResponse.json({ message: "Trial completion email sent" });
      }

      const newCredits = 5;
      const updateRes = await fetch(
        `https://api.clerk.dev/v1/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_metadata: {
              credits: newCredits,
              recharged: true,
            },
          }),
        }
      );

      if (!updateRes.ok) {
        console.error("Failed to update user credits:", updateRes.statusText);
        return NextResponse.json(
          { error: "Failed to update user credits" },
          { status: updateRes.status }
        );
      }

      return NextResponse.json({
        message: `User credits updated to ${newCredits}`,
      });
    } else {
      return NextResponse.json({ message: "No recharge action taken" });
    }
  } catch (error) {
    console.error("Error processing CloudMailin webhook:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
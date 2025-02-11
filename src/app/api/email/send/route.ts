import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface EmailRequestBody {
  email: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { email } = (await req.json()) as EmailRequestBody;
  const rechargeEmail = "8713c39a0b2b62c9fcd6@cloudmailin.net";

  if (!email) {
    return NextResponse.json(
      { error: "User email is required" },
      { status: 400 }
    );
  }

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
      to: email,
      subject: "Recharge Required",
      text: `Your credits are exhausted. Please send an email to ${rechargeEmail} with the subject "recharge 5 credits" to get more.`,
    });

    return NextResponse.json({ message: "Recharge email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
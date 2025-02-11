import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const rechargeEmail = process.env.GMAIL_USER;

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
    console.error("❌ Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

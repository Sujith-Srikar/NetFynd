import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/services/db";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // ✅ Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch user email from Clerk API
    const clerkRes = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const clerkUser = await clerkRes.json();
    const email = clerkUser.email_addresses?.[0]?.email_address;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // ✅ Find user in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error("❌ User API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
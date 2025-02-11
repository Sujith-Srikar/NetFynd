import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface ClerkUser {
  email_addresses?: { email_address: string }[];
  public_metadata?: {
    credits?: number;
    recharged?: boolean;
    [key: string]: unknown;
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkRes = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!clerkRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user from Clerk" },
        { status: clerkRes.status }
      );
    }

    const clerkUser = (await clerkRes.json()) as ClerkUser;

    const credits = clerkUser.public_metadata?.credits ?? 5;

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("User API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
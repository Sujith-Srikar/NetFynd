import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface ClerkUser {
  email_addresses?: { email_address: string }[];
  public_metadata?: {
    credits?: number;
    [key: string]: unknown;
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    // Authenticate the user via Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user data from Clerk’s API
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

    // Read credits from public_metadata (default to 0 if not set)
    const credits = clerkUser.public_metadata?.credits ?? 5;

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("❌ User API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { connectDB } from "@/lib/services/db";
import Investor, {IInvestor} from "@/lib/models/Investor";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface ClerkUser {
  email_addresses?: { email_address: string }[];
  public_metadata?: {
    credits?: number;
    [key: string]: unknown;
  };
}

interface SearchRequestBody {
  query: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Connect to MongoDB for investor data
    await connectDB();

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
    const email = clerkUser.email_addresses?.[0]?.email_address;
    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Get credits from Clerk user metadata (default to 0)
    let credits = clerkUser.public_metadata?.credits ?? 5;

    // Check if user has enough credits
    if (credits <= 0) {
      // Trigger recharge email
      await fetch(`${process.env.NEXTAUTH_URL}/api/email/send`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return NextResponse.json({ error: "No credits left" }, { status: 403 });
    }

    // Deduct one credit
    credits -= 1;

    // Update Clerk user’s public_metadata with the new credits balance
    const updateRes = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: { credits },
      }),
    });

    if (!updateRes.ok) {
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: updateRes.status }
      );
    }

    // Process the search query
    const { query } = (await req.json()) as SearchRequestBody;
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Fetch all investors from MongoDB
    const investors = await Investor.find();
    if (!investors || investors.length === 0) {
      return NextResponse.json(
        { message: "No investors found" },
        { status: 200 }
      );
    }

    // Format investor data for the Gemini AI query
    const investorData = investors.map((inv: IInvestor) => ({
      name: inv.name,
      category: inv.category,
      type: inv.type,
    }));

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Send query and investor data to Gemini AI
    const result = await model.generateContent(`
      We have the following investors:
      ${JSON.stringify(investorData)}

      User's Query: "${query}"

      Based on the user’s request, recommend the best investors from the list.
      Provide only the *most relevant investor names*.
    `);

    const bestInvestors = result.response.text();

    return NextResponse.json({ result: bestInvestors });
  } 
  catch (error) {
    console.error("❌ Search API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
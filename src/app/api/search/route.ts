import { connectDB } from "@/lib/services/db";
import Investor from "@/lib/models/Investor";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Get the authenticated user
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

    // ✅ Check if user has enough credits
    if (user.credits <= 0) {
      const ans = await fetch(`${process.env.NEXTAUTH_URL}/api/email/send`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return NextResponse.json({ error: "No credits left" }, { status: 403 });
    }

    // ✅ Deduct one credit
    user.credits -= 1;
    await user.save();

    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // ✅ Fetch all investors from MongoDB
    const investors = await Investor.find();

    if (investors.length === 0) {
      return NextResponse.json(
        { message: "No investors found" },
        { status: 200 }
      );
    }

    // ✅ Format investor data
    const investorData = investors.map((inv) => ({
      name: inv.name,
      category: inv.category,
      type: inv.type,
    }));

    // ✅ Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ✅ Send query + investor data to Gemini AI
    const result = await model.generateContent(`
      We have the following investors:
      ${JSON.stringify(investorData)}

      User's Query: "${query}"

      Based on the user’s request, recommend the best investors from the list.
      Provide only the **most relevant investor names**.
    `);

    const response = result.response;
    const bestInvestors = response.text();

    return NextResponse.json({ result: bestInvestors });
  } catch (error) {
    console.error("❌ Search API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/services/db";
import Investor from "@/lib/models/Investor";

export async function POST() {
  await connectDB();
  try {

    // Insert test investors/mentors
    await Investor.create([
      { name: "Elon Musk", category: "Space Tech", type: "Investor" },
      { name: "Bill Gates", category: "AI", type: "Investor" },
      { name: "Mark Cuban", category: "Blockchain", type: "Investor" },
      { name: "Naval Ravikant", category: "Startups", type: "Investor" },
      { name: "Andreessen Horowitz", category: "Web3", type: "Investor" },
      { name: "Chris Dixon", category: "Crypto", type: "Investor" },
      { name: "Vinod Khosla", category: "Deep Tech", type: "Investor" },
      { name: "Peter Thiel", category: "Fintech", type: "Investor" },
      { name: "Reid Hoffman", category: "Social Networks", type: "Investor" },
      { name: "Chamath Palihapitiya", category: "SaaS", type: "Investor" },
      { name: "Sam Altman", category: "AI", type: "Mentor" },
      { name: "Balaji Srinivasan", category: "Crypto", type: "Mentor" },
      { name: "Marc Andreessen", category: "Web3", type: "Mentor" },
      { name: "Eric Schmidt", category: "Cloud Computing", type: "Mentor" },
      { name: "Tim Cook", category: "Consumer Tech", type: "Mentor" },
      { name: "Sundar Pichai", category: "AI", type: "Mentor" },
      { name: "Jeff Bezos", category: "E-commerce", type: "Investor" },
      { name: "Brian Chesky", category: "Hospitality Tech", type: "Investor" },
      { name: "Paul Graham", category: "Startups", type: "Mentor" },
      { name: "Steve Wozniak", category: "Hardware", type: "Mentor" },
    ]);

    return NextResponse.json({ message: "Test users & investors inserted!" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error inserting test data", error },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();
  try {
    // Fetch all investors/mentors
    const investors = await Investor.find();

    return NextResponse.json({ investors });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching data", error },
      { status: 500 }
    );
  }
}
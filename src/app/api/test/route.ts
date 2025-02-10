import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/services/db";
import User from "@/lib/models/User";
import Investor from "@/lib/models/Investor";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    // Insert test users
    await User.create([
      { email: "user1@example.com" },
      { email: "user2@example.com" },
    ]);

    // Insert test investors/mentors
    await Investor.create([
      { name: "Alice", category: "AI", type: "Investor" },
      { name: "Bob", category: "Blockchain", type: "Mentor" },
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
    // Fetch all users
    const users = await User.find();
    // Fetch all investors/mentors
    const investors = await Investor.find();

    return NextResponse.json({ users, investors });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching data", error },
      { status: 500 }
    );
  }
}
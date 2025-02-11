import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/services/db";
import User from "@/lib/models/User";

export async function storeUserInDB() {
  try {
    await connectDB();

    // ✅ Get the logged-in user from Clerk
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) throw new Error("User email not found");

    // ✅ Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      await User.create({ email });
      console.log("✅ User saved to MongoDB:", email);
    } else {
      console.log("⚡ User already exists in MongoDB:", email);
    }

    return { success: true, email };
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error storing user:", error.message);
      return { success: false, error: error.message };
    } else {
      console.error("❌ Unknown error:", error);
      return { success: false, error: "An unknown error occurred" };
    }
  }
}

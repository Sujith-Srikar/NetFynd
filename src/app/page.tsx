"use client";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  // ✅ Redirect after render
  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Investor Finder 🚀</h1>
      <p className="text-lg text-gray-400 mb-6">
        Find the right investors for your startup.
      </p>
      <SignInButton>
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Login to Get Started
        </button>
      </SignInButton>
    </div>
  );
}

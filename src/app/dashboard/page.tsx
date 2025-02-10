"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // Fix Hydration Issue

  useEffect(() => {
    setIsClient(true); // Ensures this runs only on the client
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (!isClient || status === "loading") {
    return <p className="text-white text-center mt-10">Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.email}!</h1>
      <p>Your Credits: {session?.user?.credits}</p>
      <button
        onClick={() => signOut()}
        className="mt-4 px-6 py-2 bg-red-600 rounded-lg"
      >
        Sign Out
      </button>
    </div>
  );
}
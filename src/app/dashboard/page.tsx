"use client";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

export default function Dashboard() {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();

  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [credits, setCredits] = useState<number>(5);

  // ✅ Fetch user credits when component mounts
  useEffect(() => {
    const fetchCredits = async () => {
      const res = await fetch("/api/user");
      const data = await res.json();
      setCredits(data.credits ?? 0);
    };

    if (isSignedIn) {
      fetchCredits();
    }
  }, [isSignedIn, credits]);

  const handleSearch = async () => {
    if (credits < 0) return;

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    if (data.error) {
      setResult(data.error);
    } else {
      setResult(data.result);
      setCredits(data.creditsLeft);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      <nav className="w-full flex justify-between items-center py-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Investor Finder</h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      <div className="flex flex-col items-center mt-16 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Find Your Investor</h2>
        <p className="text-lg text-gray-300">
          Credits: {credits !== null ? credits : "Loading..."}
        </p>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your startup..."
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={credits < 0}
          className={`mt-4 px-6 py-3 rounded-lg ${
            credits < 0
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {credits === 0 ? "No Credits Left" : "Search"}
        </button>
        {result && <p className="mt-6 text-lg text-gray-300">{result}</p>}
      </div>
    </div>
  );
}

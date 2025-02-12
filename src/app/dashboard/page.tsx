"use client";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { SignedIn, UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCredits, setFetchingCredits] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchCredits = async () => {
      try {
        setFetchingCredits(true);
        const res = await fetch("/api/user");
        const data = await res.json();
        setCredits(data.credits ?? 5);
      } catch (error) {
        console.error("Error fetching credits:", error);
      } finally {
        setFetchingCredits(false);
      }
    };

    fetchCredits();
  }, [isSignedIn, credits]);

  const handleSearch = async () => {
    if (credits === null) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      console.log(data);
      setResult(data.result ?? "No relevant investors found.");
      setCredits(data.creditsLeft ?? 0);
    } catch (error) {
      console.error("Search Error:", error);
      setResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      <nav className="w-full flex justify-between items-center py-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Investor Finder</h1>
        <div className="flex items-center gap-4">
          <SignedIn>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition-all"
            >
              Logout
            </button>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
      <div className="flex flex-col items-center mt-16 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Find Your Investor</h2>

        <p className="text-lg text-gray-300">
          Credits:{" "}
          {fetchingCredits ? (
            <span className="animate-pulse text-yellow-400">Loading...</span>
          ) : (
            <span
              className={`font-semibold ${
                credits === 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              {credits}
            </span>
          )}
        </p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your startup..."
          className="w-full p-3 mt-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <button
          onClick={handleSearch}
          disabled={credits === null || credits <= 0 || loading}
          className={`mt-4 px-6 py-3 rounded-lg transition-all ${
            credits === 0 || credits === null
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading
            ? "Searching..."
            : credits === 0
            ? "No Credits Left"
            : "Search"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg w-full text-center">
            <h3 className="text-lg font-semibold text-green-300">Results:</h3>
            <p className="mt-2 text-gray-300">{result}</p>
          </div>
        )}
      </div>
      {credits === 0 && <p className="mt-4 text-blue-400">Check your email for credits</p>}
    </div>
  );
}

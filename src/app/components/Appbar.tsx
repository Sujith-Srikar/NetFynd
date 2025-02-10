"use client"; // ✅ Must be at the top

import { signIn, signOut, useSession } from "next-auth/react";

export default function Appbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return null; // ✅ Prevents hydration mismatch

  const isUserLoggedIn = !!session?.user;
  const buttonTitle = isUserLoggedIn ? "Logout" : "Login";

  const handleButtonClick = () => {
    if (isUserLoggedIn) {
      signOut({ callbackUrl: "/" });
    } else {
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  return (
    <div className="fixed px-5 py-4 w-full flex justify-between bg-gray-800 text-white">
      <div className="font-bold text-lg">Muzer</div>
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 bg-blue-500 rounded"
      >
        {buttonTitle}
      </button>
    </div>
  );
}

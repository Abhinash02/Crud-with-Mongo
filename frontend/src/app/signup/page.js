"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      alert("Signup failed");
      return;
    }

    alert("Signup successful! Please login.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        <form onSubmit={handleSignup} className="flex flex-col">
          <input
            type="text"
            placeholder="Enter Username"
            className="border p-2 rounded mb-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            className="border p-2 rounded mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Signup
          </button>
          <br></br>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

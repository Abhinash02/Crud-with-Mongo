"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", { // Corrected endpoint to /login
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      // Redirect based on role
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/crud");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Sign In</h2>

        {error && <p className="text-red-500 text-center bg-red-900 p-2 rounded mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
          <input 
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button 
            type="submit"
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-all"
          >
            Login
          </button>
          <button
      type="button"
      onClick={() => router.push("/signup")}
      className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-all"
    >
      Signup
    </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

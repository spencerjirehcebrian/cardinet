"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { usernameOrEmail, password } = formData;

    try {
      const result = await login(usernameOrEmail, password);

      if (result.success) {
        router.push("/");
      } else {
        // Display the error message from the API
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-8  animate-[fadeIn_0.4s_ease-in-out] flex flex-col items-center">
      {/* Logo and Title moved outside the yellow container */}
      <div className="flex items-center space-x-3 mb-6">
        <Image src="/logo.png" alt="CardiNet Logo" width={64} height={64} />
        <h1 className="text-5xl font-bold text-yellow-400">CardiNet</h1>
      </div>

      {/* Yellow container with login form */}
      <div className="w-full max-w-4xl mx-auto bg-yellow-500 rounded-3xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-semibold text-center mt-4 text-red-800">
            Login to Your Account
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 rounded-lg flex items-center shadow-md animate-[fadeIn_0.3s_ease-in-out]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="px-6 grid gap-1 max-w-md mx-auto"
        >
          <div className="mb-4">
            <div className="flex items-center w-full bg-red-900 bg-opacity-90 rounded-full overflow-hidden transition-all duration-300 focus-within:shadow-md focus-within:shadow-red-800">
              <label className="text-white pl-6 py-4 whitespace-nowrap">
                Email/Username:{" "}
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-none focus:outline-none text-white pr-6 pl-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center w-full bg-red-900 bg-opacity-90 rounded-full overflow-hidden transition-all duration-300 focus-within:shadow-md focus-within:shadow-red-800">
              <label className="text-white pl-6 py-4 whitespace-nowrap">
                Password:{" "}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-none focus:outline-none text-white pr-6 pl-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              type="submit"
              variant="auth"
              isLoading={isLoading}
              disabled={isLoading}
              className="rounded-full"
            >
              Login
            </Button>

            <p className="text-red-900 mt-2">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="underline font-medium hover:text-red-700 transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-32 text-center">
          <h3 className="text-3xl text-red-900">LEARN.DISCOVER.CREATE</h3>
        </div>
      </div>
    </div>
  );
}

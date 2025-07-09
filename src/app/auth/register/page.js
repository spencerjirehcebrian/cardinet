"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dateInputType, setDateInputType] = useState("text");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Transform spaces to underscores for username field
    if (name === 'username') {
      processedValue = value.replace(/\s+/g, '_');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    // Username validation: alphanumeric and underscore only
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError("Username must be between 3 and 20 characters");
      return false;
    }

    // Email validation for Mapua school email
    if (!formData.email.endsWith("@mymail.mapua.edu.ph")) {
      setError(
        "Email must be a valid Mapua school email (@mymail.mapua.edu.ph)"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { username, email, password, birthday, phoneNumber } =
        formData;
      const result = await register(
        username,
        email,
        password,
        birthday,
        phoneNumber
      );

      if (result.success) {
        // Automatically log in the new user
        const loginResult = await login(email, password);

        if (loginResult.success) {
          router.push("/");
        } else {
          router.push("/auth/login?registered=true");
        }
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-8 animate-[fadeIn_0.4s_ease-in-out] flex flex-col items-center">
      {/* Logo and Title moved outside the yellow container */}
      <div className="flex items-center space-x-3 mb-6">
        <Image src="/logo.png" alt="CardiNet Logo" width={64} height={64} />
        <h1 className="text-5xl font-bold text-yellow-400">CardiNet</h1>
      </div>

      {/* Yellow container with registration form */}
      <div className="w-full max-w-4xl mx-auto bg-yellow-500 rounded-3xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-semibold text-center mt-4 text-red-800">
            Create New Account
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 rounded-lg flex items-center shadow-md animate-[fadeIn_0.3s_ease-in-out] max-w-md mx-auto">
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
                Username:{" "}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-none focus:outline-none text-white pr-6 pl-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center w-full bg-red-900 bg-opacity-90 rounded-full overflow-hidden transition-all duration-300 focus-within:shadow-md focus-within:shadow-red-800">
              <label className="text-white pl-6 py-4 whitespace-nowrap">
                Birthday:{" "}
              </label>
              <input
                type={dateInputType}
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                onFocus={() => setDateInputType("date")}
                onBlur={() => {
                  if (!formData.birthday) {
                    setDateInputType("text");
                  }
                }}
                required
                className="w-full bg-transparent border-none focus:outline-none text-white pr-6 pl-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center w-full bg-red-900 bg-opacity-90 rounded-full overflow-hidden transition-all duration-300 focus-within:shadow-md focus-within:shadow-red-800">
              <label className="text-white pl-6 py-4 whitespace-nowrap">
                School Email:{" "}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-none focus:outline-none text-white pr-6 pl-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center w-full bg-red-900 bg-opacity-90 rounded-full overflow-hidden transition-all duration-300 focus-within:shadow-md focus-within:shadow-red-800">
              <label className="text-white pl-6 py-4 whitespace-nowrap">
                Phone:{" "}
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-none focus:outline-none text-white pr-6 pl-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-4">
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

          <div className="mb-6">
            <div className="flex items-center w-full bg-red-900 bg-opacity-90 rounded-full overflow-hidden transition-all duration-300 focus-within:shadow-md focus-within:shadow-red-800">
              <label className="text-white pl-6 py-4 whitespace-nowrap">
                Confirm:{" "}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              Create Account
            </Button>

            <p className="text-red-900 mt-2">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="underline font-medium hover:text-red-700 transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-12 text-center">
          <h3 className="text-3xl text-red-900">LEARN.DISCOVER.CREATE</h3>
        </div>
      </div>
    </div>
  );
}

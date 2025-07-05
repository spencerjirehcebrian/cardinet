"use client";

import { useState, useEffect } from "react";
import { isMobileDevice } from "@/lib/utils";

export default function MobileBlocker({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
      setIsLoading(false);
    };

    checkMobile();

    // Listen for window resize to handle viewport changes
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading state during initial check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Show mobile blocking message if on mobile
  if (isMobile) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-yellow-500 rounded-3xl shadow-2xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <img 
              src="/logo.png" 
              alt="CardiNet Logo" 
              className="mx-auto h-16 w-16 mb-4"
            />
            <div className="text-4xl font-bold text-red-900 mb-2">
              CardiNet
            </div>
          </div>

          {/* Desktop Icon */}
          <div className="mb-6">
            <svg
              className="mx-auto h-20 w-20 text-red-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-red-900 mb-4">
            Desktop Required
          </h1>
          <p className="text-red-800 font-medium mb-6 text-lg">
            CardiNet is optimized for desktop viewing to provide you with the best experience.
          </p>
          
          <div className="bg-red-900 bg-opacity-10 rounded-2xl p-4 mb-6">
            <p className="text-red-900 font-semibold mb-3">Please access from:</p>
            <ul className="text-red-800 space-y-2 text-left">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Desktop computer
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Laptop
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Tablet (landscape mode)
              </li>
            </ul>
          </div>

          <div className="text-sm text-red-700 italic">
            Experience the full power of CardiNet on desktop
          </div>
        </div>
      </div>
    );
  }

  // Render children if not mobile
  return children;
}
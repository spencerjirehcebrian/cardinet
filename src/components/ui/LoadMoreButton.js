import React from "react";
import { FaSpinner } from "react-icons/fa";

export default function LoadMoreButton({ onClick, isLoading, hasMore }) {
  if (!hasMore) {
    return null; // Don't show the button if there's nothing more to load
  }

  // Handle the click and prevent double-clicking
  const handleClick = (e) => {
    if (!isLoading) {
      onClick(e);
    }
  };

  return (
    <div className="flex justify-center py-6 mt-4" id="load-more-container">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          px-8 py-3 rounded-full
          ${
            isLoading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black shadow-md hover:shadow-lg transform transition hover:translate-y-[-2px]"
          }
          font-medium text-sm flex items-center justify-center
          min-w-[140px] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
        `}
        aria-live="polite"
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Loading...
          </>
        ) : (
          "Load More"
        )}
      </button>
    </div>
  );
}

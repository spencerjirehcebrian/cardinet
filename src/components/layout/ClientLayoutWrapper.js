"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  // Check if current route is login or register page
  const isAuthPage =
    pathname === "/auth/login" || pathname === "/auth/register";

  if (isAuthPage) {
    // Special layout for auth pages - full height centered content
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-900 p-4">
        {children}
      </div>
    );
  }

  // Regular layout with header and sidebar for non-auth pages
  return (
    <>
      <Header />
      <div className="flex-grow container mx-auto px-2 sm:px-4">
        <div className="flex">
          <LeftSidebar />
          <div className="border-l border-black h-screen sticky top-0"></div>
          <main className="flex-grow p-4">{children}</main>
        </div>
      </div>
    </>
  );
}

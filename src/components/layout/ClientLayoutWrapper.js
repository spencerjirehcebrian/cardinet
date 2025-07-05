"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import MobileBlocker from "@/components/layout/MobileBlocker";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  // Check if current route is login or register page
  const isAuthPage =
    pathname === "/auth/login" || pathname === "/auth/register";

  // Wrap everything in MobileBlocker to prevent mobile access
  return (
    <MobileBlocker>
      {isAuthPage ? (
        // Special layout for auth pages - full height centered content
        <div className="min-h-screen flex items-center justify-center bg-red-900 p-4">
          {children}
        </div>
      ) : (
        // Regular layout with header and sidebar for non-auth pages
        <>
          <Header />
          <div className="flex-grow container mx-auto px-2 sm:px-4">
            <div className="flex">
              <LeftSidebar />
              <div className="border-l border-black h-screen sticky top-0"></div>
              <main className="flex-grow p-4" data-tour="main-content">{children}</main>
            </div>
          </div>
          {/* Only show onboarding tour on homepage */}
          {pathname === "/" && <OnboardingTour />}
        </>
      )}
    </MobileBlocker>
  );
}

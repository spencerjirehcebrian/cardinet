import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { AuthProvider } from "@/components/auth/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CardiNet",
  description: "The Mapuan Social and Community Network",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gray-100`}
      >
        <AuthProvider>
          <Header />
          <div className="flex-grow container mx-auto px-2 sm:px-4">
            <div className="flex">
              {/* Left Sidebar */}
              <LeftSidebar />

              {/* Divider */}
              <div className="border-l border-black h-screen sticky top-0"></div>

              {/* Main Content */}
              <main className="flex-grow p-4">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

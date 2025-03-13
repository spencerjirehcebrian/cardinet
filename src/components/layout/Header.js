"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { FaSearch, FaUser, FaBars } from "react-icons/fa";
import Button from "@/components/ui/Button";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background-rgb shadow-sm">
      <div className="container mx-auto px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="CardiNet Logo"
              width={64}
              height={64}
              className="text-3xl"
            />
            <span className="text-2xl font-bold hidden sm:inline text-yellow-400">
              CardiNet
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-grow max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1 px-3 pl-10 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <FaSearch className="absolute left-3 top-2 text-gray-400" />
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
          >
            <FaBars size={24} />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-white hover:text-yellow-400">
                    <FaUser />
                    <span>{user.username}</span>
                  </button>
                  {/* Modified dropdown to reduce gap and add connecting area */}
                  <div className="absolute right-0 mt-0 pt-2 w-48 z-10 hidden group-hover:block">
                    {/* This invisible element helps connect the button to the dropdown */}
                    <div className="h-2"></div>
                    <div className="bg-white rounded-md shadow-lg py-1">
                      <Link
                        href={`/user/${user.username}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/create/group"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Create Group
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button href="/auth/login" variant="outlined">
                  Log In
                </Button>
                <Button href="/auth/register" variant="primary">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden mt-2 py-2 border-t">
            {user ? (
              <div className="space-y-2">
                <Link
                  href={`/${user.username}`}
                  className="block px-2 py-1 text-gray-700"
                >
                  Profile
                </Link>
                <Link
                  href="/create/post"
                  className="block px-2 py-1 text-gray-700"
                >
                  Create Post
                </Link>
                <Link
                  href="/create/group"
                  className="block px-2 py-1 text-gray-700"
                >
                  Create Group
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-2 py-1 text-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/login"
                  className="block px-2 py-1 text-gray-700"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-2 py-1 text-gray-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

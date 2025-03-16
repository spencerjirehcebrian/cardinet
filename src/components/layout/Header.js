"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { FaSearch, FaUser, FaBars, FaPlus } from "react-icons/fa";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      setIsSearching(true);

      // Use encodeURIComponent to properly handle special characters in the query
      const query = encodeURIComponent(searchQuery.trim());

      // Navigate to the search page with the encoded query
      router.push(`/search?q=${query}`);

      // Reset searching state after navigation
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background-rgb shadow-sm border-b border-black">
      <div className="container mx-auto px-4 py-2">
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
                placeholder="Search groups, posts, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1 px-3 pl-10 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white"
                disabled={isSearching}
              />
              <button
                type="submit"
                className="absolute left-3 top-2 text-gray-400 hover:text-gray-600"
                disabled={isSearching}
              >
                <FaSearch />
              </button>
              {isSearching && (
                <div className="absolute right-3 top-2 text-yellow-500">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden text-white-700 focus:outline-none"
            onClick={toggleMenu}
          >
            <FaBars size={24} />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                {/* Create Post Button */}
                <Button href="/create/post" variant="primary" icon={<FaPlus />}>
                  Create Post
                </Button>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white hover:text-yellow-400">
                    <UserAvatar username={user.username} size={32} />
                    <span>{user.username}</span>
                  </button>
                  {/* Modified dropdown to reduce gap and add connecting area */}
                  <div className="absolute right-0 mt-0 pt-2 w-48 z-10 hidden group-hover:block">
                    {/* This invisible element helps connect the button to the dropdown */}
                    <div className="h-2"></div>
                    <div className="bg-white rounded-md shadow-lg py-1">
                      <Link
                        href={`/user/${user.username}`}
                        className="block px-4 py-2 text-black hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/create/post"
                        className="block px-4 py-2 text-black hover:bg-gray-100"
                      >
                        Create Post
                      </Link>
                      <Link
                        href="/create/group"
                        className="block px-4 py-2 text-black hover:bg-gray-100"
                      >
                        Create Group
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
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
                  href={`/user/${user.username}`}
                  className="flex items-center px-2 py-1 text-white"
                >
                  <UserAvatar
                    username={user.username}
                    size={24}
                    className="mr-2"
                  />
                  Profile
                </Link>
                <Link
                  href="/create/post"
                  className="block px-2 py-1 text-white"
                >
                  Create Post
                </Link>
                <Link
                  href="/create/group"
                  className="block px-2 py-1 text-white"
                >
                  Create Group
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-2 py-1 text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/login" className="block px-2 py-1 text-white">
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-2 py-1 text-white"
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

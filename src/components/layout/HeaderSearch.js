"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { FaSearch, FaUser, FaBars, FaPlus, FaTimes, FaSpinner } from "react-icons/fa";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import GroupAvatar from "@/components/ui/GroupAvatar";

export default function HeaderSearch() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({
    groups: [],
    posts: [],
    users: []
  });
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches).slice(0, 5));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  // Add click outside handler to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search and fetch results
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults({ groups: [], posts: [], users: [] });
      return;
    }

    const timer = setTimeout(() => {
      fetchQuickSearchResults(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchQuickSearchResults = async (query) => {
    setIsLoadingResults(true);
    try {
      // Only fetch a small number of results for the quick search
      const [groupsRes, postsRes, usersRes] = await Promise.all([
        fetch(`/api/groups?search=${encodeURIComponent(query)}&limit=3`),
        fetch(`/api/posts/search?q=${encodeURIComponent(query)}&limit=3`),
        fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=3`)
      ]);

      const [groupsData, postsData, usersData] = await Promise.all([
        groupsRes.json(),
        postsRes.json(),
        usersRes.json()
      ]);

      setSearchResults({
        groups: groupsData.groups || [],
        posts: postsData.posts || [],
        users: usersData.users || []
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      // Save to recent searches
      const newSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5);
      
      setRecentSearches(newSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      
      setIsSearching(true);
      setShowResults(false);

      // Navigate to search page
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);

      // Reset searching state after navigation
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    }
  };

  const handleSearchInputFocus = () => {
    if (searchQuery.trim().length >= 2 || recentSearches.length > 0) {
      setShowResults(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults({ groups: [], posts: [], users: [] });
  };

  const hasResults = 
    searchResults.groups.length > 0 || 
    searchResults.posts.length > 0 || 
    searchResults.users.length > 0;

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex-grow max-w-xl">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search groups, posts, or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchInputFocus}
            className="w-full py-1 px-3 pl-10 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white"
            disabled={isSearching}
          />
          <div className="absolute left-3 top-2 text-gray-400">
            <FaSearch />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-10 top-2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-3 top-2 text-yellow-500">
              <FaSpinner className="animate-spin" />
            </div>
          )}
          <button
            type="submit"
            className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            disabled={isSearching}
          >
            <FaSearch />
          </button>
        </div>
      </form>

      {/* Quick Search Results Dropdown */}
      {showResults && (
        <div 
          ref={searchResultsRef}
          className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200"
        >
          {isLoadingResults ? (
            <div className="flex justify-center items-center p-4">
              <FaSpinner className="animate-spin text-gray-400 mr-2" />
              <span className="text-gray-500">Searching...</span>
            </div>
          ) : (
            <div>
              {!searchQuery.trim() && recentSearches.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-2 py-1">
                    Recent Searches
                  </div>
                  {recentSearches.map((term, index) => (
                    <Link
                      key={index}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setShowResults(false)}
                    >
                      <div className="flex items-center">
                        <FaSearch className="text-gray-400 mr-2" size={12} />
                        {term}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <>
                  {!hasResults && searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <>
                      {searchResults.groups.length > 0 && (
                        <div className="p-2 border-b">
                          <div className="text-xs font-medium text-gray-500 px-2 py-1">
                            Groups
                          </div>
                          {searchResults.groups.map(group => (
                            <Link
                              key={group.id}
                              href={`/group/${group.name}`}
                              className="block px-4 py-2 hover:bg-gray-100"
                              onClick={() => setShowResults(false)}
                            >
                              <div className="flex items-center">
                                <GroupAvatar 
                                  groupId={group.id} 
                                  groupName={group.name} 
                                  size={24} 
                                  className="mr-2" 
                                />
                                <div>
                                  <div className="font-medium">{group.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {group._count?.members || 0} members
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                          {searchResults.groups.length === 3 && (
                            <Link
                              href={`/search?q=${encodeURIComponent(searchQuery)}`}
                              className="block px-4 py-2 text-xs text-blue-500 hover:bg-gray-100 text-right"
                              onClick={() => setShowResults(false)}
                            >
                              See all groups
                            </Link>
                          )}
                        </div>
                      )}

                      {searchResults.users.length > 0 && (
                        <div className="p-2 border-b">
                          <div className="text-xs font-medium text-gray-500 px-2 py-1">
                            Users
                          </div>
                          {searchResults.users.map(user => (
                            <Link
                              key={user.id}
                              href={`/user/${user.username}`}
                              className="block px-4 py-2 hover:bg-gray-100"
                              onClick={() => setShowResults(false)}
                            >
                              <div className="flex items-center">
                                <UserAvatar 
                                  username={user.username} 
                                  size={24} 
                                  className="mr-2" 
                                />
                                <span>{user.username}</span>
                              </div>
                            </Link>
                          ))}
                          {searchResults.users.length === 3 && (
                            <Link
                              href={`/search?q=${encodeURIComponent(searchQuery)}`}
                              className="block px-4 py-2 text-xs text-blue-500 hover:bg-gray-100 text-right"
                              onClick={() => setShowResults(false)}
                            >
                              See all users
                            </Link>
                          )}
                        </div>
                      )}

                      {searchResults.posts.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-500 px-2 py-1">
                            Posts
                          </div>
                          {searchResults.posts.map(post => (
                            <Link
                              key={post.id}
                              href={`/group/${post.group.name}/comments/${post.id}`}
                              className="block px-4 py-2 hover:bg-gray-100"
                              onClick={() => setShowResults(false)}
                            >
                              <div className="line-clamp-1 font-medium">{post.title}</div>
                              <div className="text-xs text-gray-500">
                                in {post.group.name} • by {post.author.username}
                              </div>
                            </Link>
                          ))}
                          {searchResults.posts.length === 3 && (
                            <Link
                              href={`/search?q=${encodeURIComponent(searchQuery)}`}
                              className="block px-4 py-2 text-xs text-blue-500 hover:bg-gray-100 text-right"
                              onClick={() => setShowResults(false)}
                            >
                              See all posts
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {searchQuery.trim().length >= 2 && (
                    <div className="bg-gray-50 p-2 border-t">
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        className="block py-2 px-4 text-center text-sm text-blue-500 hover:bg-gray-100"
                        onClick={() => setShowResults(false)}
                      >
                        View all results for "{searchQuery}"
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
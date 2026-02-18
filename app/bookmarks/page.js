"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import LoginButton from "@/components/LoginButton";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function BookmarksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [newBookmark, setNewBookmark] = useState({ title: "", url: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [faviconErrors, setFaviconErrors] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Filter bookmarks based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBookmarks(bookmarks);
    } else {
      const filtered = bookmarks.filter(
        (bookmark) =>
          bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredBookmarks(filtered);
    }
  }, [searchTerm, bookmarks]);

  // Fetch bookmarks and setup real-time subscription
  useEffect(() => {
    if (!user) return;

    // Fetch existing bookmarks
    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookmarks:", error);
      } else {
        setBookmarks(data || []);
      }
    };

    fetchBookmarks();

    // Set up real-time subscription with unique channel name
    const subscription = supabase
      .channel(`bookmarks-${user.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) => {
            if (prev.some((b) => b.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) =>
            prev.filter((b) => b.id !== (payload.old?.id || payload.id)),
          );
        },
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBookmark((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addBookmark = async (e) => {
    e.preventDefault();

    if (!newBookmark.title.trim() || !newBookmark.url.trim()) {
      setError("Please fill in both title and URL");
      return;
    }

    if (!validateUrl(newBookmark.url)) {
      setError("Please enter a valid URL (include http:// or https://)");
      return;
    }

    setIsAdding(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([
          {
            user_id: user.id,
            title: newBookmark.title.trim(),
            url: newBookmark.url.trim(),
          },
        ])
        .select();

      if (error) throw error;

      setNewBookmark({ title: "", url: "" });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      setError("Failed to add bookmark. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteBookmark = async (id) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    setDeletingId(id);

    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      alert("Failed to delete bookmark. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return null;
    }
  };

  const handleFaviconError = (bookmarkId) => {
    setFaviconErrors((prev) => ({ ...prev, [bookmarkId]: true }));
  };

  if (loading) {
    return (
      <div className="h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute mt-4 text-gray-600 font-medium">
            Bookmarks...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Bookmarks
              </h1>
              <p className="text-sm text-gray-500">
                {bookmarks.length}{" "}
                {bookmarks.length === 1 ? "bookmark" : "bookmarks"} saved
              </p>
            </div>
          </div>
          <LoginButton />
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bookmarks by title or URL..."
              className="w-full px-4 py-3 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-lg transition-all"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Add Bookmark Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </span>
            Add New Bookmark
          </h2>
          <form onSubmit={addBookmark}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="title"
                  value={newBookmark.title}
                  onChange={handleInputChange}
                  placeholder="Enter bookmark title"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  disabled={isAdding}
                />
              </div>
              <div>
                <input
                  type="url"
                  name="url"
                  value={newBookmark.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  disabled={isAdding}
                />
              </div>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2">
                {error}
              </motion.p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isAdding}
              className="mt-4 w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {isAdding ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </span>
              ) : (
                "Add Bookmark"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Bookmarks Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </span>
            Your Collection
          </h2>

          <AnimatePresence mode="popLayout">
            {filteredBookmarks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No bookmarks yet
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "No bookmarks match your search"
                    : "Add your first bookmark using the form above!"}
                </p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredBookmarks.map((bookmark, index) => {
                    const faviconUrl = getFaviconUrl(bookmark.url);
                    const hasFaviconError = faviconErrors[bookmark.id];

                    return (
                      <motion.div
                        key={bookmark.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          layout: { duration: 0.3 },
                        }}
                        whileHover={{ y: -4 }}
                        className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-5 border border-gray-100 transition-all">
                        {/* Favicon or gradient placeholder */}
                        <div className="flex items-start gap-3">
                          <div className="shrink-0">
                            {faviconUrl && !hasFaviconError ? (
                              <div className="relative w-10 h-10">
                                <Image
                                  src={faviconUrl}
                                  alt=""
                                  fill
                                  sizes="40px"
                                  className="rounded-lg object-contain"
                                  onError={() =>
                                    handleFaviconError(bookmark.id)
                                  }
                                  unoptimized // Sometimes needed for external favicons
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {bookmark.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate mb-1">
                              {bookmark.title}
                            </h3>
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:text-blue-600 hover:underline truncate block">
                              {bookmark.url.replace(/^https?:\/\//, "")}
                            </a>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(bookmark.created_at).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Delete button with animation */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteBookmark(bookmark.id)}
                          disabled={deletingId === bookmark.id}
                          className="absolute top-3 right-3 w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          {deletingId === bookmark.id ? (
                            <svg
                              className="animate-spin h-4 w-4 text-red-500"
                              viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

"use client";

import LoginButton from "@/components/LoginButton";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/supabase";

export default function Home() {
  const { user, loading } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const floatingIcons = [
    { icon: "🔖", delay: 0, x: 10, y: 20 },
    { icon: "⭐", delay: 1, x: 80, y: 60 },
    { icon: "🔗", delay: 2, x: 30, y: 80 },
    { icon: "💫", delay: 1.5, x: 70, y: 30 },
    { icon: "📌", delay: 2.5, x: 20, y: 70 },
    { icon: "✨", delay: 0.5, x: 90, y: 40 },
  ];

  if (loading) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 font-medium">
            Preparing your bookmarks...
          </motion.p>
        </div>
      </motion.main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-blue-400/10 to-purple-400/10"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating icons with parallax effect */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl opacity-20"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 6,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}>
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-20">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}>
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
            <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartBookmark
            </span>
          </motion.div>
          <LoginButton />
        </motion.nav>

        {user ? (
          // Authenticated view
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-24 h-24 mx-auto bg-linear-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center mb-6">
                {user.user_metadata?.avatar_url ? (
                  <div className="relative w-20 h-20">
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt={user.email}
                      fill
                      className="rounded-2xl object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-4xl text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back,
                </span>
                <br />
                <span className="text-gray-800">
                  {user.user_metadata?.full_name?.split(" ")[0] || "there"}!
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-8">
                Your bookmarks are waiting for you
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                  href="/bookmarks"
                  className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl">
                  <span>Go to My Bookmarks</span>
                  <motion.svg
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto">
              {[
                { label: "Bookmarks", value: "✨", icon: "📚" },
                { label: "Collections", value: "🔖", icon: "📁" },
                { label: "Tags", value: "🏷️", icon: "🔤" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-lg">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          // Unauthenticated view
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-600 font-medium text-sm mb-6">
                ⚡ Never lose your favorite links again
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart
                </span>
                <br />
                <span className="text-gray-800">Bookmark Manager</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-8">
                Save, organize, and access your favorite links from anywhere.
                Your personal bookmark collection, beautifully organized and
                always synced.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <LoginButton />
                </motion.div>

                <motion.a
                  href="#features"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-2xl transition-all shadow-lg border border-gray-200">
                  <span>Learn More</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.a>
              </motion.div>

              {/* Feature list */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-2 gap-4 mt-12">
                {[
                  { icon: "🔒", text: "Private & Secure" },
                  { icon: "⚡", text: "Real-time sync" },
                  { icon: "🎨", text: "Beautiful UI" },
                  { icon: "📱", text: "Mobile friendly" },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-gray-600">
                    <span className="text-xl">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right column - Animated illustration */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block">
              <div className="relative w-full h-125">
                {/* Main card */}
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-200">
                  {/* Card header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        My Bookmarks
                      </h3>
                      <p className="text-xs text-gray-500">12 bookmarks</p>
                    </div>
                  </div>

                  {/* Card items */}
                  {[1, 2, 3].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🔗</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          Example Site {item}
                        </p>
                        <p className="text-xs text-gray-400">example.com</p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium"
                    onClick={() => signInWithGoogle()}>
                    + Add Bookmark
                  </motion.button>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  animate={{
                    y: [0, -30, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-20 right-20 w-16 h-16 bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-200 flex items-center justify-center pointer-events-none">
                  <span className="text-3xl">🔖</span>
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 30, 0],
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-20 left-20 w-20 h-20 bg-purple-500/10 backdrop-blur-sm rounded-2xl border border-purple-200 flex items-center justify-center pointer-events-none">
                  <span className="text-4xl">⭐</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Features section */}
        {!user && (
          <motion.div
            id="features"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-32">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose SmartBookmark?
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🔒",
                  title: "Private & Secure",
                  description:
                    "Your bookmarks are private and only accessible to you with Google authentication.",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: "⚡",
                  title: "Real-time Sync",
                  description:
                    "Changes sync instantly across all your devices. Add on one device, see on another.",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  icon: "🎨",
                  title: "Beautiful Design",
                  description:
                    "Modern, clean interface with smooth animations and a delightful user experience.",
                  color: "from-pink-500 to-pink-600",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-xl hover:shadow-2xl transition-all">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <span className="text-3xl">{feature.icon}</span>
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

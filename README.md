# Smart Bookmark Manager

A modern, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Users can sign in with Google and manage their private bookmarks with instant updates across multiple tabs.

## 🚀 Live Demo

[Live Demo URL](https://smart-bookmark-app-nine-orpin.vercel.app)

## 🚀 GitHub

    [URL](https://github.com/KaushikGurlhosur/Smart-Bookmark-App)

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google (no email/password)
- 📚 **Bookmark Management** - Create, view, and delete bookmarks
- 🔒 **Private Bookmarks** - Each user's bookmarks are completely private
- ⚡ **Real-time Updates** - Changes sync instantly across all open tabs
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly** - Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router, JavaScript)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## 📁 Project Structure

├── app/
│ ├── auth/
│ │ └── callback/
│ │ └── route.js # OAuth callback handler
│ ├── bookmarks/
│ │ └── page.js # Main bookmarks page (protected)
│ ├── layout.js # Root layout with AuthProvider
│ └── page.js # Landing page
├── components/
│ ├── LoginButton.js # Google sign-in button with modern UI
├── context/
│ └── AuthContext.js # Global authentication state
└── lib/
└── supabase.js # Supabase client configuration

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud Platform account

### Step 1: Clone the repository

```bash
git clone https://github.com/KaushikGurlhosur/Smart-Bookmark-App
cd smart-bookmark
```

### Step 2: Install dependencies Step 3: Set up environment variables

npm install

### Step 3: Set up environment variables

Create .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

### Step 4: Set up Supabase

Create a new Supabase project

Run the following SQL to create the bookmarks table:

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
id BIGSERIAL PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
title TEXT NOT NULL,
url TEXT NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
ON public.bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks
FOR DELETE
USING (auth.uid() = user_id);

-- This is the "magic" line for Realtime DELETE filters
ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;

-- Create index for faster queries
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

### Step 5: Configure Google OAuth

Go to Google Cloud Console → Create OAuth 2.0 credentials

Add authorized redirect URIs:

http://localhost:3000/auth/callback

https://your-project.supabase.co/auth/v1/callback

Add Client ID and Secret to Supabase Auth providers

### Step 6: Run the development server

npm run dev

### 🚀 Deployment to Vercel

Push code to GitHub

Import project to Vercel

Add environment variables

Update Google OAuth redirect URIs with production URL

Deploy!

### Problems Encountered & Solutions

1. OAuth Redirect Issues
   Problem: After Google sign-in, users were stuck on the callback URL
   Solution: Implemented proper server-side route handling with @supabase/ssr and configured both Next.js and Supabase callback URLs correctly in Google Cloud Console.

2. Real-time Updates Not Working
   Problem: Bookmarks weren't updating across tabs without refresh
   Solution: Had to manually enable Realtime in Supabase dashboard for the bookmarks table.

3. Row Level Security (RLS) Policy Conflicts
   Problem: Users couldn't see their bookmarks after insertion
   Solution: Created explicit RLS policies for SELECT, INSERT, and DELETE operations. Learned that RLS policies must be created for each operation type.

📄 License
MIT License - feel free to use this project for learning or as a template!

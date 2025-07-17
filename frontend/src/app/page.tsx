"use client";

import { useState } from "react";
import CrochetForm from "./components/CrochetForm";
import ImageGallery from "./components/ImageGallery";
import GoogleSignIn from "./components/GoogleSignIn";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const { user, loading, getIdToken, signInWithGoogle } = useAuth();

  const handleSubmit = async (formData: {
    projectDescription: string;
    colorVibe: string;
    colorCount: "monochrome" | "2-4" | "5-7";
  }) => {
    try {
      // Get the authentication token
      const token = await getIdToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
      const response = await fetch(`${backendUrl}/generateMockups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please sign in again.");
        }
        throw new Error("Failed to generate images");
      }

      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error("Error:", error);
      // You might want to add proper error handling UI here
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="
        text-xl text-gray-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">StitchViz</h1>
          <GoogleSignIn />
        </div>
        
        {user && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              StitchViz
            </h1>
            <p className="text-xl text-gray-600">
              Generate AI mockups of your crochet projects
            </p>
          </div>
        )}

        {user ? (
          <>
            <CrochetForm onSubmit={handleSubmit} />
            <ImageGallery images={images} />
          </>
        ) : (
          <div className="flex items-center justify-between max-w-6xl mx-auto py-16">
            <div className="flex-1 pr-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Welcome to StitchViz
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Turn your crochet ideas into beautiful mockups using AI-powered visualizations.
              </p>
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-3 px-6 py-3 text-lg font-medium text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Get Started with Google
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <img 
                src="/robot.png" 
                alt="Crochet robot with yarn ball" 
                className="w-80 h-80 object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

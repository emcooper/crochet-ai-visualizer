"use client";

import { useState } from "react";
import CrochetForm from "./components/CrochetForm";
import ImageGallery from "./components/ImageGallery";
import GoogleSignIn from "./components/GoogleSignIn";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const { user, loading, getIdToken } = useAuth();

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
        <div className="text-xl text-gray-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-8">
          <GoogleSignIn />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crochet AI Visualizer
          </h1>
          <p className="text-xl text-gray-600">
            Generate AI mockups of your crochet projects
          </p>
        </div>

        {user ? (
          <>
            <CrochetForm onSubmit={handleSubmit} />
            <ImageGallery images={images} />
          </>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Sign in to get started
            </h2>
            <p className="text-gray-600 mb-8">
              Please sign in with Google to use the Crochet AI Visualizer
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

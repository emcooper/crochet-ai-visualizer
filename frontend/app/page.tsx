"use client";

import { useState } from "react";
import CrochetForm from "./components/CrochetForm";
import ImageGallery from "./components/ImageGallery";

export default function Home() {
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async (formData: {
    projectDescription: string;
    colorVibe: string;
    colorCount: "monochrome" | "2-4" | "5-7";
  }) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
      const response = await fetch(`${backendUrl}/generateMockups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate images");
      }

      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error("Error:", error);
      // You might want to add proper error handling UI here
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crochet AI Visualizer
          </h1>
          <p className="text-xl text-gray-600">
            Generate AI mockups of your crochet projectss
          </p>
        </div>

        <CrochetForm onSubmit={handleSubmit} />
        <ImageGallery images={images} />
      </div>
    </main>
  );
}

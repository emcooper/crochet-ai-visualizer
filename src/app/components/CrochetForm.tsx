"use client";

import { useState } from "react";

type ColorCount = "monochrome" | "2-4" | "5-7";

interface FormData {
  projectDescription: string;
  colorVibe: string;
  colorCount: ColorCount;
}

export default function CrochetForm({
  onSubmit,
}: {
  onSubmit: (data: FormData) => void;
}) {
  const [formData, setFormData] = useState<FormData>({
    projectDescription: "",
    colorVibe: "",
    colorCount: "2-4",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label
          htmlFor="projectDescription"
          className="block text-sm font-medium text-gray-700"
        >
          Project Description
        </label>
        <textarea
          id="projectDescription"
          value={formData.projectDescription}
          onChange={(e) =>
            setFormData({ ...formData, projectDescription: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
          rows={3}
          required
        />
      </div>

      <div>
        <label
          htmlFor="colorVibe"
          className="block text-sm font-medium text-gray-700"
        >
          Color Vibe
        </label>
        <input
          type="text"
          id="colorVibe"
          value={formData.colorVibe}
          onChange={(e) =>
            setFormData({ ...formData, colorVibe: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
          required
        />
      </div>

      <div>
        <label
          htmlFor="colorCount"
          className="block text-sm font-medium text-gray-700"
        >
          Color Count
        </label>
        <select
          id="colorCount"
          value={formData.colorCount}
          onChange={(e) =>
            setFormData({
              ...formData,
              colorCount: e.target.value as ColorCount,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
          required
        >
          <option value="monochrome">Monochrome</option>
          <option value="2-4">2–4 Colors</option>
          <option value="5-7">5–7 Colors</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating...
          </div>
        ) : (
          "Generate Mockups"
        )}
      </button>
    </form>
  );
}

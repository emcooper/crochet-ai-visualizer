"use client";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const handleDownload = (imageUrl: string) => {
    window.open(imageUrl, "_blank");
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {images.map((imageUrl, index) => (
        <div
          key={index}
          className="relative group rounded-lg overflow-hidden shadow-lg"
        >
          <img
            src={imageUrl}
            alt={`AI-generated crochet mockup ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
            data-pin-media={imageUrl}
            data-pin-description={`AI-generated crochet mockup ${index + 1}`}
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={() => handleDownload(imageUrl)}
              className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-md font-medium transition-opacity duration-300 hover:bg-gray-100"
            >
              View Full Size!
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

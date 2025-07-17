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
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";

interface AvatarWithFallbackProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function AvatarWithFallback({
  src,
  alt = "Imagen",
  className = "",
  fallbackIcon = <span className="text-2xl">📷</span>,
}: AvatarWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`bg-gray-200 rounded-md flex items-center justify-center w-full aspect-video ${className}`}>
        {fallbackIcon}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`object-cover rounded-md w-full aspect-video ${className}`}
    />
  );
}

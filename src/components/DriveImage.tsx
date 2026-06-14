import React, { useState } from 'react';
import { getDriveImageUrl } from '../lib/drive';

export interface DriveImageProps {
  fileId?: string;
  fallbackSrc?: string;
  className?: string;
  alt?: string;
}

export function DriveImage({ fileId, fallbackSrc = '/placeholder.png', className, alt, ...props }: DriveImageProps) {
  const [loading, setLoading] = useState(true);
  const src = fileId ? getDriveImageUrl(fileId) : fallbackSrc;

  return (
    <div className={`relative ${className} overflow-hidden bg-white/5`}> 
      <img
        src={src}
        alt={alt || 'Cover Art'}
        onLoad={() => setLoading(false)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        {...props}
      />
    </div>
  );
}

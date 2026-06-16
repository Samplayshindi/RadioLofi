import React, { useState, useEffect, memo } from 'react';
import { getDriveImageUrl } from '../lib/drive';

export interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fileId?: string;
  fallbackSrc?: string;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export const DriveImage = memo(function DriveImage({ 
  fileId, 
  fallbackSrc = '/placeholder.png', 
  className, 
  alt, 
  priority = false, 
  ...props 
}: DriveImageProps) {
  const src = fileId ? getDriveImageUrl(fileId) : fallbackSrc;
  const [loading, setLoading] = useState(true);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoading(true);
  }

  return (
    <div className={`relative ${className} overflow-hidden bg-white/5`}> 
      <img
        src={src}
        alt={alt || 'Cover Art'}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
        className={`w-full h-full object-cover transition-all duration-300 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        {...props}
      />
    </div>
  );
});

import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../lib/firebase';

export interface DriveImageProps {
  fileId?: string;
  fallbackSrc?: string;
  className?: string;
  alt?: string;
}

const imageCache = new Map<string, string>();

export function DriveImage({ fileId, fallbackSrc = '/placeholder.png', className, alt, ...props }: DriveImageProps) {
  const [src, setSrc] = useState<string>(fallbackSrc);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileId) {
      setSrc(fallbackSrc);
      setLoading(false);
      return;
    }

    if (imageCache.has(fileId)) {
      setSrc(imageCache.get(fileId)!);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadImage() {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('No token');
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load image');
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        imageCache.set(fileId!, objectUrl);
        if (isMounted) {
          setSrc(objectUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (isMounted) {
          setSrc(fallbackSrc);
          setLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [fileId, fallbackSrc]);

  return (
    <div className={`relative ${className} overflow-hidden bg-white/5`}> 
      <img
        src={src}
        alt={alt || 'Cover Art'}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        {...props}
      />
    </div>
  );
}

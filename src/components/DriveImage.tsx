import React, { useState, memo, useMemo, useEffect } from 'react';
import { getOptimizedImageUrl, getDirectRawUrl } from '../lib/drive';
import { imagePreloader } from '../lib/imagePreloader';
import { Disc3 } from 'lucide-react';

export interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fileId?: string;
  fallbackSrc?: string;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export const DriveImage = memo(function DriveImage({ 
  fileId, 
  fallbackSrc, 
  className = '', 
  alt = 'Cover Art', 
  priority = false, 
  ...props 
}: DriveImageProps) {
  const directRaw = useMemo(() => getDirectRawUrl(fileId), [fileId]);
  const optimizedUrl = useMemo(() => getOptimizedImageUrl(fileId, priority ? 800 : 500), [fileId, priority]);

  // Synchronously check global cache
  const cachedUrl = useMemo(() => {
    return imagePreloader.getCachedUrl(fileId) || imagePreloader.getCachedUrl(optimizedUrl) || imagePreloader.getCachedUrl(directRaw);
  }, [fileId, optimizedUrl, directRaw]);

  const alreadyCached = Boolean(cachedUrl || imagePreloader.isCached(fileId) || imagePreloader.isCached(directRaw));

  // Initial source: preferred cached blob URL, otherwise optimized edge CDN URL
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (cachedUrl) return cachedUrl;
    return directRaw ? optimizedUrl : (fallbackSrc || '');
  });

  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [isFailed, setIsFailed] = useState(!fileId && !fallbackSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(() => alreadyCached);

  // If already cached or preloaded, ensure isLoaded is true
  useEffect(() => {
    if (cachedUrl) {
      setCurrentSrc(cachedUrl);
      setIsLoaded(true);
      return;
    }

    if (!fileId) return;

    // Trigger preloading for this image immediately
    let isCancelled = false;
    imagePreloader
      .preload(fileId, { priority, width: priority ? 800 : 500 })
      .then((resolvedUrl) => {
        if (!isCancelled && resolvedUrl) {
          setCurrentSrc(resolvedUrl);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        // Fallback handled by onError
      });

    return () => {
      isCancelled = true;
    };
  }, [fileId, priority, cachedUrl]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    // If optimized edge CDN fails, immediately fallback to raw GitHub content
    if (!hasTriedFallback && directRaw && currentSrc !== directRaw) {
      setHasTriedFallback(true);
      setCurrentSrc(directRaw);
      return;
    }
    // If raw also fails, show graceful fallback artwork
    setIsFailed(true);
    setIsLoaded(true);
  };

  // Generate deterministic subtle color hue for instant placeholder
  const placeholderHue = useMemo(() => {
    let hash = 0;
    const str = fileId || alt || 'rw';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 360);
  }, [fileId, alt]);

  return (
    <div 
      className={`relative overflow-hidden select-none bg-slate-900/60 dark:bg-slate-950/80 ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 40%, hsl(${placeholderHue}, 40%, 15%), #080b12 85%)`
      }}
    >
      {/* Instant placeholder icon while loading */}
      {!isLoaded && !isFailed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Disc3 className="w-8 h-8 text-white/10 animate-spin opacity-40" style={{ animationDuration: '6s' }} />
        </div>
      )}

      {/* Actual Image */}
      {!isFailed && currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-150 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}

      {/* Elegant fallback if image cannot be loaded */}
      {isFailed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900 border border-white/5">
          <Disc3 className="w-10 h-10 text-cyan-400/40 mb-2" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 line-clamp-1">
            {alt}
          </span>
        </div>
      )}

      {/* Subtle glass vignette border */}
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-[inherit]" />
    </div>
  );
});

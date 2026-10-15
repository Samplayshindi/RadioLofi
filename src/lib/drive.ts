import { Project } from '../types';

export async function scanCatalog(): Promise<Project[]> {
  try {
    const response = await fetch('/catalog.json');
    if (!response.ok) {
      console.warn('Could not fetch catalog.json');
      return [];
    }
    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error loading catalog:', error);
    return [];
  }
}

/**
 * Normalizes any GitHub URL to a clean raw.githubusercontent.com URL
 */
export function getDirectRawUrl(url?: string): string {
  if (!url) return '';
  let cleaned = url.trim();

  // Handle GitHub blob / web URLs
  if (cleaned.includes('github.com/') && cleaned.includes('/blob/')) {
    cleaned = cleaned.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  // Strip query parameters like ?raw=true
  if (cleaned.includes('?')) {
    cleaned = cleaned.split('?')[0];
  }

  // Normalize Drive URLs if needed
  if (!cleaned.startsWith('http') && !cleaned.startsWith('/')) {
    cleaned = `https://drive.google.com/uc?export=view&id=${cleaned}`;
  }

  return cleaned;
}

/**
 * Generates an ultra-fast CDN WebP image URL via Cloudflare Edge (wsrv.nl)
 * Shrinks 5MB JPEG images to ~25KB WebP delivered in ~30ms globally
 */
export function getOptimizedImageUrl(rawUrl?: string, width = 600, quality = 82): string {
  if (!rawUrl) return '/placeholder.png';
  const direct = getDirectRawUrl(rawUrl);

  // If already relative local asset
  if (direct.startsWith('/assets/') || direct.startsWith('/placeholder')) {
    return direct;
  }

  // Use wsrv.nl edge CDN for fast WebP resizing & caching
  try {
    return `https://wsrv.nl/?url=${encodeURIComponent(direct)}&w=${width}&q=${quality}&output=webp`;
  } catch {
    return direct;
  }
}

export function getDriveImageUrl(fileId?: string, fallbackPath: string = '/placeholder.png'): string {
  if (!fileId) return fallbackPath;
  return getOptimizedImageUrl(fileId, 600);
}

/**
 * Normalizes audio URLs to direct streamable raw MP3 endpoints
 */
export function normalizeAudioUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();

  if (cleaned.includes('github.com/') && cleaned.includes('/blob/')) {
    cleaned = cleaned.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  if (cleaned.includes('?')) {
    cleaned = cleaned.split('?')[0];
  }

  if (!cleaned.startsWith('/') && !cleaned.startsWith('http')) {
    return `https://drive.google.com/uc?export=download&id=${cleaned}`;
  }

  return cleaned;
}

import { imagePreloader } from './imagePreloader';

/**
 * Preload high-priority images into browser memory & cache storage
 */
export function preloadImage(url: string, priority = false) {
  if (!url || typeof window === 'undefined') return;
  imagePreloader.preload(url, { priority });
}

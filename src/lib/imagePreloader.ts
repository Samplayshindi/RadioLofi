import { Project } from '../types';
import { getOptimizedImageUrl, getDirectRawUrl } from './drive';

export interface PreloadStatus {
  total: number;
  loaded: number;
  failed: number;
  isComplete: boolean;
  percent: number;
}

type StatusListener = (status: PreloadStatus) => void;

class GlobalImagePreloader {
  private cacheStorageName = 'radiowaves-artwork-v2';
  private memoryBlobUrls = new Map<string, string>();
  private resolvedKeys = new Set<string>();
  private failedKeys = new Set<string>();
  private inflight = new Map<string, Promise<string>>();
  private listeners = new Set<StatusListener>();

  // Queue state
  private highPriorityQueue: string[] = [];
  private lowPriorityQueue: string[] = [];
  private isProcessing = false;
  private maxConcurrency = 4;
  private activeWorkers = 0;

  // Stats
  private totalQueued = 0;
  private totalLoaded = 0;
  private totalFailed = 0;

  constructor() {
    // Warm up CacheStorage if available in browser
    if (typeof window !== 'undefined' && 'caches' in window) {
      this.initCacheStorage().catch(() => {});
    }
  }

  private async initCacheStorage(): Promise<Cache | null> {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        return await window.caches.open(this.cacheStorageName);
      }
    } catch {
      // Ignore cache storage errors (e.g. storage disabled in private mode)
    }
    return null;
  }

  /**
   * Subscribe to preloading progress updates
   */
  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach(cb => {
      try {
        cb(status);
      } catch (err) {
        console.error('Preloader listener error:', err);
      }
    });
  }

  public getStatus(): PreloadStatus {
    const total = this.totalQueued;
    const loaded = this.totalLoaded;
    const failed = this.totalFailed;
    const isComplete = total > 0 && (loaded + failed >= total);
    const percent = total > 0 ? Math.min(100, Math.round(((loaded + failed) / total) * 100)) : 100;

    return {
      total,
      loaded,
      failed,
      isComplete,
      percent
    };
  }

  /**
   * Checks if an image key is already loaded and resolved
   */
  public isCached(rawUrlOrId?: string): boolean {
    if (!rawUrlOrId) return false;
    const direct = getDirectRawUrl(rawUrlOrId);
    return (
      this.resolvedKeys.has(rawUrlOrId) ||
      this.resolvedKeys.has(direct) ||
      this.memoryBlobUrls.has(rawUrlOrId) ||
      this.memoryBlobUrls.has(direct)
    );
  }

  /**
   * Returns a ready-to-display cached Object URL or direct URL if available
   */
  public getCachedUrl(rawUrlOrId?: string): string | null {
    if (!rawUrlOrId) return null;
    const direct = getDirectRawUrl(rawUrlOrId);
    return this.memoryBlobUrls.get(rawUrlOrId) || this.memoryBlobUrls.get(direct) || null;
  }

  /**
   * Decodes an image using HTMLImageElement.decode() to guarantee
   * zero GPU rasterization hitch during page navigation.
   */
  private async decodeImageBitmap(src: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      if (img.complete && img.naturalWidth > 0) {
        return;
      }
      if (typeof img.decode === 'function') {
        await img.decode();
      }
    } catch {
      // Decode fallback or unsupported browser format
    }
  }

  /**
   * Preload a single image with optional priority
   */
  public async preload(
    rawUrlOrId?: string,
    options: { priority?: boolean; width?: number; quality?: number } = {}
  ): Promise<string> {
    if (!rawUrlOrId) return '';
    const direct = getDirectRawUrl(rawUrlOrId);
    const targetUrl = getOptimizedImageUrl(rawUrlOrId, options.width || 600, options.quality || 82);

    // If already in memory blob cache, return immediately
    const existing = this.getCachedUrl(rawUrlOrId);
    if (existing) {
      return existing;
    }

    // De-duplicate in-flight promises
    const inflightKey = `${direct}_${options.width || 600}`;
    if (this.inflight.has(inflightKey)) {
      return this.inflight.get(inflightKey)!;
    }

    const task = (async () => {
      try {
        let objectUrl: string | null = null;
        let cache: Cache | null = null;

        // 1. Check persistent Cache Storage
        try {
          cache = await this.initCacheStorage();
          if (cache) {
            const match = await cache.match(targetUrl);
            if (match && match.ok) {
              const blob = await match.blob();
              objectUrl = URL.createObjectURL(blob);
            }
          }
        } catch {
          // Cache API error ignored
        }

        // 2. Fetch over network if not found in Cache Storage
        if (!objectUrl) {
          let response: Response | null = null;
          // Try optimized CDN URL first
          try {
            response = await fetch(targetUrl, { mode: 'cors' });
            if (!response.ok) response = null;
          } catch {
            response = null;
          }

          // Fallback to direct raw GitHub URL if CDN fails
          if (!response && direct.startsWith('http')) {
            try {
              response = await fetch(direct, { mode: 'cors' });
              if (!response.ok) response = null;
            } catch {
              response = null;
            }
          }

          if (response && response.ok) {
            try {
              if (cache) {
                // Store in persistent browser cache
                cache.put(targetUrl, response.clone()).catch(() => {});
              }
            } catch {}

            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
          }
        }

        // 3. Fallback: standard Image object decode if fetch fails
        if (!objectUrl) {
          const fallbackUrl = targetUrl || direct;
          await this.decodeImageBitmap(fallbackUrl);
          this.resolvedKeys.add(rawUrlOrId);
          this.resolvedKeys.add(direct);
          this.totalLoaded++;
          this.notify();
          return fallbackUrl;
        }

        // 4. Pre-decode bitmap into GPU memory
        await this.decodeImageBitmap(objectUrl);

        // Store in memory maps
        this.memoryBlobUrls.set(rawUrlOrId, objectUrl);
        this.memoryBlobUrls.set(direct, objectUrl);
        this.memoryBlobUrls.set(targetUrl, objectUrl);
        this.resolvedKeys.add(rawUrlOrId);
        this.resolvedKeys.add(direct);

        this.totalLoaded++;
        this.notify();
        return objectUrl;
      } catch (err) {
        console.warn(`Failed to preload image: ${rawUrlOrId}`, err);
        this.failedKeys.add(rawUrlOrId);
        this.failedKeys.add(direct);
        this.totalFailed++;
        this.notify();
        return direct || targetUrl;
      } finally {
        this.inflight.delete(inflightKey);
      }
    })();

    this.inflight.set(inflightKey, task);
    return task;
  }

  /**
   * Preload all projects in catalog
   */
  public preloadCatalog(projects: Project[]) {
    if (!projects || projects.length === 0 || typeof window === 'undefined') return;

    // Reset or update total
    const uniqueCovers = new Set<string>();
    projects.forEach(p => {
      if (p.coverArtId) {
        uniqueCovers.add(p.coverArtId);
      }
    });

    this.totalQueued = uniqueCovers.size;
    this.notify();

    // Priority 1: Window Seat and first 8 projects
    const highPriorityCovers: string[] = [];
    const lowPriorityCovers: string[] = [];

    projects.forEach((p, idx) => {
      if (!p.coverArtId) return;
      if (idx < 8 || p.title.toLowerCase().includes('window seat')) {
        highPriorityCovers.push(p.coverArtId);
      } else {
        lowPriorityCovers.push(p.coverArtId);
      }
    });

    // Queue high priority
    highPriorityCovers.forEach(url => {
      if (!this.highPriorityQueue.includes(url) && !this.isCached(url)) {
        this.highPriorityQueue.push(url);
      }
    });

    // Queue low priority
    lowPriorityCovers.forEach(url => {
      if (!this.lowPriorityQueue.includes(url) && !this.isCached(url)) {
        this.lowPriorityQueue.push(url);
      }
    });

    this.processQueue();
  }

  private processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const scheduleNext = () => {
      while (
        this.activeWorkers < this.maxConcurrency &&
        (this.highPriorityQueue.length > 0 || this.lowPriorityQueue.length > 0)
      ) {
        const nextUrl = this.highPriorityQueue.shift() || this.lowPriorityQueue.shift();
        if (!nextUrl) break;

        this.activeWorkers++;
        this.preload(nextUrl)
          .catch(() => {})
          .finally(() => {
            this.activeWorkers--;
            // Schedule next task using requestIdleCallback if available for UI smoothness
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
              window.requestIdleCallback(() => scheduleNext(), { timeout: 200 });
            } else {
              setTimeout(scheduleNext, 20);
            }
          });
      }

      if (this.highPriorityQueue.length === 0 && this.lowPriorityQueue.length === 0 && this.activeWorkers === 0) {
        this.isProcessing = false;
        this.notify();
      }
    };

    scheduleNext();
  }
}

// Export singleton instance
export const imagePreloader = new GlobalImagePreloader();

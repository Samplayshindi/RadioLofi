export function formatTrackDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatProjectRuntime(seconds: number, type?: 'Album' | 'EP' | 'Single'): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return 'Loading...';
  
  if (type === 'Single') {
    return formatTrackDuration(seconds);
  }
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const parts = [];
  if (h > 0) {
    parts.push(`${h} hr`);
  }
  if (m > 0) {
    parts.push(`${m} min`);
  } else if (h > 0) {
    parts.push(`0 min`);
  }
  if (s > 0 || parts.length === 0) {
    parts.push(`${s} sec`);
  }
  return parts.join(' ');
}

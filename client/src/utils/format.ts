/**
 * Format seconds to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format meters to km with one decimal
 */
export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1);
}

/**
 * Format elevation gain
 */
export function formatElevation(meters: number): string {
  return Math.round(meters).toString();
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

/**
 * Get TSB status text
 */
export function getTSBStatus(tsb: number): string {
  if (tsb < -30) return 'Overreached';
  if (tsb < -10) return 'Fatigued';
  if (tsb < 5) return 'Fresh';
  if (tsb < 25) return 'Optimal';
  return 'Very Fresh';
}

/**
 * Get TSB status color
 */
export function getTSBColor(tsb: number): string {
  if (tsb < -30) return '#FF3366';
  if (tsb < -10) return '#FFB800';
  if (tsb < 5) return '#00D9FF';
  if (tsb < 25) return '#00FF88';
  return '#00FF88';
}

/**
 * Get workout type color
 */
export function getWorkoutTypeColor(type: string): string {
  switch (type) {
    case 'recovery':
      return '#00FF88';
    case 'endurance':
      return '#00D9FF';
    case 'tempo':
      return '#FFB800';
    case 'intervals':
      return '#FF3366';
    case 'long':
      return '#9D4EDD';
    case 'rest':
      return '#888888';
    default:
      return '#FFFFFF';
  }
}

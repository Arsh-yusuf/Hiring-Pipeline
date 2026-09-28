import type { Stage } from '../types/candidate';

/**
 * Extract initials from a candidate name.
 * "Priya Sharma" → "PS", "John" → "JO"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Get the CSS class for the avatar background gradient based on stage.
 */
export function getAvatarClass(stage: string): string {
  const s = stage.toLowerCase();
  return `avatar-${s}`;
}

import { describe, it, expect } from 'vitest';
import { formatDuration } from '../../src/utils/date';

describe('formatDuration', () => {
  it('returns days format', () => {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    expect(formatDuration(date.toISOString())).toBe('5 days in stage');
  });

  it('returns hours format', () => {
    const date = new Date();
    date.setHours(date.getHours() - 12);
    expect(formatDuration(date.toISOString())).toContain('hour');
  });

  it('returns weeks format', () => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    expect(formatDuration(date.toISOString())).toBe('2 weeks in stage');
  });

  it('returns Just now for recent', () => {
    const date = new Date();
    expect(formatDuration(date.toISOString())).toBe('Just now');
  });
});
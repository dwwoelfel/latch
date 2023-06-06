import {timingSafeEqual} from 'crypto';

export function safeCompare(string1: string, string2: string): boolean {
  // Create Buffer objects from the strings
  const buffer1 = Buffer.from(string1, 'utf8');
  const buffer2 = Buffer.from(string2, 'utf8');

  // If the lengths aren't equal, the strings can't be equal
  if (buffer1.length !== buffer2.length) {
    return false;
  }

  // Perform a timing-safe comparison of the buffers
  return timingSafeEqual(buffer1, buffer2);
}

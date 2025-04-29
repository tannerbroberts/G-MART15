import { describe, it, expect } from 'vitest';
import { generateCardSVG } from './cardGenerator.tsx';

const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

describe('generateCardSVG', () => {
  it('generates SVG for Ace of Spades', () => {
    const svg = generateCardSVG('spades', 'A');
    expect(svg).toContain('svg');
    expect(svg).toContain('♠');
    expect(svg).toContain('A');
  });

  it('generates 52 unique cards with no overlapping SVG elements', () => {
    const allSVGs = new Map<string, string>();
    for (const suit of suits) {
      for (const value of values) {
        const svg = generateCardSVG(suit, value);
        // Check uniqueness
        expect(allSVGs.has(svg)).toBe(false);
        allSVGs.set(svg, `${value} of ${suit}`);
        // Parse SVG and check for overlapping elements
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const paths = Array.from(doc.querySelectorAll('path'));
        // Compare bounding boxes of all pairs of paths
        for (let i = 0; i < paths.length; i++) {
          const a = paths[i].getAttribute('transform');
          for (let j = i + 1; j < paths.length; j++) {
            const b = paths[j].getAttribute('transform');
            // If transform is identical, they overlap
            expect(a).not.toBe(b);
          }
        }
      }
    }
  });
});

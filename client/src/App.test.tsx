import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

describe('CardSelector', () => {
  it('renders a vertical radio group with all card values and defaults to Ace', () => {
    render(<App />);
    const aceRadio = screen.getByRole('radio', { name: 'A' });
    expect(aceRadio).toBeChecked();
    values.forEach((value) => {
      expect(screen.getByRole('radio', { name: value })).toBeInTheDocument();
    });
  });

  it('shows all four suits for the selected value', () => {
    render(<App />);
    suits.forEach((suit) => {
      expect(screen.getByText(suit)).toBeInTheDocument();
    });
    // Should show 4 suit labels
    expect(screen.getAllByText(/hearts|diamonds|clubs|spades/).length).toBe(4);
  });

  it('generates new cards when the radio selection changes', () => {
    render(<App />);
    const twoRadio = screen.getByRole('radio', { name: '2' });
    fireEvent.click(twoRadio);
    // After selecting '2', the SVGs should update to show the value '2'
    // Query all SVG elements rendered by dangerouslySetInnerHTML
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBe(4); // one for each suit
    svgElements.forEach((svg) => {
      // The value '2' should appear in the SVG text
      expect(svg.innerHTML).toContain('2');
    });
  });

  it('radio selection changes the selected value', () => {
    render(<App />);
    const jackRadio = screen.getByRole('radio', { name: 'J' });
    fireEvent.click(jackRadio);
    expect(jackRadio).toBeChecked();
  });
});

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

type Card = {
  suit: Suit;
  value: Value;
  svg: string;
};

/**
 * Generate SVG for a playing card based on value and suit
 * @param {Suit} suit - 'hearts', 'diamonds', 'clubs', or 'spades'
 * @param {Value} value - 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
 * @returns {string} SVG markup for the card
 */
function generateCardSVG(suit: Suit, value: Value): string {
  // Validate inputs
  const validSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const validValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  suit = suit.toLowerCase() as Suit;
  value = value.toString().toUpperCase() as Value;
  
  if (!validSuits.includes(suit)) {
    throw new Error(`Invalid suit: ${suit}. Must be one of: ${validSuits.join(', ')}`);
  }
  
  if (!validValues.includes(value)) {
    throw new Error(`Invalid value: ${value}. Must be one of: ${validValues.join(', ')}`);
  }
  
  // Define colors based on suit
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const color = isRed ? 'red' : 'black';
  
  // Define suit symbol
  let suitPath;
  let suitSymbol;
  
  switch (suit) {
    case 'hearts':
      suitPath = 'M10,6 C10,0 0,0 0,6 C0,12 10,18 10,18 C10,18 20,12 20,6 C20,0 10,0 10,6 Z';
      suitSymbol = '♥';
      break;
    case 'diamonds':
      suitPath = 'M10,0 L20,10 L10,20 L0,10 Z';
      suitSymbol = '♦';
      break;
    case 'clubs':
      suitPath = 'M10,18 C9,18 9,15 9,15 C4,16 3,11 6,10 C3,9 4,4 9,5 C9,5 9,2 10,2 C11,2 11,5 11,5 C16,4 17,9 14,10 C17,11 16,16 11,15 C11,15 11,18 10,18 Z';
      suitSymbol = '♣';
      break;
    case 'spades':
      suitPath = 'M10,0 C10,0 0,8 0,14 C0,16 2,20 10,18 C10,18 10,22 8,22 L12,22 C10,22 10,18 10,18 C18,20 20,16 20,14 C20,8 10,0 10,0 Z';
      suitSymbol = '♠';
      break;
  }
  
  // Generate SVG based on card value
  let pipPositions: [number, number, number][] = [];
  const isNumeric = !isNaN(parseInt(value));
  
  if (isNumeric) {
    const numValue = parseInt(value);
    // Define pip positions based on value
    switch(numValue) {
      case 1: // Ace
        pipPositions = [[40, 60, 2]]; // [x, y, scale]
        break;
      case 2:
        pipPositions = [[40, 30, 1.5], [40, 90, 1.5]];
        break;
      case 3:
        pipPositions = [[40, 30, 1.5], [40, 60, 1.5], [40, 90, 1.5]];
        break;
      case 4:
        pipPositions = [[25, 30, 1.2], [55, 30, 1.2], [25, 90, 1.2], [55, 90, 1.2]];
        break;
      case 5:
        pipPositions = [[25, 30, 1.2], [55, 30, 1.2], [40, 60, 1.2], [25, 90, 1.2], [55, 90, 1.2]];
        break;
      case 6:
        pipPositions = [[25, 30, 1.2], [55, 30, 1.2], [25, 60, 1.2], [55, 60, 1.2], [25, 90, 1.2], [55, 90, 1.2]];
        break;
      case 7:
        pipPositions = [[25, 30, 1.2], [55, 30, 1.2], [40, 45, 1.2], [25, 60, 1.2], [55, 60, 1.2], [25, 90, 1.2], [55, 90, 1.2]];
        break;
      case 8:
        pipPositions = [[25, 30, 1.2], [55, 30, 1.2], [25, 50, 1.2], [55, 50, 1.2], [25, 70, 1.2], [55, 70, 1.2], [25, 90, 1.2], [55, 90, 1.2]];
        break;
      case 9:
        pipPositions = [[25, 30, 1.1], [55, 30, 1.1], [25, 50, 1.1], [55, 50, 1.1], [40, 60, 1.1], [25, 70, 1.1], [55, 70, 1.1], [25, 90, 1.1], [55, 90, 1.1]];
        break;
      case 10:
        pipPositions = [[25, 25, 1], [55, 25, 1], [25, 45, 1], [55, 45, 1], [40, 35, 1], [40, 60, 1], [25, 75, 1], [55, 75, 1], [25, 95, 1], [55, 95, 1]];
        break;
    }
  }
  
  // Create SVG string with appropriate styling
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120" width="80" height="120">
  <!-- Card base with rounded corners -->
  <rect width="80" height="120" rx="10" ry="10" fill="white" stroke="black" stroke-width="1"/>
  
  <!-- Card value and suit in corners -->
  <text x="5" y="20" font-family="Arial, sans-serif" font-size="14" fill="${color}" font-weight="bold">${value}</text>
  <text x="5" y="35" font-family="Arial, sans-serif" font-size="14" fill="${color}" font-weight="bold">${suitSymbol}</text>
  <text x="75" y="120" font-family="Arial, sans-serif" font-size="14" fill="${color}" font-weight="bold" text-anchor="end" transform="rotate(180 75 120)">${value}</text>
  <text x="75" y="105" font-family="Arial, sans-serif" font-size="14" fill="${color}" font-weight="bold" text-anchor="end" transform="rotate(180 75 105)">${suitSymbol}</text>`;
  
  // Add pips for numeric cards
  if (isNumeric) {
    for (const [x, y, scale] of pipPositions) {
      svg += `
  <path d="${suitPath}" fill="${color}" transform="translate(${x - 10 * scale}, ${y - 10 * scale}) scale(${scale})"/>`;
    }
  } 
  // For face cards, add simple text representation
  else {
    svg += `
  <text x="40" y="70" font-family="Arial, sans-serif" font-size="32" fill="${color}" font-weight="bold" text-anchor="middle">${value}${suitSymbol}</text>`;
  }
  
  // Close svg tag
  svg += `
</svg>`;
  
  return svg;
}

/**
 * Function to create multiple cards
 * @param {Suit[]} suits - Array of suits
 * @param {Value[]} values - Array of values
 * @returns {Card[]} Array of card objects
 */
function generateDeck(suits: Suit[], values: Value[]): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit: suit,
        value: value,
        svg: generateCardSVG(suit, value)
      });
    }
  }
  return deck;
}

export { generateCardSVG, generateDeck };
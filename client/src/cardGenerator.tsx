type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

type Card = {
  suit: Suit;
  value: Value;
  svg: string;
};

// Type for a single pip position with x, y coordinates and scale
type PipPosition = [number, number, number]; // [x, y, scale]

// Type for pip positions map - a record of card values to arrays of pip positions
export type PipPlacementMap = {
  [key in Value]?: PipPosition[];
};

// Default pip positions used if no custom placements are provided
const DEFAULT_PIP_POSITIONS: PipPlacementMap = {
  "2": [
    [
      40,
      41,
      1.9
    ],
    [
      40,
      84,
      1.9
    ]
  ],
  "3": [
    [
      40,
      30,
      1.5
    ],
    [
      40,
      60,
      1.5
    ],
    [
      40,
      90,
      1.5
    ]
  ],
  "4": [
    [
      25,
      30,
      1.2
    ],
    [
      55,
      30,
      1.2
    ],
    [
      25,
      90,
      1.2
    ],
    [
      55,
      90,
      1.2
    ]
  ],
  "5": [
    [
      25,
      30,
      1.2
    ],
    [
      55,
      30,
      1.2
    ],
    [
      40,
      60,
      1.2
    ],
    [
      25,
      90,
      1.2
    ],
    [
      55,
      90,
      1.2
    ]
  ],
  "6": [
    [
      25,
      30,
      1.2
    ],
    [
      55,
      30,
      1.2
    ],
    [
      25,
      60,
      1.2
    ],
    [
      55,
      60,
      1.2
    ],
    [
      25,
      90,
      1.2
    ],
    [
      55,
      90,
      1.2
    ]
  ],
  "7": [
    [
      25,
      30,
      1.2
    ],
    [
      55,
      30,
      1.2
    ],
    [
      40,
      45,
      1.2
    ],
    [
      25,
      60,
      1.2
    ],
    [
      55,
      60,
      1.2
    ],
    [
      25,
      90,
      1.2
    ],
    [
      55,
      90,
      1.2
    ]
  ],
  "8": [
    [
      25,
      30,
      1.2
    ],
    [
      55,
      30,
      1.2
    ],
    [
      25,
      50,
      1.2
    ],
    [
      55,
      50,
      1.2
    ],
    [
      25,
      70,
      1.2
    ],
    [
      55,
      70,
      1.2
    ],
    [
      25,
      90,
      1.2
    ],
    [
      55,
      90,
      1.2
    ]
  ],
  "9": [
    [
      25,
      30,
      1.1
    ],
    [
      55,
      30,
      1.1
    ],
    [
      25,
      50,
      1.1
    ],
    [
      55,
      50,
      1.1
    ],
    [
      40,
      60,
      1.1
    ],
    [
      25,
      70,
      1.1
    ],
    [
      55,
      70,
      1.1
    ],
    [
      25,
      90,
      1.1
    ],
    [
      55,
      90,
      1.1
    ]
  ],
  "10": [
    [
      25,
      25,
      1
    ],
    [
      55,
      25,
      1
    ],
    [
      25,
      45,
      1
    ],
    [
      55,
      45,
      1
    ],
    [
      40,
      35,
      1
    ],
    [
      40,
      60,
      1
    ],
    [
      25,
      75,
      1
    ],
    [
      55,
      75,
      1
    ],
    [
      25,
      95,
      1
    ],
    [
      55,
      95,
      1
    ]
  ],
  "A": [
    [
      40,
      60,
      2
    ]
  ],
  "J": [
    [
      40,
      60,
      2
    ]
  ],
  "Q": [
    [
      40,
      60,
      2
    ]
  ],
  "K": [
    [
      40,
      60,
      2
    ]
  ]
}

/**
 * Generate SVG for a playing card based on value and suit
 * @param {Suit} suit - 'hearts', 'diamonds', 'clubs', or 'spades'
 * @param {Value} value - 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
 * @param {PipPlacementMap} [customPipPlacements] - Optional custom pip placements to override defaults
 * @returns {string} SVG markup for the card
 */
function generateCardSVG(
  suit: Suit, 
  value: Value, 
  customPipPlacements?: PipPlacementMap
): string {
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
  
  // Get pip positions - use custom placements if provided, otherwise use defaults
  const pipPositionsMap = customPipPlacements || DEFAULT_PIP_POSITIONS;
  let pipPositions: PipPosition[] = pipPositionsMap[value] || [];
  const isRoyalOrAce = value === 'A' || value === 'J' || value === 'Q' || value === 'K';
  
  // Create SVG string with appropriate styling
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120" width="80" height="120">
  <!-- Card base with rounded corners -->
  <rect width="80" height="120" rx="10" ry="10" fill="white" stroke="black" stroke-width="1"/>
  
  <!-- Card value and suit in top left corner -->
  <text x="5" y="20" font-family="Arial, sans-serif" font-size="14" fill="${color}" font-weight="bold">${value}</text>
  <text x="5" y="35" font-family="Arial, sans-serif" font-size="14" fill="${color}" font-weight="bold">${suitSymbol}</text>
  
  <!-- Card value and suit in bottom right corner - with proper positioning -->
  <g transform="translate(75, 105) rotate(180)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="14" fill="${color}" font-weight="bold" text-anchor="start">${value}</text>
    <text x="0" y="15" font-family="Arial, sans-serif" font-size="14" fill="${color}" font-weight="bold" text-anchor="start">${suitSymbol}</text>
  </g>`;
  
  // Add pips for numeric cards or royal cards using the positions from the placement map
  for (const [x, y, scale] of pipPositions) {
    // For royal cards and ace, add the letter in the center of the pip
    if (isRoyalOrAce) {
      svg += `
  <circle cx="${x}" cy="${y}" r="${10 * scale}" fill="white" stroke="${color}" stroke-width="1" />
  <text x="${x}" y="${y + 5}" font-family="Arial, sans-serif" font-size="${14 * scale}" fill="${color}" font-weight="bold" text-anchor="middle">${value}</text>`;
    } else {
      // Regular pip for number cards
      svg += `
  <path d="${suitPath}" fill="${color}" transform="translate(${x - 10 * scale}, ${y - 10 * scale}) scale(${scale})"/>`;
    }
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
 * @param {PipPlacementMap} [customPipPlacements] - Optional custom pip placements
 * @returns {Card[]} Array of card objects
 */
function generateDeck(
  suits: Suit[], 
  values: Value[], 
  customPipPlacements?: PipPlacementMap
): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit: suit,
        value: value,
        svg: generateCardSVG(suit, value, customPipPlacements)
      });
    }
  }
  return deck;
}

/**
 * Get the default pip placements JSON
 * @returns {PipPlacementMap} The default pip placement map
 */
function getDefaultPipPlacements(): PipPlacementMap {
  return { ...DEFAULT_PIP_POSITIONS };
}

export { 
  generateCardSVG, 
  generateDeck, 
  getDefaultPipPlacements, 
  type Suit, 
  type Value, 
  type Card, 
  type PipPosition 
};
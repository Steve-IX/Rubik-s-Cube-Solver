/**
 * Standard Rubik's Cube colors
 */
export type Color = 'white' | 'yellow' | 'red' | 'orange' | 'blue' | 'green';

/**
 * Face identifiers for the cube
 */
export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

/**
 * Standard color mapping
 */
export const COLORS: Color[] = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];

/**
 * Color to hex mapping - vibrant, modern colors
 */
export const COLOR_TO_HEX: Record<Color, string> = {
  white: '#F8FAFC',
  yellow: '#FACC15',
  red: '#EF4444',
  orange: '#F97316',
  blue: '#1E40AF', // Darker blue for better visibility
  green: '#22C55E',
};

/**
 * Color to RGB mapping - vibrant normalized colors
 */
export const COLOR_TO_RGB: Record<Color, [number, number, number]> = {
  white: [0.97, 0.98, 0.99],
  yellow: [0.98, 0.80, 0.08],
  red: [0.94, 0.27, 0.27],
  orange: [0.98, 0.45, 0.09],
  blue: [0.13, 0.30, 0.85], // Darker, more visible blue
  green: [0.13, 0.77, 0.37],
};

/**
 * Get face color (for center stickers)
 */
export const FACE_TO_COLOR: Record<Face, Color> = {
  U: 'white',
  D: 'yellow',
  F: 'red',
  B: 'orange',
  R: 'blue',
  L: 'green',
};

/**
 * Color names for display
 */
export const COLOR_NAMES: Record<Color, string> = {
  white: 'White',
  yellow: 'Yellow',
  red: 'Red',
  orange: 'Orange',
  blue: 'Blue',
  green: 'Green',
};

/**
 * Face names for display
 */
export const FACE_NAMES: Record<Face, string> = {
  U: 'Up',
  D: 'Down',
  L: 'Left',
  R: 'Right',
  F: 'Front',
  B: 'Back',
};

# Rubik's Cube Solver

A modern, interactive 3D Rubik's Cube solver built with React, Three.js, and TypeScript. This application provides a complete solution for visualizing, manipulating, and solving Rubik's Cubes with an intuitive 3D interface and advanced solving algorithms.

## Features

### 3D Visualization
- Interactive 3D cube rendering using Three.js and React Three Fiber
- Smooth rotation animations with customizable speed controls
- Real-time visual feedback for all cube operations
- Responsive design that works on desktop and mobile devices

### Cube Manipulation
- Manual face rotation controls (U, D, L, R, F, B)
- Keyboard shortcuts for quick cube manipulation
- Scramble generator for random cube states
- Undo/Redo functionality for step-by-step navigation
- Move history tracking

### Solving Capabilities
- Integration with cubejs library for optimal solutions
- Web Worker-based solving to prevent UI blocking
- Step-by-step solution playback with move explanations
- Solution timeline visualization
- Customizable playback speed (0.5x to 3x)

### User Interface
- Multiple interaction modes: Play, Map, and Solve
- Color mapping interface for manual cube state input
- Cube net view for 2D representation
- Statistics panel showing move counts and solve metrics
- Clean, modern UI with Tailwind CSS styling

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **State Management**: Redux Toolkit
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Cube Solving**: cubejs library (Kociemba's two-phase algorithm)
- **Animations**: GSAP for smooth transitions

## Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Steve-IX/Rubik-s-Cube-Solver.git
cd Rubik-s-Cube-Solver
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## Usage

### Playing Mode
- Use the on-screen controls or keyboard shortcuts to rotate faces
- Click on face buttons (U, D, L, R, F, B) to rotate clockwise
- Use Shift + face key for counter-clockwise rotations
- Use number keys (2) for 180-degree rotations

### Mapping Mode
- Click on stickers in the cube net view to select them
- Use the color picker to assign colors
- Validates that each color appears exactly 9 times
- Useful for inputting a physical cube's state

### Solving Mode
- Click "Scramble" to generate a random cube state
- Click "Solve Cube" to find a solution
- Use playback controls to step through the solution
- Adjust playback speed as needed
- View move explanations for each step

## Keyboard Shortcuts

- **U, D, L, R, F, B**: Rotate corresponding face clockwise
- **Shift + U/D/L/R/F/B**: Rotate counter-clockwise
- **U/D/L/R/F/B + 2**: 180-degree rotation
- **Z**: Undo last move
- **Y**: Redo last move
- **Space**: Play/Pause solution playback

## Project Structure

```
src/
├── components/          # React components
│   ├── cube/           # 3D cube rendering components
│   ├── layout/         # Main layout components
│   ├── mapping/        # Color mapping interface
│   ├── shared/         # Shared UI components
│   └── solver/         # Solving interface components
├── engine/             # Cube manipulation logic
├── solver/             # Solving algorithms and workers
├── store/              # Redux store and slices
├── models/             # TypeScript type definitions
├── hooks/              # Custom React hooks
└── utils/              # Utility functions
```

## Architecture

### State Management
The application uses Redux Toolkit for state management with the following slices:
- **cubeSlice**: Current cube state and history
- **solveSlice**: Solution data and playback state
- **uiSlice**: UI state (sidebar, mode, etc.)
- **historySlice**: Undo/redo functionality

### Cube Solving
The solver runs in a Web Worker to prevent blocking the main thread:
- Uses cubejs library implementing Kociemba's two-phase algorithm
- Converts internal cube state to facelet string format
- Returns optimal solutions with move notation
- Handles timeouts and error cases gracefully

### 3D Rendering
The cube visualization uses:
- React Three Fiber for React integration with Three.js
- Custom cubie components with proper material properties
- Smooth rotation animations using GSAP
- Proper coordinate system mapping for accurate representation

## Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Consistent component structure
- Clear separation of concerns

### Adding Features
1. Create feature branch from main
2. Implement changes with proper TypeScript types
3. Test thoroughly in all modes
4. Submit pull request with clear description

## Known Issues

- Facelet string conversion may require adjustment for certain cube states
- Solving very complex scrambles may take up to 120 seconds
- Some browsers may have limited Web Worker support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- cubejs library by Herbert Kociemba for the solving algorithm
- Three.js community for excellent 3D graphics library
- React Three Fiber for seamless React integration

## Future Enhancements

- Support for different cube sizes (2x2, 4x4, etc.)
- Save/load cube states
- Solution sharing functionality
- Performance optimizations for mobile devices
- Additional solving algorithms
- Tutorial mode for learning cube solving


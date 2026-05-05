# HashViz Web Application

This project is a React-based Hash Algorithm Visualizer. It provides an interactive web interface to evaluate, compare, and visualize the performance and avalanche properties of several hashing algorithms.

The visualization generates a dynamic Voronoi diagram using a pixel-buffer (HTML5 Canvas) seeded by the cryptographic output, offering a stunning visual representation of the hash.

## Supported Algorithms
- FNV-1 (64-bit)
- FNV-1A (64-bit)
- Murmur3 (32-bit)
- MD5
- SHA-1
- SHA-256

## How to Run
Navigate to the `react-web` directory, install dependencies, and start the development server:

```bash
cd react-web
npm install
npm run dev
```

Visit the local URL provided by Vite (typically http://localhost:5173/) to view the visualizer.

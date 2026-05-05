import React, { useEffect, useRef } from 'react';

const PALETTE = [
    0xFBC8FCFF, 0xFDE4CFFF, 0xFFCFD2FF, 0xF1C0E8FF,
    0xCFBAF0FF, 0xA3C4F3FF, 0x8EECF5FF, 0x98F5E1FF
];

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export default function VoronoiCanvas({ hashArray }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = 256;
        const height = 256;

        if (!hashArray || hashArray.length === 0) return;

        let seed = 0;
        for (let i = 0; i < hashArray.length; i++) {
            seed ^= hashArray[i] << ((i % 4) * 8);
        }
        const rand = mulberry32(seed);

        const numSeeds = 20;
        const px = new Int32Array(numSeeds);
        const py = new Int32Array(numSeeds);
        for (let i = 0; i < numSeeds; i++) {
            px[i] = Math.floor(rand() * width);
            py[i] = Math.floor(rand() * height);
        }

        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        let ptr = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let best1 = Infinity;
                let best2 = Infinity;
                let bestSeed = 0;

                for (let i = 0; i < numSeeds; i++) {
                    const dx = px[i] - x;
                    const dy = py[i] - y;
                    const d = dx * dx + dy * dy;

                    if (d < best1) {
                        best2 = best1;
                        best1 = d;
                        bestSeed = i;
                    } else if (d < best2) {
                        best2 = d;
                    }
                }

                const edgeStrength = Math.abs(best2 - best1);
                if (edgeStrength < 190.0) {
                    data[ptr++] = 0;
                    data[ptr++] = 0;
                    data[ptr++] = 0;
                    data[ptr++] = 255;
                } else {
                    const color = PALETTE[bestSeed % PALETTE.length];
                    data[ptr++] = (color >>> 24) & 0xFF; // R
                    data[ptr++] = (color >>> 16) & 0xFF; // G
                    data[ptr++] = (color >>> 8) & 0xFF;  // B
                    data[ptr++] = 255;                   // A
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
        ctx.fillStyle = 'white';
        for (let i = 0; i < numSeeds; i++) {
            ctx.beginPath();
            ctx.arc(px[i], py[i], 2, 0, Math.PI * 2);
            ctx.fill();
        }

    }, [hashArray]);

    return (
        <canvas 
            ref={canvasRef} 
            width={256} 
            height={256} 
            style={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        />
    );
}

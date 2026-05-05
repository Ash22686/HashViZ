import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { md5, sha1, sha256, fnv1, fnv1a, murmur3_32 } from './hashUtils'
import VoronoiCanvas from './VoronoiCanvas'

const ALGORITHMS = ["FNV-1", "FNV-1A", "MD5", "SHA-1", "SHA-256", "Murmur3_32"];

function App() {
  const [input, setInput] = useState('HashViz Example Input');
  const [hashAlgo1, setHashAlgo1] = useState('MD5');
  const [hashAlgo2, setHashAlgo2] = useState('SHA-256');

  return (
    <div className="container">
      <h1>Hash Algorithm Visualizer</h1>
      <div className="input-group">
        <label>Input Data:</label>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <div className="panels">
        <HashPanel input={input} algo={hashAlgo1} onAlgoChange={setHashAlgo1} />
        <HashPanel input={input} algo={hashAlgo2} onAlgoChange={setHashAlgo2} />
      </div>
    </div>
  )
}

function HashPanel({ input, algo, onAlgoChange }) {
  const stats = useMemo(() => {
    let data = new TextEncoder().encode(input || " ");
    let modData = new Uint8Array(data);
    modData[0] ^= 1; // Flip LSB of first byte for avalanche effect

    let hashFunc;
    switch(algo) {
      case "FNV-1": hashFunc = fnv1; break;
      case "FNV-1A": hashFunc = fnv1a; break;
      case "MD5": hashFunc = md5; break;
      case "SHA-1": hashFunc = sha1; break;
      case "SHA-256": hashFunc = sha256; break;
      case "Murmur3_32": hashFunc = murmur3_32; break;
      default: hashFunc = md5; break;
    }

    const start = performance.now();
    const hash = hashFunc(data);
    const timeMs = performance.now() - start;
    const modHash = hashFunc(modData);

    let hex = "";
    let ones = 0;
    let zeros = 0;
    for (let b of hash) {
      hex += b.toString(16).padStart(2, '0');
      for (let i=0; i<8; i++) {
        if ((b & (1<<i)) !== 0) ones++;
        else zeros++;
      }
    }

    let avalancheFlips = 0;
    for (let i=0; i<hash.length; i++) {
      const xor = hash[i] ^ modHash[i];
      for (let j=0; j<8; j++) {
        if ((xor & (1<<j)) !== 0) avalancheFlips++;
      }
    }
    const maxBits = hash.length * 8;
    const avalancheRatio = (avalancheFlips / maxBits) * 100;

    return {
      hash,
      hex,
      timeMs,
      ones,
      zeros,
      bits: maxBits,
      avalancheFlips,
      avalancheRatio
    };
  }, [input, algo]);

  return (
    <div className="panel">
      <select value={algo} onChange={e => onAlgoChange(e.target.value)}>
        {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <div className="stats">
        <div className="stat-row"><span>Output Size:</span> <strong>{stats.bits} bits</strong></div>
        <div className="stat-row"><span>Execution Time:</span> <strong>{stats.timeMs.toFixed(4)} ms</strong></div>
        <div className="stat-row"><span>Hash Hex:</span> <strong style={{wordBreak: 'break-all'}}>{stats.hex}</strong></div>
        <div className="stat-row"><span>Ones Count:</span> <strong>{stats.ones} bits</strong></div>
        <div className="stat-row"><span>Zeros Count:</span> <strong>{stats.zeros} bits</strong></div>
        <div className="stat-row"><span>Avalanche Flips:</span> <strong>{stats.avalancheFlips} bits</strong></div>
        <div className="stat-row"><span>Avalanche Ratio:</span> <strong>{stats.avalancheRatio.toFixed(2)}%</strong></div>
      </div>
      <div className="voronoi-container">
        <VoronoiCanvas hashArray={stats.hash} />
      </div>
    </div>
  );
}

export default App;

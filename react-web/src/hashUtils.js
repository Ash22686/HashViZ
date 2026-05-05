// Pure JavaScript Hash Implementations (No external libraries)

export function md5(message) {
    let origLen = message.length * 8;
    let len = message.length;
    let padLen = len % 64;
    padLen = padLen < 56 ? 56 - padLen : 120 - padLen;
    let padded = new Uint8Array(len + padLen + 8);
    padded.set(message);
    padded[len] = 0x80;
    
    let view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, origLen & 0xffffffff, true);
    view.setUint32(padded.length - 4, Math.floor(origLen / 0x100000000), true);

    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    
    const s = [
        7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
        5,9,14,20, 5,9,14,20, 5,9,14,20, 5,9,14,20,
        4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
        6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21
    ];
    const K = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];

    for (let offset = 0; offset < padded.length; offset += 64) {
        let a = a0, b = b0, c = c0, d = d0;
        const chunk = new DataView(padded.buffer, padded.byteOffset + offset, 64);
        
        for (let i = 0; i < 64; i++) {
            let f, g;
            if (i < 16) {
                f = (b & c) | ((~b) & d);
                g = i;
            } else if (i < 32) {
                f = (d & b) | ((~d) & c);
                g = (5*i + 1) % 16;
            } else if (i < 48) {
                f = b ^ c ^ d;
                g = (3*i + 5) % 16;
            } else {
                f = c ^ (b | (~d));
                g = (7*i) % 16;
            }
            
            let temp = d;
            d = c;
            c = b;
            let M = chunk.getUint32(g * 4, true);
            let x = (a + f + K[i] + M) | 0;
            b = (b + ((x << s[i]) | (x >>> (32 - s[i])))) | 0;
            a = temp;
        }
        
        a0 = (a0 + a) | 0;
        b0 = (b0 + b) | 0;
        c0 = (c0 + c) | 0;
        d0 = (d0 + d) | 0;
    }
    
    let res = new Uint8Array(16);
    let resView = new DataView(res.buffer);
    resView.setUint32(0, a0, true);
    resView.setUint32(4, b0, true);
    resView.setUint32(8, c0, true);
    resView.setUint32(12, d0, true);
    return res;
}

function rol(n, c) {
    return (n << c) | (n >>> (32 - c));
}

export function sha1(message) {
    let origLen = message.length * 8;
    let len = message.length;
    let padLen = len % 64;
    padLen = padLen < 56 ? 56 - padLen : 120 - padLen;
    let padded = new Uint8Array(len + padLen + 8);
    padded.set(message);
    padded[len] = 0x80;
    let view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, Math.floor(origLen / 0x100000000), false);
    view.setUint32(padded.length - 4, origLen & 0xffffffff, false);

    let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;

    for (let offset = 0; offset < padded.length; offset += 64) {
        let w = new Uint32Array(80);
        for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
        for (let i = 16; i < 80; i++) {
            w[i] = rol(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
        }

        let a = h0, b = h1, c = h2, d = h3, e = h4;
        for (let i = 0; i < 80; i++) {
            let f, k;
            if (i < 20) { f = (b & c) | ((~b) & d); k = 0x5A827999; }
            else if (i < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
            else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
            else { f = b ^ c ^ d; k = 0xCA62C1D6; }

            let temp = (rol(a, 5) + f + e + k + w[i]) | 0;
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = temp;
        }

        h0 = (h0 + a) | 0;
        h1 = (h1 + b) | 0;
        h2 = (h2 + c) | 0;
        h3 = (h3 + d) | 0;
        h4 = (h4 + e) | 0;
    }
    
    let res = new Uint8Array(20);
    let resView = new DataView(res.buffer);
    resView.setUint32(0, h0, false);
    resView.setUint32(4, h1, false);
    resView.setUint32(8, h2, false);
    resView.setUint32(12, h3, false);
    resView.setUint32(16, h4, false);
    return res;
}

export function sha256(message) {
    let origLen = message.length * 8;
    let len = message.length;
    let padLen = len % 64;
    padLen = padLen < 56 ? 56 - padLen : 120 - padLen;
    let padded = new Uint8Array(len + padLen + 8);
    padded.set(message);
    padded[len] = 0x80;
    let view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, Math.floor(origLen / 0x100000000), false);
    view.setUint32(padded.length - 4, origLen & 0xffffffff, false);

    let h = new Uint32Array([
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);
    const k = [
        0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
        0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
        0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
        0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
        0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
        0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
        0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
        0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];

    let w = new Uint32Array(64);
    for (let offset = 0; offset < padded.length; offset += 64) {
        for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
        for (let i = 16; i < 64; i++) {
            let s0 = (w[i - 15] >>> 7 | w[i - 15] << 25) ^ (w[i - 15] >>> 18 | w[i - 15] << 14) ^ (w[i - 15] >>> 3);
            let s1 = (w[i - 2] >>> 17 | w[i - 2] << 15) ^ (w[i - 2] >>> 19 | w[i - 2] << 13) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }

        let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hs = h[7];
        for (let i = 0; i < 64; i++) {
            let S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
            let ch = (e & f) ^ (~e & g);
            let temp1 = (hs + S1 + ch + k[i] + w[i]) | 0;
            let S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = (S0 + maj) | 0;

            hs = g;
            g = f;
            f = e;
            e = (d + temp1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) | 0;
        }
        
        h[0] = (h[0] + a) | 0;
        h[1] = (h[1] + b) | 0;
        h[2] = (h[2] + c) | 0;
        h[3] = (h[3] + d) | 0;
        h[4] = (h[4] + e) | 0;
        h[5] = (h[5] + f) | 0;
        h[6] = (h[6] + g) | 0;
        h[7] = (h[7] + hs) | 0;
    }

    let res = new Uint8Array(32);
    let resView = new DataView(res.buffer);
    for (let i = 0; i < 8; i++) {
        resView.setUint32(i * 4, h[i], false);
    }
    return res;
}

export function fnv1(data) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x00000100000001B3n;
    for (let i = 0; i < data.length; i++) {
        hash = hash * prime;
        hash = BigInt.asUintN(64, hash);
        hash = hash ^ BigInt(data[i]);
    }
    return bigIntToBytes(hash);
}

export function fnv1a(data) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x00000100000001B3n;
    for (let i = 0; i < data.length; i++) {
        hash = hash ^ BigInt(data[i]);
        hash = hash * prime;
        hash = BigInt.asUintN(64, hash);
    }
    return bigIntToBytes(hash);
}

function bigIntToBytes(bi) {
    const arr = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
        arr[i] = Number(bi & 0xffn);
        bi >>= 8n;
    }
    return arr;
}

export function murmur3_32(data) {
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    let h1 = 0x9747b28c;
    const len = data.length;
    const roundedEnd = len & 0xfffffffc;

    for (let i = 0; i < roundedEnd; i += 4) {
        let k1 = (data[i] & 0xff) | ((data[i + 1] & 0xff) << 8) | ((data[i + 2] & 0xff) << 16) | (data[i + 3] << 24);
        k1 = Math.imul(k1, c1);
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = Math.imul(k1, c2);

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1 = Math.imul(h1, 5) + 0xe6546b64;
    }

    let k1 = 0;
    switch (len & 0x03) {
        case 3:
            k1 ^= (data[roundedEnd + 2] & 0xff) << 16;
        case 2:
            k1 ^= (data[roundedEnd + 1] & 0xff) << 8;
        case 1:
            k1 ^= (data[roundedEnd] & 0xff);
            k1 = Math.imul(k1, c1);
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = Math.imul(k1, c2);
            h1 ^= k1;
    }

    h1 ^= len;
    h1 ^= h1 >>> 16;
    h1 = Math.imul(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = Math.imul(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;

    return new Uint8Array([
        (h1 >>> 24) & 0xff,
        (h1 >>> 16) & 0xff,
        (h1 >>> 8) & 0xff,
        h1 & 0xff
    ]);
}

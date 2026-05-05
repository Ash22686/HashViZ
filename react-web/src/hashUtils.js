import CryptoJS from 'crypto-js';

function toWordArray(u8arr) {
    const words = [];
    for (let i = 0; i < u8arr.length; i++) {
        words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, u8arr.length);
}

function fromWordArray(wordArray) {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const u8arr = new Uint8Array(sigBytes);
    for (let i = 0; i < sigBytes; i++) {
        u8arr[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    return u8arr;
}

export function md5(data) {
    return fromWordArray(CryptoJS.MD5(toWordArray(data)));
}

export function sha1(data) {
    return fromWordArray(CryptoJS.SHA1(toWordArray(data)));
}

export function sha256(data) {
    return fromWordArray(CryptoJS.SHA256(toWordArray(data)));
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

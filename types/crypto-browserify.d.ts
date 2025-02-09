declare module 'crypto-browserify' {
    const crypto: typeof import('crypto');
    export = crypto;
} 
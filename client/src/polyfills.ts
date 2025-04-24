// This file provides polyfills for Node.js built-in modules in the browser environment

// Buffer polyfill
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Global polyfill
window.global = window;

// Process polyfill
window.process = window.process || { env: {} };

// Make sure crypto is available
if (!window.crypto) {
  window.crypto = {
    getRandomValues: function(buffer: Uint8Array) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return buffer;
    }
  } as Crypto;
}
/**
 * Encryption Service using Web Crypto API
 * Provides AES-GCM encryption/decryption for secure messaging
 */

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  /**
   * Generate a new encryption key
   */
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export a key to base64 string for storage
   */
  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Import a key from base64 string
   */
  static async importKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(keyData);
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false, // not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a message
   */
  static async encryptMessage(message: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  /**
   * Decrypt a message
   */
  static async decryptMessage(encryptedMessage: string, key: CryptoKey): Promise<string> {
    const combined = this.base64ToArrayBuffer(encryptedMessage);
    const combinedArray = new Uint8Array(combined);

    // Extract IV and encrypted data
    const iv = combinedArray.slice(0, this.IV_LENGTH);
    const encrypted = combinedArray.slice(this.IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Get stored conversation key from localStorage
   */
  static async getConversationKey(conversationId: string): Promise<CryptoKey | null> {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(`conversation_key_${conversationId}`);
      if (stored) {
        return await this.importKey(stored);
      }
      return null;
    } catch (error) {
      console.error('Failed to get conversation key:', error);
      return null;
    }
  }

  /**
   * Store conversation key in localStorage
   */
  static async storeConversationKey(conversationId: string, key: CryptoKey): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const exported = await this.exportKey(key);
      localStorage.setItem(`conversation_key_${conversationId}`, exported);
    } catch (error) {
      console.error('Failed to store conversation key:', error);
    }
  }

  /**
   * Utility: Convert ArrayBuffer to base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Utility: Convert base64 to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Default instance for convenience
export const encryptionService = new EncryptionService();

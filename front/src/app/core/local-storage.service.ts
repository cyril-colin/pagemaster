import { inject, Injectable } from '@angular/core';
import { WINDOW } from '../app.config';


export const CURRENT_PARTICIPANT_TTL = 3600; // 1 hour in seconds
export const CURRENT_PARTICIPANT_CACHE_KEY = 'currentParticipant';
export const CURRENT_GAME_SESSION_TTL = 3600; // 1 hour in seconds
export const CURRENT_GAME_SESSION_CACHE_KEY = 'currentGameSession';


interface StorageItem<T> {
  value: T,
  expiry: number,
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private window = inject(WINDOW);
  /**
   * Set an item in localStorage with optional TTL
   * @param key - The key to store the item under
   * @param value - The value to store
   * @param ttlSeconds - Time to live in seconds (0 for no expiration)
   */
  setItem<T>(key: string, value: T, ttlSeconds: number = 0): void {
    try {
      const item: StorageItem<T> = {
        value: value,
        expiry: ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : 0,
      };
      this.window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  /**
   * Get an item from localStorage
   * @param key - The key of the item to retrieve
   * @returns The stored value or null if expired/not found
   */
  getItem<T>(key: string): T | null {
    try {
      const itemStr = this.window.localStorage.getItem(key);
      if (!itemStr) {
        return null;
      }

      const item: StorageItem<T> = JSON.parse(itemStr) as StorageItem<T>;
      
      // Check if item has expired
      if (item.expiry > 0 && Date.now() > item.expiry) {
        this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  /**
   * Remove an item from localStorage
   * @param key - The key of the item to remove
   */
  removeItem(key: string): void {
    try {
      this.window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      this.window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if an item exists and is not expired
   * @param key - The key to check
   * @returns true if item exists and is valid
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage (excluding expired items)
   * @returns Array of valid keys
   */
  getKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < this.window.localStorage.length; i++) {
        const key = this.window.localStorage.key(i);
        if (key && this.hasItem(key)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Clean up expired items
   */
  cleanupExpired(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < this.window.localStorage.length; i++) {
        const key = this.window.localStorage.key(i);
        if (key) {
          const itemStr = this.window.localStorage.getItem(key);
          if (itemStr) {
            try {
              const item: StorageItem<unknown> = JSON.parse(itemStr) as StorageItem<unknown>;
              if (item.expiry > 0 && Date.now() > item.expiry) {
                keysToRemove.push(key);
              }
            } catch {
              // If parsing fails, consider it corrupted and remove it
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => this.removeItem(key));
    } catch (error) {
      console.error('Error cleaning up expired items:', error);
    }
  }
}
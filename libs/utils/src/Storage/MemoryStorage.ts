import { Storage } from '../types'

/**
 * Implements the storage API for storing objects in memory. Data stored in
 * this object only lasts as long as the program runs.
 */
export default class MemoryStorage implements Storage {
  private data = new Map<string, string>()

  /**
   * @param initial data to load into storage
   */
  public constructor(initial?: Record<string, unknown>) {
    if (initial) {
      for (const key in initial) {
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(initial, key)) {
          void this.set(key, initial[key])
        }
      }
    }
  }

  /**
   * Gets an object from storage by key.
   */
  public async get(key: string): Promise<unknown> {
    const serialized = this.data.get(key)

    if (typeof serialized === 'undefined') {
      return serialized
    }

    return JSON.parse(serialized)
  }

  /**
   * Sets an object in storage by key.
   */
  public async set(key: string, value: unknown): Promise<void> {
    this.data.set(key, JSON.stringify(value))
  }

  /**
   * Removes an object in storage by key.
   */
  public async remove(key: string): Promise<void> {
    this.data.delete(key)
  }

  /**
   * Clears all objects out of storage.
   */
  public async clear(): Promise<void> {
    this.data.clear()
  }
}

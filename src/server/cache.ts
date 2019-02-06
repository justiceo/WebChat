
export default class Cache {
  storage: Map<string, string> = new Map<string, string>();

  constructor() {}

  /**
   * Returns an json object of cached item.
   * If TTL is exceeded, delete key and return null.
   * @param key
   */
  get(key: string): any {
    const strVal = this.storage.get(key);
    return JSON.parse(strVal);
  }

  /**
   * Sets an item in the cache for the given ttl (in seconds)
   * // TODO: implement ttl when you switch to localStorage.
   * @param key
   * @param value
   * @param ttl
   */
  set(key: string, value: any, ttl = 0): string {
    if (!key) {
      // key cannot be falsy, to make retrievals safe
      throw new Error("CacheService.set(): invalid/null key: " + String(key));
    }
    const strVal = JSON.stringify(value);
    this.storage.set(key, strVal);
    return strVal;
  }
}

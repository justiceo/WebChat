
export default class Cache {
  storage = {}

  constructor() {}

  /**
   * Returns an json object of cached item.
   * If TTL is exceeded, delete key and return null.
   * @param key
   */
  get(key: string): any {
    const strVal = this.storage[key];
    if (strVal == undefined) {
      console.log("cache couldn't resolve: ", key, this.storage, "\n\n")
      return undefined;
    }
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
    this.storage[key] = strVal;
    return strVal;
  }
}


const { redis, isRedisConnected } = require('./util.RedisClient'); // adjust path as needed

/**
 * Get data from Redis cache
 * @param {string} key - Redis key
 * @returns {Promise<any|null>} - Parsed data or null if error/miss
 */

async function getCache(key) {
  if (!isRedisConnected()) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Redis GET error for key "${key}":`, err.message);
    return null;
  }
}

/**
 * Set data in Redis cache with optional expiration
 * @param {string} key - Redis key
 * @param {any} value - Data to cache
 * @param {number} ttlSeconds - Expiration in seconds (default: 1800s = 30 mins)
 */
async function setCache(key, value, ttlSeconds) {
  if (!isRedisConnected()) return null;
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.error(`Redis SET error for key "${key}":`, err.message);
  }
}

module.exports = { getCache, setCache };

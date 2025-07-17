
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

async function setCache(key, value, ttlSeconds = 1800) {
  if (!isRedisConnected()) return null;
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.error(`Redis SET error for key "${key}":`, err.message);
  }
}

async function deleteCache(key) {
  if (!isRedisConnected()) return null;
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`Redis DEL error for key "${key}":`, err.message);
  }
}

async function deleteHashField(key, field) {
  if (!isRedisConnected()) return null;
  try {
    await redis.hDel(key, field);
  } catch (err) {
    console.error(`Redis HDEL error for key "${key}", field "${field}":`, err.message);
  }
}

// 21600 = 6 hr
async function setHash(key, field, value, ttlSeconds = 21600) {
  if (!isRedisConnected()) return null;
  try {
    await redis.hSet(key, field, JSON.stringify(value));
    await redis.expire(key, ttlSeconds);
  } catch (err) {
    console.error(`Redis HSET error for ${key}:${field}`, err.message);
  }
}

async function getHashField(key, field) {
  if (!isRedisConnected()) return null;
  try {
    const val = await redis.hGet(key, field);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    console.error(`Redis HGET error for ${key}:${field}`, err.message);
    return null;
  }
}

async function getHashAll(key) {
  if (!isRedisConnected()) return null;
  try {
    const data = await redis.hGetAll(key);
    if (Object.keys(data).length === 0) return null;

    const rules = [];

    for (const k in data) {
      try {
        const parsed = JSON.parse(data[k]);
        rules.push(parsed);
      } catch (e) {
        console.warn(`Failed to parse value for key "${k}" in hash "${key}":`, e.message);
      }
    }

    return rules;
  } catch (err) {
    console.error(`Redis HGETALL error for ${key}`, err.message);
    return null;
  }
}

async function clearRedisCache() {
  try {
    console.log("Clearing cache...");

    // Clear all Redis data
    await redis.flushall();
    console.log("Redis cache cleared successfully!");
  } catch (err) {
    console.error('Error clearing Redis cache on startup:', err);
  }
}

module.exports = { getCache, setCache, deleteCache, setHash, getHashField, getHashAll, clearRedisCache, deleteHashField };

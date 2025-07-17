const { default: axios } = require('axios');
const { createClient } = require('redis');

const redis = createClient({
    url: process.env.REDIS_URL,
    socket: {
        connectTimeout: 200,      // timeout for initial connection (ms)
        reconnectStrategy: () => 2000, // retry every 2 seconds if disconnected
    }
});

// redis.on('error', (err) => console.error('Redis Error:', err));

let isRedisConnected = false;

redis.on('connect', () => {
    // console.log('Redis connected');
    isRedisConnected = true;
});

redis.on('end', () => {
    console.warn('Redis connection closed');
    isRedisConnected = false;
});

redis.on('error', (err) => {
    // console.error('Redis error:', err.message);
    isRedisConnected = false;
});

async function clearRedisCache() {
    try {
        console.log("Clearing cache...");

        // Clear all Redis data
        await redis.flushAll();
        console.log("Redis cache cleared successfully!");
        console.log('*-*-*-*-*-*-*-*-*-*-');

    } catch (err) {
        console.error('Error clearing Redis cache on startup:', err);
    }
}

(async () => {
    try {
        await redis.connect();
        console.log('Redis connectedd');
        await clearRedisCache();
        
        const warmupCache = require('./util.cacheWarmup');
        // Cache Warmup
        await warmupCache();
        console.log('*-*-*-*-*-*-*-*-*-*-');
    } catch (err) {
        console.error('Redis connection failed:', err);
    }
})();

module.exports = {
    redis,
    isRedisConnected: () => isRedisConnected,
};
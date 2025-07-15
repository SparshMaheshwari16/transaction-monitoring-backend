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
    console.log('Redis connected');
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

(async () => {
    try {
        await redis.connect();
        console.log('Redis connected');
    } catch (err) {
        console.error('Redis connection failed:', err);
    }
})();

module.exports = {
    redis,
    isRedisConnected: () => isRedisConnected,
};
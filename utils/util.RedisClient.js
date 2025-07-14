const { createClient } = require('redis');

const redis = createClient({
    url: process.env.REDISURL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.error('❌ Redis Error:', err));

(async () => {
    try {
        await redis.connect();
        console.log('✅ Redis connected');
    } catch (err) {
        console.error('❌ Redis connection failed:', err);
    }
})();

module.exports = redis;

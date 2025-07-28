// services/rulesService.js
const pool = require('../db'); // adjust this if your pool is elsewhere
const ApiError = require('../utils/util.ApiError');
const redisHelper = require('../utils/util.RedisHelper');

const dbHealthCheck = async () => {
    try {
        await pool.query('SELECT 1'); // PostgreSQL check
        return { status: "UP" }
    } catch (err) {
        console.log(`Database health check failed: ${err.message}`);
        return { status: "DOWN", err: err.message }
    }
};

const redisHealthCheck = async () => {
    const redisStatus = await redisHelper.ping(); // Redis check
    return redisStatus;
}

const allhealthCheck = async () => {
    const [dbResult, redisResult] = await Promise.allSettled([
        dbHealthCheck(),
        redisHealthCheck()
    ]);

    const details = {
        database: dbResult.status === 'fulfilled' && dbResult.value.status === "UP" ? "OK" : "DOWN",
        redis: redisResult.status === 'fulfilled' && redisResult.value === "PONG" ? "OK" : "DOWN"
    };

    const isDown = Object.values(details).includes("DOWN");

    return {
        status: isDown ? "DOWN" : "UP",
        details
    };
}

module.exports = {
    dbHealthCheck,
    redisHealthCheck,
    allhealthCheck
};

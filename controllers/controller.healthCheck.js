const healthCheckService = require('../services/service.healthCheck');
const ApiError = require('../utils/util.ApiError');
const warmupCache = require('../utils/util.cacheWarmup.js');
const { isRedisConnected, clearRedisCache } = require('../utils/util.RedisClient.js');

exports.allHealthCheck = async (req, res) => {
    const result = await healthCheckService.allhealthCheck();

    if (result.status === "DOWN") {
        throw new ApiError(503, "One or more services are down", result.details);
    }

    res.json({
        success: true,
        message: "All health checks passed",
        data: result.details
    });

};


exports.dbHealthCheck = async (req, res) => {
    const data = await healthCheckService.dbHealthCheck();
    if (data.status === "DOWN") {
        throw new ApiError(503, "Database health check failed", data.err)
    }
    res.json({
        success: true,
        message: "Database health check successful",
        data: {
            status: "UP",
            database: "Ok"
        }
    })
};


exports.redisHealthCheck = async (req, res) => {
    const redisHealth = await healthCheckService.redisHealthCheck();
    if (redisHealth === null) {
        throw new ApiError(503, "Reddis health check failed");
    }
    res.json({
        success: true,
        message: "Redis health check successful",
        data: {
            status: "UP",
            redis: "OK"
        }
    })

};

exports.redisWarmUp = async (req, res) => {
    if (!isRedisConnected()) {
        throw new ApiError(500, "Redis not Connected");
    }
    await clearRedisCache();
    await warmupCache();
    return res.json({
        success: true,
        message: "Redis cache warmup success"
    })
}

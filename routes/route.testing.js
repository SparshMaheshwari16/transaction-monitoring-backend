const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/util.asyncHandler');
const redisHelper = require('../utils/util.RedisHelper');
const { getAllActiveRules } = require('../services/service.rule');


router.get('/', asyncHandler(async (req, res) => {
    // const data = await redisHelper.getCache('rules:active');
    const data = await getAllActiveRules();
    res.json({
        msg: "Working",
        data
    })
}));

module.exports = router;

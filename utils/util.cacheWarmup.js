const userTransactionService = require('../services/service.userTransactionSummary');
const ruleService = require('../services/service.rule');
const userService = require('../services/service.user'); // Assuming this has getAllUser
const { dbHealthCheck } = require('../services/service.healthCheck');


async function warmupCache() {
    const dbStatus = (await dbHealthCheck()).status;
    if (dbStatus === "UP") {
        try {
            await ruleService.getAllRules();
            await ruleService.getAllActiveRules();
            await userTransactionService.getAllUserTransactionSummary();
            await userService.getAllUser();
            console.log('Cache warmup complete!');
        } catch (err) {
            console.error('Cache warmup failed:', err.message);
        }
    }
    else {
        console.error('Cache warmup failed Database not connected');
    }
}

module.exports = warmupCache;

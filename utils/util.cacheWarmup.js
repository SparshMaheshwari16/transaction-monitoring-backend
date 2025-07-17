const userTransactionService = require('../services/service.userTransactionSummary');
const ruleService = require('../services/service.rule');
const userService = require('../services/service.user'); // Assuming this has getAllUser


async function warmupCache() {
    try {
        console.log('Starting cache warmup...');

        await ruleService.getAllRules();
        // console.log('Rules cached');
        
        await ruleService.getAllActiveRules();
        // console.log(`Active rules cached`);

        await userTransactionService.getAllUserTransactionSummary();
        // console.log('User transaction summaries cached');

        await userService.getAllUser();
        // console.log('Users cached');

        console.log('Cache warmup complete!');
    } catch (err) {
        console.error('Cache warmup failed:', err);
    }
}

module.exports = warmupCache;

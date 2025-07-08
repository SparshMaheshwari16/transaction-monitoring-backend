// cron/monthlyTask.js
const cron = require('node-cron');
const { evaluateRule } = require('../controllers/controller.cronTest');
const asyncHandler = require('../utils/util.asyncHandler');

// Cron job: runs every 6 hr 
// To
// 1. Reset flag
// 2. Reset risk score
// 3. Evaluate Transactions

const schedule = process.env.TRANSACTION_EVALUATE || '0 */6 * * *';
cron.schedule(schedule, asyncHandler(async () => {
    console.log('Evaluating transaction task started at:', new Date().toString());
    await evaluateRule();
}));

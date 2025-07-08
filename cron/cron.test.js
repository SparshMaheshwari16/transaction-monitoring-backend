// cron/monthlyTask.js
const cron = require('node-cron');
const { testing } = require('../controllers/controller.cronTest');

// Cron pattern: At 00:00 on the 7th day of every month
cron.schedule('* * * * *', () => {
    console.log('Running task', new Date().toISOString());
    testing();
});

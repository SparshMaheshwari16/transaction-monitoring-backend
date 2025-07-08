// cron/monthlyTask.js
const cron = require('node-cron');
const { testing } = require('../controllers/controller.cronTest');

// Cron pattern
cron.schedule('* * * * *', () => {
    console.log('Running task', new Date().toISOString());
    testing();
});

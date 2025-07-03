require('dotenv').config();
console.log('----------------------------*********************----------------------------');

const express = require('express');
// const pool = require('./db/index.js');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware example (optional)
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing form data


const transactionRoutes = require('./routes/route.transactions.js');
const rulesRoutes = require('./routes/route.rules.js');
const userRoutes = require('./routes/route.user.js');
const evaluateRulesRoutes = require('./routes/route.evaluateRules.js');
const userTransSumRoutes = require('./routes/route.user_transaction_summary.js');

const ipWhitelist = require('./middlewares/middleware.ipWhiteList.js');
const authenticateApiKey = require('./middlewares/middleware.auth.js');

const evaluateRules = require('./services/ruleEvaluator.js');

// /transactions
app.use('/api/transactions', ipWhitelist, authenticateApiKey, transactionRoutes);

// /rules
app.use('/api/rules', ipWhitelist, authenticateApiKey, rulesRoutes);

// /users
app.use('/api/users', ipWhitelist, authenticateApiKey, userRoutes);

// /evaluate
app.use('/api/evaluateRule', ipWhitelist, authenticateApiKey, evaluateRulesRoutes);

// /user_transaction_summary
app.use('/api/user_trans_sum',ipWhitelist,authenticateApiKey,userTransSumRoutes)

app.use((err, req, res, next) => {
    // console.error(err.stack);
    // if (err.message === 'Invalid JSON') {
    //     return res.status(400).json({ error: 'Invalid JSON payload' });
    // }

    console.log(`err: ${err}`);
    console.error(`Error occurred on ${req.method} ${req.originalUrl}`);
    if (err.originalError) {
        console.error('Original Error:', err.originalError);
    }
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, error: err.message || 'Internal Server Error' });

});
// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Import and start cron job
require('./cron/cron.test.js');

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

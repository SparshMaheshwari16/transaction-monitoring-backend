require('dotenv').config();
console.log('----------------------------*********************----------------------------');

const express = require('express');
// const pool = require('./db/index.js');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

// Allow requests from localhost:3001
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true
}));

// Or for all origins (dev only! not for production)
// app.use(cors());

// Middleware example (optional)
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing form data


const transactionRoutes = require('./routes/route.transactions.js');
const rulesRoutes = require('./routes/route.rules.js');
const userRoutes = require('./routes/route.user.js');
const evaluateRulesRoutes = require('./routes/route.evaluateRules.js');
const userTransSumRoutes = require('./routes/route.userTransactionSummary.js');
const behavioralVariableRoutes = require('./routes/route.behavioralVariable.js');
const testingRoutes = require('./routes/route.testing.js');
const APIDocsRoutes = require('./routes/route.APIDocs.js');
const healthCheckRoutes = require('./routes/route.healthCheck.js');

const ipWhitelist = require('./middlewares/middleware.ip.js');
const authenticateApiKey = require('./middlewares/middleware.auth.js');

const path = require('path');
app.use('/custom-assets', express.static(path.join(__dirname, 'assets')));

// /transactions
app.use('/api/transactions', ipWhitelist, authenticateApiKey, transactionRoutes);

// /rules
app.use('/api/rules', ipWhitelist, authenticateApiKey, rulesRoutes);

// /users
app.use('/api/users', ipWhitelist, authenticateApiKey, userRoutes);

// /evaluate
app.use('/api/evaluateRule', ipWhitelist, authenticateApiKey, evaluateRulesRoutes);

// //behavioral-variable
app.use('/api/behavioral-variable', ipWhitelist, authenticateApiKey, behavioralVariableRoutes);

// /user_transaction_summary
app.use('/api/user_trans_sum', ipWhitelist, authenticateApiKey, userTransSumRoutes);

// /testing-route
app.use('/testing-route', ipWhitelist, authenticateApiKey, testingRoutes);

// API-Docs
app.use('/api-docs', ipWhitelist, APIDocsRoutes);

// /healthCheck
app.use('/api/health-check', ipWhitelist, authenticateApiKey, healthCheckRoutes)



app.use((err, req, res, next) => {
    // console.error(err.stack);
    // if (err.message === 'Invalid JSON') {
    //     return res.status(400).json({ error: 'Invalid JSON payload' });
    // }

    console.log(`In error handling middleware`);
    console.log(`err: ${err}`);
    console.error(`Error occurred on ${req.method} ${req.originalUrl}`);
    if (err.originalError) {
        console.error('Original Error:', err.originalError);
    }
    const status = err.statusCode || 500;
    res.status(status).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });

});
// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Import and start cron job
require('./cron/cron.test.js');

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

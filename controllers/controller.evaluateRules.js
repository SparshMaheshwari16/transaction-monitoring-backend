const pool = require('../db'); // Adjust the path to your db connection
const ruleService = require('../services/service.rule');
const ApiError = require('../utils/util.ApiError');
const transactionService = require('../services/service.transaction');
const evaluateRulesService = require('../services/service.evaluateRules');

exports.dryRunARuleOnATransaction = async (req, res) => {
    const { ruleId, transactionId } = req.params;
    if (!ruleId || !transactionId) {
        throw new ApiError(400, 'ruleId and transactionId are required')
    }
    const rule = await ruleService.getRuleById(ruleId);
    if (!rule) {
        throw new ApiError(404, "Rule not found with the given ID");
    }
    if (!rule.is_active) {
        throw new ApiError(404, "Rule is not active");
    }
    const transaction = await transactionService.getTransactionById(transactionId);
    if (!transaction) {
        throw new ApiError(404, "Transaction not found with the given ID");
    }
    const condition = rule.condition;

    // Build SELECT query only
    const needsJoin = condition.includes('uts.');

    let query;
    if (needsJoin) {
        query = `
        SELECT t.id
        FROM transactions t
        JOIN user_transaction_summary uts ON uts.user_id = t.receiver_id
        WHERE t.id = $1 AND ${condition}
      `;
    } else {
        query = `
        SELECT t.id
        FROM transactions t
        WHERE t.id = $1 AND ${condition}
      `;
    }

    const result = await pool.query(query, [transactionId]);
    const isMatch = result.rowCount > 0;


    res.json({
        message: 'This is a dry run for rule evaluation',
        rule: rule.condition,
        transaction: transaction,
        ruleMatches: isMatch,
        note: isMatch
            ? 'Transaction satisfies the rule condition'
            : 'Transaction exists but does not match the rule condition'
    });
};

// Basic evalutaion using 2 loops (rule*transaction queries)
exports.evaluateRules = async (req, res) => {
    let cnt = 0;
    const { ruleIds, transactionIds } = req.body;

    // Determine if all rules or transactions should be evaluated
    const evaluateAllRules = !Array.isArray(ruleIds) || ruleIds.length === 0;
    const evaluateAllTransactions = !Array.isArray(transactionIds) || transactionIds.length === 0;

    // Fetch relevant rules
    let rules;
    let missingRuleIds = [];
    if (evaluateAllRules) {
        rules = await ruleService.getAllActiveRules();
    } else {
        rules = await ruleService.getRulesByIds(ruleIds);
        const fetchedRuleIds = rules.map(r => r.id);
        missingRuleIds = ruleIds.filter(id => !fetchedRuleIds.includes(id));
    }

    if (!rules.length) {
        throw new ApiError(404, 'No matching rules found');
    }

    // Fetch relevant transactions
    let transactions;
    let missingTransactionIds = [];
    if (evaluateAllTransactions) {
        transactions = await transactionService.getUnevaluatedTransactions();
    } else {
        transactions = await transactionService.getTransactionsByIds(transactionIds);
        const fetchedTxnIds = transactions.map(t => t.id);
        missingTransactionIds = transactionIds.filter(id => !fetchedTxnIds.includes(id));
    }

    if (!transactions.length) {
        throw new ApiError(404, 'No matching transactions found');
    }


    const matches = [];

    for (const rule of rules) {
        const condition = rule.condition;

        const flag_level = rule.flag_level;


        const needsJoin = condition.includes('uts.');

        for (const txn of transactions) {
            let query;
            const params = [txn.id, flag_level, rule.id];

            // if (needsJoin) {
            //     query = `
            //     SELECT t.id FROM transactions t
            //     JOIN user_transaction_summary uts ON uts.user_id = t.receiver_id
            //     WHERE t.id = $1 AND ${condition}
            // `;
            // } else {
            //     query = `
            //     SELECT t.id FROM transactions t
            //     WHERE t.id = $1 AND ${condition}
            // `;
            // }

            if (needsJoin) {
                query = `
                UPDATE transactions t
                SET flag = $2 ,flagged_by_rule=$3
                FROM user_transaction_summary uts
                WHERE uts.user_id = t.receiver_id
                AND t.id = $1
                AND ${condition};
                `;
            } else {
                query = `
                UPDATE transactions t
                SET flag = $2 ,flagged_by_rule=$3
                WHERE t.id = $1
                AND ${condition};
                `;
            }
            // console.log(`rule id: ${rule.id}`);
            try {
                const result = await pool.query(query, params);

                if (result.rowCount > 0) {
                    // If the rule matched, update the user's risk score
                    const updateRiskScoreQuery = `
                    UPDATE users u
                    SET risk_score = LEAST(u.risk_score+$1, 99.99)
                    WHERE u.id= $2;
                    `;

                    const riskParams = [rule.risk_increment, txn.receiver_id];
                    await pool.query(updateRiskScoreQuery, riskParams);
                }

                matches.push({
                    ruleId: rule.id,
                    transactionId: txn.id,
                    ruleMatches: result?.rowCount > 0,
                    condition
                });
            } catch (err) {
                matches.push({
                    ruleId: rule.id,
                    transactionId: txn.id,
                    ruleMatches: false,
                    error: err.message,
                    condition
                });
            }
        }
        cnt = cnt + 100;
        console.log(`Process ${cnt} queries`);

    }


    res.json({
        message: 'Rule evaluation complete',
        totalEvaluated: matches.length,
        matches,
        missingRuleIds,
        missingTransactionIds
    });
    console.log(`Evaluating rule 1 Done`);
};

// Basic SQL-only evaluation, updates all matches
// Used promises for parellel execution
// Cons:
// 1. Not updating risk score properly
// 2. Not updating transaction flag when clash
exports.evaluateRules2 = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }

    const { ruleIds, transactionIds } = req.body;

    let cnt = 1;

    const evaluateAllRules = !Array.isArray(ruleIds) || ruleIds.length === 0;
    const evaluateAllTransactions = !Array.isArray(transactionIds) || transactionIds.length === 0;

    // Fetch rules
    let rules = evaluateAllRules ? await ruleService.getAllActiveRules() : await ruleService.getRulesByIds(ruleIds);
    const fetchedRuleIds = rules.map(r => r.id);
    const missingRuleIds = ruleIds?.filter(id => !fetchedRuleIds.includes(id)) || [];

    if (!rules.length) throw new ApiError(404, 'No matching rules found');

    // Fetch transactions
    let transactions = evaluateAllTransactions
        ? await transactionService.getUnevaluatedTransactions()
        : await transactionService.getTransactionsByIds(transactionIds);

    const fetchedTxnIds = transactions.map(t => t.id);
    const missingTransactionIds = transactionIds?.filter(id => !fetchedTxnIds.includes(id)) || [];

    if (!transactions.length) throw new ApiError(404, 'No matching transactions found');

    const txnIdSet = new Set(fetchedTxnIds); // for filtering inside SQL if needed
    const matches = [];

    const queryPromises = rules.map(rule => {
        const condition = rule.condition;
        const needsJoin = condition.includes('uts.');
        const txnFilter = evaluateAllTransactions ? '' : `t.id IN (${Array.from(txnIdSet).map(id => `'${id}'`).join(',')}) AND`;

        const query = `
            SELECT t.id as transaction_id, '${rule.id}' as rule_id
            FROM transactions t
            ${needsJoin ? 'JOIN user_transaction_summary uts ON uts.user_id = t.receiver_id' : ''}
            WHERE ${txnFilter} ${condition}
        `;

        // console.log(`count: ${cnt++} ${query}`);
        return pool.query(query)
            .then(result => result.rows.map(row => ({
                ruleId: row.rule_id,
                transactionId: row.transaction_id,
                ruleMatches: true
            })))
            .catch(err => [{
                ruleId: rule.id,
                transactionId: null,
                ruleMatches: false,
                error: err.message
            }]);
    });

    const results = await Promise.all(queryPromises);
    results.forEach(r => matches.push(...r));

    // console.log(`queryPromises`);
    // console.log(queryPromises);

    const updatePromises = [];
    const userRiskUpdates = new Map(); // user_id -> cumulative risk_increment

    for (const match of matches) {
        const rule = rules.find(r => r.id === match.ruleId);
        const txn = transactions.find(t => t.id === match.transactionId);

        if (!rule || !txn) continue;

        // Update transaction with flag and rule
        updatePromises.push(pool.query(
            `UPDATE transactions 
            SET flag = $1, flagged_by_rule = $2 
            WHERE id = $3`,
            [rule.flag_level, rule.id, txn.id]
        ));

        // Accumulate risk increment for each user
        const userId = txn.receiver_id; // assuming receiver is the target
        if (!userId) continue;

        const increment = parseFloat(rule.risk_increment);

        if (!userRiskUpdates.has(userId)) {
            userRiskUpdates.set(userId, increment);
        } else {
            userRiskUpdates.set(userId, userRiskUpdates.get(userId) + increment);
        }
    }

    // Update user risk scores
    for (const [userId, totalIncrement] of userRiskUpdates.entries()) {
        updatePromises.push(pool.query(
            `UPDATE users 
            SET risk_score = LEAST(risk_score + $1, 99.99)
            WHERE id = $2`,
            [totalIncrement, userId]
        ));
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    res.json({
        message: 'SQL-only rule evaluation complete',
        totalEvaluated: matches.length,
        matches,
        missingRuleIds,
        missingTransactionIds,
    });

    console.log(`Evaluating rule 2 Done`);
};
// Risk Update Logic : Cumulative across all rule hits 
exports.evaluateRules21 = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }

    const { ruleIds, transactionIds } = req.body;

    const evaluateAllRules = !Array.isArray(ruleIds) || ruleIds.length === 0;
    const evaluateAllTransactions = !Array.isArray(transactionIds) || transactionIds.length === 0;

    // Define flag priority
    const flagPriority = { low: 1, medium: 2, high: 3 };

    // Fetch rules
    let rules = evaluateAllRules
        ? await ruleService.getAllActiveRules()
        : await ruleService.getRulesByIds(ruleIds);

    const fetchedRuleIds = rules.map(r => r.id);
    const missingRuleIds = ruleIds?.filter(id => !fetchedRuleIds.includes(id)) || [];

    if (!rules.length) throw new ApiError(404, 'No matching rules found');

    // Fetch transactions
    let transactions = evaluateAllTransactions
        ? await transactionService.getUnevaluatedTransactions()
        : await transactionService.getTransactionsByIds(transactionIds);

    const fetchedTxnIds = transactions.map(t => t.id);
    const missingTransactionIds = transactionIds?.filter(id => !fetchedTxnIds.includes(id)) || [];

    if (!transactions.length) throw new ApiError(404, 'No matching transactions found');

    const txnIdSet = new Set(fetchedTxnIds);
    const matches = [];

    const queryPromises = rules.map(rule => {
        const condition = rule.condition;
        const needsJoin = condition.includes('uts.');
        const txnFilter = evaluateAllTransactions
            ? ''
            : `t.id IN (${Array.from(txnIdSet).map(id => `'${id}'`).join(',')}) AND`;

        const query = `
            SELECT t.id as transaction_id, '${rule.id}' as rule_id
            FROM transactions t
            ${needsJoin ? 'JOIN user_transaction_summary uts ON uts.user_id = t.receiver_id' : ''}
            WHERE ${txnFilter} ${condition}
        `;
        // console.log(query);
        return pool.query(query)
            .then(result => result.rows.map(row => ({
                ruleId: row.rule_id,
                transactionId: row.transaction_id,
                ruleMatches: true
            })))
            .catch(err => [{
                ruleId: rule.id,
                transactionId: null,
                ruleMatches: false,
                error: err.message
            }]);
    });

    const results = await Promise.all(queryPromises);
    results.forEach(r => matches.push(...r));

    const txnBestRuleMap = new Map(); // transactionId -> { flagLevel, ruleId }
    const userRiskUpdates = new Map(); // userId -> cumulative risk_increment

    for (const match of matches) {
        const rule = rules.find(r => r.id === match.ruleId);
        const txn = transactions.find(t => t.id === match.transactionId);

        if (!rule || !txn) continue;

        const txnId = txn.id;
        const newFlag = rule.flag_level;

        const current = txnBestRuleMap.get(txnId);

        if (!current || flagPriority[newFlag] > flagPriority[current.flagLevel]) {
            txnBestRuleMap.set(txnId, {
                flagLevel: newFlag,
                ruleId: rule.id,
                riskIncrement: parseFloat(rule.risk_increment),
                userId: txn.receiver_id
            });
        }
        // Accumulate user risk increment
        const userId = txn.receiver_id;
        if (!userId) continue;

        const increment = parseFloat(rule.risk_increment);
        if (!userRiskUpdates.has(userId)) {
            userRiskUpdates.set(userId, increment);
        } else {
            userRiskUpdates.set(userId, userRiskUpdates.get(userId) + increment);
        }
    }

    const updatePromises = [];

    // Apply the most severe rule per transaction
    for (const [txnId, { flagLevel, ruleId }] of txnBestRuleMap.entries()) {
        updatePromises.push(pool.query(
            `UPDATE transactions 
             SET flag = $1, flagged_by_rule = $2 
             WHERE id = $3`,
            [flagLevel, ruleId, txnId]
        ));
    }

    // Update risk scores
    for (const [userId, totalIncrement] of userRiskUpdates.entries()) {
        updatePromises.push(pool.query(
            `UPDATE users 
             SET risk_score = LEAST(risk_score + $1, 99.99)
             WHERE id = $2`,
            [totalIncrement, userId]
        ));
    }

    await Promise.all(updatePromises);

    res.json({
        message: 'SQL-only rule evaluation complete',
        totalEvaluated: matches.length,
        matches,
        missingRuleIds,
        missingTransactionIds,
    });

    console.log(`Evaluating rule 2.1 Done`);
};
// Same as 21 but ties user risk update only to best rule
exports.evaluateRules22 = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }

    const { ruleIds, transactionIds } = req.body;

    const evaluateAllRules = !Array.isArray(ruleIds) || ruleIds.length === 0;
    const evaluateAllTransactions = !Array.isArray(transactionIds) || transactionIds.length === 0;

    // Define flag priority
    const flagPriority = { low: 1, medium: 2, high: 3 };

    // Fetch rules
    let rules = evaluateAllRules
        ? await ruleService.getAllActiveRules()
        : await ruleService.getRulesByIds(ruleIds);

    const fetchedRuleIds = rules.map(r => r.id);
    const missingRuleIds = ruleIds?.filter(id => !fetchedRuleIds.includes(id)) || [];

    if (!rules.length) throw new ApiError(404, 'No matching rules found');

    // Fetch transactions
    let transactions = evaluateAllTransactions
        ? await transactionService.getUnevaluatedTransactions()
        : await transactionService.getTransactionsByIds(transactionIds);

    const fetchedTxnIds = transactions.map(t => t.id);
    const missingTransactionIds = transactionIds?.filter(id => !fetchedTxnIds.includes(id)) || [];

    if (!transactions.length) throw new ApiError(404, 'No matching transactions found');

    const txnIdSet = new Set(fetchedTxnIds);
    const matches = [];

    // Run SQL queries for each rule
    const queryPromises = rules.map(rule => {
        const condition = rule.condition;
        const needsJoin = condition.includes('uts.');
        const txnFilter = evaluateAllTransactions
            ? ''
            : `t.id IN (${Array.from(txnIdSet).map(id => `'${id}'`).join(',')}) AND`;

        const query = `
            SELECT t.id as transaction_id, '${rule.id}' as rule_id
            FROM transactions t
            ${needsJoin ? 'JOIN user_transaction_summary uts ON uts.user_id = t.receiver_id' : ''}
            WHERE ${txnFilter} ${condition}
        `;

        return pool.query(query)
            .then(result => result.rows.map(row => ({
                ruleId: row.rule_id,
                transactionId: row.transaction_id,
                ruleMatches: true
            })))
            .catch(err => [{
                ruleId: rule.id,
                transactionId: null,
                ruleMatches: false,
                error: err.message
            }]);
    });

    const results = await Promise.all(queryPromises);
    results.forEach(r => matches.push(...r));

    const txnBestRuleMap = new Map(); // transactionId -> { flagLevel, ruleId, riskIncrement, userId }
    const userRiskUpdates = new Map(); // userId -> cumulative risk_increment

    // Determine best rule per transaction
    for (const match of matches) {
        const rule = rules.find(r => r.id === match.ruleId);
        const txn = transactions.find(t => t.id === match.transactionId);

        if (!rule || !txn) continue;

        const txnId = txn.id;
        const newFlag = rule.flag_level;

        const current = txnBestRuleMap.get(txnId);

        if (!current || flagPriority[newFlag] > flagPriority[current.flagLevel]) {
            txnBestRuleMap.set(txnId, {
                flagLevel: newFlag,
                ruleId: rule.id,
                riskIncrement: parseFloat(rule.risk_increment),
                userId: txn.receiver_id
            });
        }
    }

    const updatePromises = [];

    // Apply the best rule per transaction and accumulate risk
    for (const [txnId, { flagLevel, ruleId, riskIncrement, userId }] of txnBestRuleMap.entries()) {
        // Update transaction with best rule
        updatePromises.push(pool.query(
            `UPDATE transactions 
             SET flag = $1, flagged_by_rule = $2 
             WHERE id = $3`,
            [flagLevel, ruleId, txnId]
        ));

        // Accumulate user risk increment
        if (userId) {
            if (!userRiskUpdates.has(userId)) {
                userRiskUpdates.set(userId, riskIncrement);
            } else {
                userRiskUpdates.set(userId, userRiskUpdates.get(userId) + riskIncrement);
            }
        }
    }

    // Update user risk scores
    for (const [userId, totalIncrement] of userRiskUpdates.entries()) {
        updatePromises.push(pool.query(
            `UPDATE users 
             SET risk_score = LEAST(risk_score + $1, 99.99)
             WHERE id = $2`,
            [totalIncrement, userId]
        ));
    }

    Promise.all(updatePromises);

    res.json({
        message: 'SQL-only rule evaluation complete',
        totalEvaluated: matches.length,
        matches,
        missingRuleIds,
        missingTransactionIds,
    });

    console.log(`Evaluating rule 2.2 Done`);
};

// const pLimit = require('p-limit').default;
// const limit = pLimit(10); // Tune this limit based on DB load
const redisHelper = require('../utils/util.RedisHelper');

// exports.evaluateRules23 = async (req, res) => {
//     if (!req.body || Object.keys(req.body).length === 0) {
//         throw new ApiError(400, 'Request body is required');
//     }

//     const { ruleIds, transactionIds } = req.body;

//     // Fetch from Redis
//     const allRules = await ruleService.getAllActiveRules(); // Assume returns array
//     const allTransactions = await transactionService.getUnevaluatedTransactions() // Assume returns array
//     const allUTS = await redisHelper.getHashAll('user:summary') // Assume returns array

//     // Filter if needed
//     const rules = (!ruleIds || ruleIds.length === 0) ? allRules : allRules.filter(r => ruleIds.includes(r.id));
//     const transactions = (!transactionIds || transactionIds.length === 0) ? allTransactions : allTransactions.filter(t => transactionIds.includes(t.id));

//     if (rules.length === 0 || transactions.length === 0) {
//         throw new ApiError(404, 'No matching rules or transactions found');
//     }

//     const flagPriority = { low: 1, medium: 2, high: 3 };
//     const matches = [];

//     // Convert UTS array to map for fast lookup
//     const utsMap = new Map(allUTS.map(u => [u.user_id, u]));

//     // Parallel rule evaluation
//     const evalTasks = [];

//     for (const rule of rules) {
//         for (const txn of transactions) {
//             evalTasks.push(limit(async () => {
//                 const context = {
//                     t: txn,
//                     uts: utsMap.get(txn.receiver_id) || {},
//                 };

//                 try {
//                     // Eval is risky; prefer sandboxed interpreters for production
//                     const result = eval(rule.condition); // Ex: "t.amount > 1000 && uts.txn_count_30 > 5"
//                     if (result) {
//                         matches.push({
//                             ruleId: rule.id,
//                             transactionId: txn.id,
//                             ruleMatches: true,
//                         });
//                     }
//                 } catch (e) {
//                     console.error(`Error evaluating rule ${rule.id} on txn ${txn.id}:`, e);
//                 }
//             }));
//         }
//     }

//     await Promise.all(evalTasks);

//     // Determine best rule per txn
//     const txnBestRuleMap = new Map();
//     const userRiskUpdates = new Map();

//     for (const match of matches) {
//         const rule = rules.find(r => r.id === match.ruleId);
//         const txn = transactions.find(t => t.id === match.transactionId);
//         if (!rule || !txn) continue;

//         const txnId = txn.id;
//         const newFlag = rule.flag_level;
//         const current = txnBestRuleMap.get(txnId);

//         if (!current || flagPriority[newFlag] > flagPriority[current.flagLevel]) {
//             txnBestRuleMap.set(txnId, {
//                 flagLevel: newFlag,
//                 ruleId: rule.id,
//                 riskIncrement: parseFloat(rule.risk_increment),
//                 userId: txn.receiver_id,
//             });
//         }
//     }

//     const updatePromises = [];

//     for (const [txnId, { flagLevel, ruleId, riskIncrement, userId }] of txnBestRuleMap.entries()) {
//         updatePromises.push(pool.query(
//             `UPDATE transactions SET flag = $1, flagged_by_rule = $2 WHERE id = $3`,
//             [flagLevel, ruleId, txnId]
//         ));

//         if (userId) {
//             const current = userRiskUpdates.get(userId) || 0;
//             userRiskUpdates.set(userId, current + riskIncrement);
//         }
//     }

//     for (const [userId, increment] of userRiskUpdates.entries()) {
//         updatePromises.push(pool.query(
//             `UPDATE users SET risk_score = LEAST(risk_score + $1, 99.99) WHERE id = $2`,
//             [increment, userId]
//         ));
//     }

//     await Promise.all(updatePromises);

//     res.json({
//         message: 'Parallel rule evaluation complete',
//         totalEvaluated: matches.length,
//         matches,
//     });

//     console.log(`✅ evaluateRules22 finished with ${matches.length} matches`);
// };


// Modular
exports.evaluateRules3 = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }

    const { ruleIds, transactionIds } = req.body;

    const { rules, missingRuleIds } = await evaluateRulesService.fetchRules(ruleIds);
    const { transactions, missingTransactionIds, txnIdSet } = await evaluateRulesService.fetchTransactions(transactionIds);
    const matches = await evaluateRulesService.evaluateRules(rules, txnIdSet, transactionIds);
    await evaluateRulesService.applyRuleEffects(matches, rules, transactions);

    res.json({
        message: 'SQL-only rule evaluation complete',
        totalEvaluated: matches.length,
        matches,
        missingRuleIds,
        missingTransactionIds
    });

    console.log(`Evaluating rule 3 Done`);
};


exports.getEvaluationResults = async (req, res) => {
    try {
        const query = `
            SELECT receiver_id, flag, COUNT(*) AS transaction_count
            FROM transactions
            WHERE flag IS NOT NULL
            GROUP BY receiver_id, flag
            ORDER BY receiver_id
        `;

        const { rows } = await pool.query(query);
        const receiverIds = [...new Set(rows.map(row => row.receiver_id))];

        // Already parsed user objects
        const redisUserValues = await redisHelper.getHashFields('user:byId', receiverIds);

        const userMap = {};
        redisUserValues.forEach((user, idx) => {
            if (user) {
                userMap[receiverIds[idx]] = user.name;
            }
        });

        const finalData = rows.map(row => ({
            username: userMap[row.receiver_id] || row.receiver_id,
            flag: row.flag,
            transaction_count: row.transaction_count
        }));

        return res.json({
            success: true,
            data: finalData
        });
    } catch (error) {
        console.error('Error fetching evaluation results:', error);
        throw new ApiError(500, 'Failed to fetch evaluation results');
    }
};

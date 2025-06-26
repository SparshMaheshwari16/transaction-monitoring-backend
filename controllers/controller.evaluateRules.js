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
    if(!rule.is_active){
        throw new ApiError(404,"Rule is not active");
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

exports.evaluateRules = async (req, res) => {
    let cnt = 0;
    const { ruleIds, transactionIds } = req.body;

    // Determine if all rules or transactions should be evaluated
    const evaluateAllRules = !Array.isArray(ruleIds) || ruleIds.length === 0;
    const evaluateAllTransactions = !Array.isArray(transactionIds) || transactionIds.length === 0;

    // console.log(`evaluateAllRules: ${evaluateAllRules}`);
    // console.log(`evaluateAllTransactions: ${evaluateAllTransactions}`);

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



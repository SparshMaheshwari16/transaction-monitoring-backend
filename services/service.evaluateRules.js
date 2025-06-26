const pool = require('../db'); // adjust to your db file
const ruleService = require('./service.rule');
const transactionService = require('./service.transaction');
const ApiError = require('../utils/util.ApiError'); // or wherever it's defined

async function fetchRules(ruleIds) {
    const evaluateAllRules = !Array.isArray(ruleIds) || ruleIds.length === 0;
    const rules = evaluateAllRules
        ? await ruleService.getAllActiveRules()
        : await ruleService.getRulesByIds(ruleIds);

    if (!rules.length) throw new ApiError(404, 'No matching rules found');
    const fetchedRuleIds = rules.map(r => r.id);
    const missingRuleIds = ruleIds?.filter(id => !fetchedRuleIds.includes(id)) || [];
    return { rules, missingRuleIds };
}

async function fetchTransactions(transactionIds) {
    const evaluateAllTransactions = !Array.isArray(transactionIds) || transactionIds.length === 0;
    const transactions = evaluateAllTransactions
        ? await transactionService.getUnevaluatedTransactions()
        : await transactionService.getTransactionsByIds(transactionIds);

    if (!transactions.length) throw new ApiError(404, 'No matching transactions found');
    const fetchedTxnIds = transactions.map(t => t.id);
    const missingTransactionIds = transactionIds?.filter(id => !fetchedTxnIds.includes(id)) || [];
    const txnIdSet = new Set(fetchedTxnIds);
    return { transactions, missingTransactionIds, txnIdSet };
}

async function evaluateRules(rules, txnIdSet, transactionIds) {
    const evaluateAllTransactions = !Array.isArray(transactionIds) || transactionIds.length === 0;
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
    return matches;
}

async function applyRuleEffects(matches, rules, transactions) {
    const updatePromises = [];
    const userRiskUpdates = new Map();

    for (const match of matches) {
        const rule = rules.find(r => r.id === match.ruleId);
        const txn = transactions.find(t => t.id === match.transactionId);
        if (!rule || !txn) continue;

        updatePromises.push(pool.query(
            `UPDATE transactions 
            SET flag = $1, flagged_by_rule = $2 
            WHERE id = $3`,
            [rule.flag_level, rule.id, txn.id]
        ));

        const userId = txn.receiver_id;
        if (!userId) continue;
        const increment = parseFloat(rule.risk_increment);
        userRiskUpdates.set(userId, (userRiskUpdates.get(userId) || 0) + increment);
    }

    for (const [userId, totalIncrement] of userRiskUpdates.entries()) {
        updatePromises.push(pool.query(
            `UPDATE users 
            SET risk_score = LEAST(risk_score + $1, 99.99)
            WHERE id = $2`,
            [totalIncrement, userId]
        ));
    }

    await Promise.all(updatePromises);
}

module.exports = {
    fetchRules,
    fetchTransactions,
    evaluateRules,
    applyRuleEffects
};

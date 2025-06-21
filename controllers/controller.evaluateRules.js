const pool = require('../db'); // Adjust the path to your db connection
const ruleService = require('../services/service.rule');
const ApiError = require('../utils/util.ApiError');
const transactionService = require('../services/service.transaction');

exports.dryRunARuleOnATransaction = async (req, res) => {
    const { ruleId, transactionId } = req.params;
    if (!ruleId || !transactionId) {
        throw new ApiError(400, 'ruleId and transactionId are required')
    }
    const rule = await ruleService.getRuleById(ruleId);
    // const transaction = await transactionService.getTransactionById(transactionId);
    if (!rule) {
        throw new ApiError(404, "Rule not found with the given ID");
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

    res.json({
        message: 'This is a dry run for rule evaluation',
        rule: rule,
        // transaction: transaction
        result: result.rowCount
    });

};

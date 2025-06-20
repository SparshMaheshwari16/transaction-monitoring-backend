const pool = require('../db'); // Adjust the path to your db connection

exports.dryRunARuleOnATransaction = async (req, res) => {
    const { ruleId, transactionId } = req.params;

    console.log('Received ruleId:', ruleId);
    console.log('Received transactionId:', transactionId);
    
    res.json({
        messwage: 'This is a dry run for rule evaluation',
        ruleId: ruleId,
        transactionId: transactionId
    });
};

const axios = require('axios');

exports.evaluateRule = async () => {
    const server = process.env.BASE_URL;

    const resetFlagApi = `${server}/api/transactions/reset-flag`;
    const resetRiskScoreApi = `${server}/api/users/reset-risk-score`;
    const evaluateRuleApi = `${server}/api/evaluateRule/2.2`;

    const apiKey = process.env.API_KEY;
    const config = {
        headers: {
            'x-api-key': apiKey,
        },
    };

    // Run API 1 and API 2 in parallel
    const [res1, res2] = await Promise.all([
        axios.patch(resetFlagApi, null, config),
        axios.patch(resetRiskScoreApi, null, config)
    ]);

    console.log('Reset flag response status:', res1.status);
    console.log('Reset risk score response status:', res2.status);

    // After both are done, run API 3
    const res3 = await axios.post(evaluateRuleApi, {
        "ruleIds": [],
        "transactionIds": []
    }, config);
    console.log('Evalute transaction response status:', res3.status);
};

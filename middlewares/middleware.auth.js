const ApiError = require("../utils/util.ApiError");

function authenticateApiKey(req, res, next) {
    const clientKey = req.headers['x-api-key'];

    if (!clientKey || clientKey !== process.env.API_KEY) {
        throw new ApiError(401,'Unauthorized: Invalid or missing API Key');
        // return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    }

    next(); // Proceed if key is valid
}

module.exports = authenticateApiKey;

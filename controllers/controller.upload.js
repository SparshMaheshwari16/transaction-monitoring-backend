const uploadService = require('../services/service.upload');
const { dbHealthCheck } = require('../services/service.healthCheck');
const ApiError = require('../utils/util.ApiError');
const transactionService = require('../services/service.transaction');

exports.uploadTransactions = async (req, res) => {
    await transactionService.deleteAllTrasactions();
    const filePath = req.file?.path;

    if (!filePath) {
        throw new ApiError(400, 'CSV file is missing');
    }

    const dbStatus = (await dbHealthCheck()).status;

    if (dbStatus === 'DOWN') {
        throw new ApiError(500, 'DB not connected');
    }

    const result = await uploadService.processCsvFile(filePath);

    if (!result.success) {
        throw new ApiError(500, result.error || 'Error processing CSV file')
    }

    res.status(200).json({
        success: true,
        message: `Inserted ${result.insertedCount} transactions`,
    });

};

const pool = require('../db'); // Adjust the path to your db connection
const ApiError = require('../utils/util.ApiError');
const behavioralVariableService = require('../services/service.behavioralVariable');

exports.test = async (req, res) => {
    res.status(201).json({
        success: true,
        message: 'Successfully',
    });
};

exports.getAll = async (req, res) => {

    const result = await behavioralVariableService.getAll();

    if (!result || result.length === 0) {
        throw new ApiError(404, 'No data found');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched all result successfully',
        data: result
    });
};


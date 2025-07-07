const pool = require('../db'); // Adjust the path to your db connection
const ApiError = require('../utils/util.ApiError');

exports.test = async (req, res) => {
    
    res.status(201).json({
        success: true,
        message: 'Successfully',
    });
};

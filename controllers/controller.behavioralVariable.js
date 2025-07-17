const pool = require('../db'); // Adjust the path to your db connection
const ApiError = require('../utils/util.ApiError');
const behavioralVariableService = require('../services/service.behavioralVariable');

exports.getAllBehavioralVariable = async (req, res) => {

    const result = await behavioralVariableService.getAllBehavioralVariable();

    if (!result || result.length === 0) {
        throw new ApiError(404, 'No data found');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched all result successfully',
        data: result
    });
};

exports.updateAllActiveVariables = async (req, res) => {
    const { rows: variables } = await pool.query(`
    SELECT * FROM behavioral_variables_definitions
    WHERE is_active = TRUE
  `);
    if (!variables || variables.length === 0) {
        throw new ApiError(404, 'No rules found');
    }

    let result = [];
    for (const variable of variables) {
        const { variable_name, target_table, target_column, sql_template } = variable;

        const wrappedQuery = `
      UPDATE ${target_table} uts
      SET ${target_column} = data.value,
          last_updated = CURRENT_TIMESTAMP
      FROM (${sql_template}) AS data
      WHERE uts.user_id = data.user_id;
    `;

        const { rows } = await pool.query(wrappedQuery);
        console.log(rows);
        console.log(`Updated variable: ${variable_name}`);
        result.push({
            wrappedQuery, rows
        })
    }

    return res.status(200).json({
        success: true,
        message: 'All active behavioral variables updated successfully.',
        result
    });
};


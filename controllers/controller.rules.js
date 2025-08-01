const ruleService = require('../services/service.rule');
const ApiError = require('../utils/util.ApiError');

exports.getAllRules = async (req, res) => {

    const rules = await ruleService.getAllRules()

    if (!rules || rules.length === 0) {
        throw new ApiError(404, 'No rules found');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched all rules successfully',
        data: rules
    });
};

exports.getAllActiveRules = async (req, res) => {
    const activeRules = await ruleService.getAllActiveRules();

    if (!activeRules || activeRules.length === 0) {
        throw new ApiError(404, 'No active rules found');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched all active rules successfully',
        data: activeRules
    });
};
exports.getAllInactiveRules = async (req, res) => {
    const inactiveRules = await ruleService.getAllInactiveRules();

    if (!inactiveRules || inactiveRules.length === 0) {
        throw new ApiError(404, 'No inactive rules found');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched all inactive rules successfully',
        data: inactiveRules
    });
};
exports.getRuleById = async (req, res) => {
    const ruleId = req.params.id;
    if (!ruleId) {
        throw new ApiError(400, 'Rule ID is required');
    }

    const result = await ruleService.getRuleById(ruleId);
    if (!result) {
        throw new ApiError(404, 'Rule not found');
    }


    res.status(200).json({
        success: true,
        message: 'Fetched a rule by id successfully',
        data: result
    });
};
exports.getRulesByIds = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, 'A non-empty array of Rule IDs is required');
    }

    const rules = await ruleService.getRulesByIds(ids);

    const foundIds = rules.map(rule => rule.id);
    const missingIds = ids.filter(id => !foundIds.includes(id));

    if (!rules || rules.length === 0) {
        throw new ApiError(404, 'No rules found for the provided IDs');
    }
    res.status(200).json({
        success: true,
        message: 'Fetched rules successfully',
        data: rules,
        missingIds: missingIds.length > 0 ? missingIds : undefined
    });
}
exports.createRule = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }
    const { name, condition, flag_level, risk_increment, description } = req.body;

    if (!name || !condition || !flag_level || !risk_increment || !description) {
        throw new ApiError(400, 'Missing required fields');
    }


    const result = await ruleService.createRule(name, condition, flag_level, risk_increment, description);
    if (!result) {
        throw new ApiError(500, 'Failed to create rule');
    }
    res.status(200).json({
        success: true,
        message: 'Rule created successfully',
        data: result
    });
};

exports.deleteRule = async (req, res) => {
    const ruleId = req.params.id;

    if (!ruleId) {
        throw new ApiError(400, 'Rule ID is required');
    }

    const result = await ruleService.deleteRule(ruleId);
    if (!result) {
        throw new ApiError(404, 'Rule not found');
    }

    res.status(200).json({
        success: true,
        message: 'Rule deleted successfully',
        data: result
    });
};

exports.updateRule = async (req, res) => {
    const ruleId = req.params.id;
    if (!ruleId) {
        throw new ApiError(400, 'Rule ID is required');
    }
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Request body is required');
    }
    const { name, condition, flag_level, risk_increment } = req.body;

    if (!name || !condition || !flag_level || !risk_increment) {
        throw new ApiError(400, 'Missing required fields');
    }

    const result = await ruleService.updateRule(ruleId, name, condition, flag_level, risk_increment);


    if (!result) {
        throw new ApiError(404, 'Rule not found');
    }

    res.status(200).json({
        success: true,
        message: 'Rule updated successfully',
        data: result
    });
};

exports.toggleActiveRule = async (req, res) => {
    const ruleId = req.params.id;

    if (!ruleId) {
        throw new ApiError(400, 'Rule ID is required');
    }
    const result = await ruleService.toggleActiveRule(ruleId);
    if (!result) {
        throw new ApiError(404, 'Rule not found');
    }
    res.status(200).json({
        success: true,
        message: 'Rule active status toggled successfully',
        data: result
    });
};



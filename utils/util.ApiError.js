class ApiError extends Error {
    constructor(statusCode, message,originalError = null) {
        super(message);
        this.statusCode = statusCode;
        this.originalError = originalError;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;

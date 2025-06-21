const ApiError = require("../utils/util.ApiError");

const allowedIPs = [
    '::1',             // localhost IPv6
    '127.0.0.1',       // localhost IPv4
    '::ffff:127.0.0.1' // sometimes Express formats it like this
    // 'xx.xx.xx.xx',   // Add your real server/public IPs here
];

function ipWhitelist(req, res, next) {
    const requestIP = req.ip || req.connection.remoteAddress;

    if (allowedIPs.includes(requestIP)) {
        return next(); // Allow request
    }

    console.warn(`Blocked request from IP: ${requestIP}`);
    throw new ApiError(403, 'Access denied: IP not allowed');
    
}

module.exports = ipWhitelist;

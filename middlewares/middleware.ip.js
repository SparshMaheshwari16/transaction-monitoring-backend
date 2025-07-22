const ip = require('ip');
const ApiError = require("../utils/util.ApiError");

const allowedIPs = [
    '::1',
    '127.0.0.1',
    '::ffff:127.0.0.1'
];

const allowedSubnets = [
    '172.17.0.0/16', // Default Docker bridge network
    '172.18.0.0/16', // Custom Docker network (if applicable)
];

function ipWhitelist(req, res, next) {
    const requestIP = req.ip || req.connection.remoteAddress;

    // Normalize IPv6-mapped IPv4 addresses (e.g., ::ffff:172.17.0.2)
    const normalizedIP = requestIP.replace('::ffff:', '');

    // Direct match
    if (allowedIPs.includes(requestIP)) {
        return next();
    }

    // Check if IP falls within allowed subnets
    const isAllowedSubnet = allowedSubnets.some(subnet => ip.cidrSubnet(subnet).contains(normalizedIP));

    if (isAllowedSubnet) {
        return next();
    }

    console.warn(`Blocked request from IP: ${requestIP}`);
    throw new ApiError(403, 'Access denied: IP not allowed');

}

module.exports = ipWhitelist;

// routes/APIDocs
const express = require('express');
const router = express.Router();
// Swagger Setup
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./swagger/swagger.yaml');

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCssUrl: '/custom-assets/custom.css',
    swaggerOptions: {
        authAction: {
            ApiKeyAuth: {
                name: 'x-api-key',
                schema: { type: 'apiKey', in: 'header', name: 'x-api-key' },
                value: process.env.API_KEY || '',
            },
        },
    },
}));

module.exports = router;

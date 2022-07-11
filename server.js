const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const app = express();
const PORT = 1234;

app.use(require('./routes/adminRoutes'));
app.use(require('./routes/studentRoutes'));
app.use(require('./routes/login'))

const dotenv = require('dotenv');
dotenv.config()

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Students API',
            version: '1.0.0',
            description: 'A simple Express.js API that will manage students and admins users from a mentoring program and will store data in a MongoDB instance'
        },
        servers: [
            {
                url: "http://localhost:1234"
            }
        ]
    },
    apis: ['server.js', './routes/*.js']
};

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

app.listen(PORT, () => {
    console.log('server started on port: %d', PORT);
})


/**
 * @openapi
 * /health:
 *   get:
 *     description: Students API health check
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/health', (req, res) => {
    res.sendStatus(200);
})
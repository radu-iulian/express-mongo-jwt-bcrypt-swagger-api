const express = require('express'),
    app = express(),
    PORT = 1234,
    dotenv = require('dotenv');

var swaggerJsdoc = require('swagger-jsdoc'),
    swaggerUi = require('swagger-ui-express');

dotenv.config()

app.use(require('./routes/adminRoutes'));
app.use(require('./routes/studentRoutes'));
app.use(require('./routes/login'))


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Students API",
      version: "0.1.0",
      description:
        "A simple Express.js API that will manage students and admins users from a mentoring program and will store data in a MongoDB",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Radu-Iulian Ilie",
        url: "https://github.com/radu-iulian",
        email: "radu.iulian.ilie@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:1234/api",
      },
    ],
  },
  apis: ["./routes/*.js", "server.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {explorer: true})
);


app.listen(PORT, () => {
    console.log('server started on port: %d', PORT);
})

app.get('/health', (req, res) => {
    res.sendStatus(200);
})
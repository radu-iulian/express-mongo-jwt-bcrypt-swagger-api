# express-mongo-jwt-bcrypt-swagger-api
A simple Express.js API that will manage students and admins users from a mentoring program and will store data in a MongoDB instance

# Prerequisites
1. Install git
2. Install node.js (npm will also be automatically installed)
3. Install MongoDB and a MongoDB client (GUI from here:
  `https://www.mongodb.com/docs/manual/installation/#mongodb-installation-tutorials`
  I prefer using Studio 3T (`https://studio3t.com/download/`) as MongoDB client but you can easily use Compass (`https://www.mongodb.com/products/compass`).
  The database server will be: `localhost`
  database port: `27017`
4. Install VS Code or any other code editor that you like.

# How to Start
1. Clone the project.
2. `npm i` - Install all the dependencies.
3. Manually install nodemon dev dependency by running `npm install nodemon --global` command.
4. There are a lot dependencies that are not updated frequently in parallel with cypress. So while installing if you are seeing conflicts use `npm i --force`.
5. Create a .env file on the project root containing 2 secrets: adminSecretKey and secretKey.
   e.g. `adminSecretKey=das@5523!da$%^DAFSDss123
         secretKey=dsadSADXACS3!@(dda12DAD!`
6. run `nodemon start` command to start the service
7. Access `http://localhost:1234/api-docs/` to check the documentation of the project.

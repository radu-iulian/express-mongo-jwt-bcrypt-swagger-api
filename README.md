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

# How to Start using the API

Method 1: On local environment - without Docker:

1. Clone the project.
2. `npm i` - Install all the dependencies.
3. Manually install nodemon dev dependency by running `npm install nodemon --global` command.
4. There are a lot dependencies that are not updated frequently in parallel with cypress. So while installing if you are seeing conflicts use `npm i --force`.
5. Create a .env file on the project root containing 2 secrets: adminSecretKey and secretKey.
   e.g. `adminSecretKey=das@5523!da%^DAFSDss123
         secretKey=dsadSADXACS3!@(dda12DAD!`
6. run `nodemon start` command to start the service
7. Access `http://localhost:1234/api-docs/` to check the documentation of the project.

Method 2: On local environment - with Docker:

1. Install Docker desktop
2. Clone/pull the project.
3. Open a terminal and cd into the project folder
4. Run the `docker compose up` command
5. Check using `docker ps` command if the API and the Mongo DB containers have been raised
6. Access `http://localhost:1234/api-docs/` to check the documentation of the project.

Method 3: Deploy the API on an Amazon EC2 instance - with Docker

1. Create an Amazon AWS account.
2. Search for EC2 using the search bar and navigate to the EC2 console.
3. Click on the Launch instance button.
4. Configure the instance that you want to create like this if you want to be free tier eligible:
![image](https://user-images.githubusercontent.com/87607624/181005202-624198b3-67f6-42e1-9ca7-3f22c4c5b1ca.png)
![image](https://user-images.githubusercontent.com/87607624/181005333-ae5f302e-a936-422e-a789-75db88c2d83a.png)
5. In the Key pair section create a new key pair ( the name can be the same as the selected region) and save the .pem file locally. You will need this later on in order to connect via SSH on the EC2 instance.
6. Click on the Create instance button.
7. Navigate to the previously created instance and wait until the Connect button is no longer greyed out ( it will take about 5 minutes).
8. Click on the Connect button and then go to the SSH client tab.
9. Open/bring the previously opened terminal back in focus and cd into the folder where you downloaded the .pem file at step 5. Then make sure that your key is publicly viewable by running `chmod 400 <name_of_your_pem_file>` command. e.g. `chmod 400 eu-central-1.pem'.
10. Copy the example SSH client command from the Amazon AWS site and then press enter. You will also be asked if you want to continue. Type yes and then enter. The SSH connection should be established and the console output should look like:
![image](https://user-images.githubusercontent.com/87607624/181007753-3a084178-0451-40fe-8845-a093b32564fb.png)
11. Run the following commands via SSH:
  11.1. `sudo yum update -y`
  11.2. `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash`
  Try to execute `nvm --version` command in the terminal just to check if the nvm has been successfully installed. If the output is `nvm: command not found` then type `exit` and then enter and after that connect again via SSH with your instance and try again.
  11.3. `nvm install 16` (or replace 16 with the latest version of node. Check: https://nodejs.org/en/)
  Check if the node and npm has been successfully installed by executing the following commands:
  `node --version` and `npm --version`.
  11.4. Port forward your traffic from port 80 of the instance to the port on which the API is running ( `1234` by default) by executing:
  `sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 1234`.
  11.5. Install git: `sudo yum install git -y` and then verify via `git -v` if it has been successfully installed.
  
  11.6. Install Docker:
    `sudo yum update && sudo yum install docker -y`.
  11.7. Add group membership for the default ec2-user so you can run all docker commands without using the sudo command:
    `sudo usermod -a -G docker ec2-user`
    `id ec2-user`
    `newgrp docker`.
  11.8. Install docker-compose:
    `wget https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)` 
    `sudo mv docker-compose-$(uname -s)-$(uname -m) /usr/local/bin/docker-compose`
    `sudo chmod -v +x /usr/local/bin/docker-compose`.
  11.9. Enable docker service at AMI boot time:
    `sudo systemctl enable docker.service`.
  11.10. Start the Docker service:
    `sudo systemctl start docker.service`.
  11.11. Get the docker service status on your AMI instance, run:
    `sudo systemctl status docker.service`
    The output should look something like that:
    ![image](https://user-images.githubusercontent.com/87607624/181014747-9af408e0-caab-4953-9e55-a979f1ecf3e7.png)

  11.12. `mkdir projects && cd projects`.
  11.13. `git clone https://github.com/radu-iulian/express-mongo-jwt-bcrypt-swagger-api.git`.
  11.14. `cd express-mongo-jwt-bcrypt-swagger-api/`.
  11.15. Build and run Docker containers by executing the following commands:
    `docker compose build --no-cache` and
    `docker compose up -d`.
  11.16. Check using `docker ps` command if the API and the Mongo DB containers have been raised.
12. Access `http://<EC2_instance_IP>/api-docs/` to check the documentation of the project. e.g. http://35.159.24.124/api-docs/.
13. If you will want to play with the API using Swagger you will also need to modify the `server.js` file on the EC2 cloned repo so that the `options` constant includes your EC2 instance in the `servers` array. Example:
![image](https://user-images.githubusercontent.com/87607624/181021926-c0f8fd75-6f37-4f67-8f5f-a90bcc657c9c.png)


# Play with the Students API
You can play around with the API by either launching the Swagger page or by importing the API collection and environment variables into Postman. You can find the Postman exported files in the 'Postman' folder on the project root. 

const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

const Student = require('../models/student');
const AdminUser = require('../models/adminUser');

router.use(express.json());

/** 
* @swagger
*    components:
*        schemas:
*            LoginRequest:
*                type: object
*                required:
*                    - email
*                    - password
*                properties:
*                    email:
*                        type: string
*                        description: email of the admin(mentor)/student user
*                        example: 'radu.iulian.ilie@gmail.com'
*                    password:
*                        type: string
*                        description: password of the admin(mentor)/student user
*                        example: 'Password123!'
*
*            LoginResponse:
*               type: object
*               properties:
*                    message:
*                       type: string
*                       description: Authorization successful message
*                       example: 'Authorization successful'
*                    token:
*                       type: string
*                       description: Generated JWT token
*                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhZHUuaXVsaWFuLmlsaWVAZ21haWwuY29tIiwidXNlcklkIjoiNjJjZDdmY2Y5OTQ1OWU2Njk3NTdiZmExIiwiaWF0IjoxNjU3NjM2MDIwLCJleHAiOjE2NTc2Mzk2MjB9.hSDPABAMU2NaMDqoD9WVbSy-Lntwgwmcb9dOdTknPmQ'
*/

/**
 * @swagger
 * tags:
 *  name: Login
 *  description: Login endpoint that generated the JWT token.
 *      The generated token value will be used for "Auth" header value. 
 *      The key for JWT encoding is also stored in the .env project file under "secretKey" constant (e.g. secretKey=efgh456$%^).
 */

/**
 * @swagger
 *  /login:
 *      post:
 *          tags: 
 *              - Login
 *          summary: Login admin/student users
 *          requestBody:
 *              required: true
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schemas/LoginRequest'
 *          responses:
 *              "200":
 *                  description: The admin/student user has been successfully logged in.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#components/schemas/LoginResponse'
 *              "401":
 *                  description: 'Unauthorized'
 */
router.post('/api/login', async (req, res) => {
    let usersCollection = [];
    let isStudent = false;
    let isAdmin = false;

    await Student.find({ email: req.body.email })
        .exec()
        .then(students => {
            if (students.length < 1) {
                isStudent = false;
            }
            else {
                usersCollection = students;
                isStudent = true;
            }
        })

    if (isStudent == false) {
        await AdminUser.find({ email: req.body.email })
            .exec()
            .then(admins => {
                if (admins.length < 1) {
                    isAdmin = false;
                }
                else {
                    usersCollection = admins;
                    isAdmin = true;
                }
            })
    }

    if (isAdmin == false && isStudent == false) {
        return res.sendStatus(401);
    }

    bcrypt.compare(req.body.password, usersCollection[0].password, (err, isEqual) => {
        if (err) return res.sendStatus(401)
        if (isEqual) {
            const token = jwt.sign(
                {
                    email: usersCollection[0].email,
                    userId: usersCollection[0]._id,
                },
                process.env.secretKey,
                {
                    expiresIn: "1h"
                }
            )
            return res.status(200).json({
                message: 'Authorization successful',
                token: token
            })
        }
        res.sendStatus(401)
    })
})


module.exports = router;
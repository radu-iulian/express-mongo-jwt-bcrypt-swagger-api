const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

const checkAuth = require('../middleware/auth')
const Student = require('../models/student');

router.use(express.json());

/** 
* @swagger
*    components:
*        schemas:
*            Admin:
*                type: object
*                required:
*                    - email
*                    - password
*                properties:
*                    email:
*                        type: string
*                        description: email of the admin (mentor) user
*                        example: 'radu.iulian.ilie@gmail.com'
*                    password:
*                        type: string
*                        description: password of the admin (mentor) user
*                        example: 'Password123!'
*            
*            GetStudentIdResponse:
*                type: object
*                properties:
*                     studentId:
*                        type: string
*                        description: ID of student retrieved from the MongoDB
*                        example: '62cfc9e1c7419ae18d37d872'

*
*            Student:
*               type: object
*               required:
*                   - firstName
*                   - lastName
*                   - email
*                   - password
*               properties:
*                    firstName:
*                       type: string
*                       description: first name of the student
*                       example: 'Radu'
*                    lastName:
*                       type: string
*                       description: last name of the student
*                       example: 'Ilie'
*                    email:
*                       type: string
*                       description: email of the student
*                       example: 'radu.iulian.ilie@gmail.com'
*                    password:
*                       type: string
*                       description: initial password set for the student user by the admin
*                       example: 'defaultPasword123!'
*                    phoneNumber:
*                       type: string
*                       description: student's phone number
*                       example: '+40710101010'
*                    birthDate:
*                       type: string
*                       description: student's birth date
*                       example: '1993-01-01'
*                    studiesInfo:
*                       type: array
*                       description: info about student's studies
*                       items:
*                           $ref: '#/components/schemas/StudiesInfo'
*                    hobbies:
*                       type: array
*                       items:
*                           type: string
*                       description: student's hobbies
*                       example: ['Soccer','Coding']
*                    
*            StudiesInfo:
*               type: object
*               required:
*                   - university
*                   - faculty
*                   - yearOfStudy
*               properties:
*                   university:
*                       type: string
*                       description: university name
*                       example: 'Harvard University'
*                   faculty:
*                       type: string
*                       description: faculty name
*                       example: 'Computer science'
*                   yearOfStudy:
*                       type: integer
*                       description: year of study
*                       example: 3
*/

/**
 * @swagger
 * tags:
 *  name: Student
 *  description: Student users endpoints.
 *      The Student must be logged in before executing these requests. For this another header should be added to the request named "Authorization". 
 *      The key for JWT encoding is also stored in the .env project file under "secretKey" constant (e.g. secretKey=efgh456$%^).
 *      Most of the endpoints (except for GET student id and PATCH password) can be also used by admin users but you'll also need 
 *      a "Secret" header of which value is stored in the .env file in the API project ( e.g. adminSecretKey=abcd123!@#). 
 */

/**
 * @swagger
 *  /student/getId/{studentEmail}:
 *      get:
 *          tags: 
 *              - Student
 *          summary: Gets student id based on the provided Authorization token header and the email address sent as path param
 *          parameters:
 *              - in: header
 *                name: Authorization
 *                schema:
 *                    type: string
 *                required: true
 *                description: JWT token generated after admin user login.
 *              - in: path
 *                name: studentEmail
 *                schema:
 *                    type: string
 *                required: true
 *                description: email address of the student for which the id is requested.
 *          responses:
 *              "200":
 *                  description: Registered students list is successfully returned.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/GetStudentIdResponse'
 *              "403":
 *                  description: 'This operation is not allowed for other users'
 */
router.get('/api/student/getId/:studentEmail', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers['authorization']);

    if (req.params.studentEmail == decodedToken.email) {
        res.status(200).json({
            studentId: decodedToken.userId
        })
    }
    else {
        return res.status(403).json({
            message: "This operation is not allowed for other users"
        })
    }
});

/**
 * @swagger
 *  /student/{studentId}:
 *      get:
 *          tags: 
 *              - Student
 *          summary: Gets student user data based on the provided student id sent as path param
 *          parameters:
 *              - in: header
 *                name: Secret
 *                schema:
 *                    type: string
 *                required: false
 *                description: Admin user secret. Value is stored in the .env file in the API project.
 *              - in: header
 *                name: Authorization
 *                schema:
 *                    type: string
 *                required: true
 *                description: JWT token generated after admin user login.
 *              - in: path
 *                name: studentId
 *                schema:
 *                    type: string
 *                required: true
 *                description: id of the student for which the data is requested.
 *          responses:
 *              "200":
 *                  description: Registered students list is successfully returned.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Student'
 *              "403":
 *                  description: 'This operation is not allowed for other users'
 */
router.get('/api/student/:studentId', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers['authorization']);

    if (req.params.studentId == decodedToken.userId || req.header('Secret') == process.env.adminSecretKey) {
        Student.find({ _id: req.params.studentId })
            .exec()
            .then(students => {
                if (students.length < 1) {
                    return res.status(404).json({
                        message: "There is no student with the provided id"
                    });
                }
                res.status(200).json(students[0])
            })
            .catch(err => {
                console.log(err);
                res.status(422).json({
                    message: "Student id can not be processed",
                    error: err
                })
            })
    }
    else {
        return res.status(403).json({
            message: "This operation is not allowed for other users"
        })
    }
});

/**
 * @swagger
 *  /student/{studentId}:
 *      put:
 *          tags: 
 *              - Student
 *          summary: Updates student user data based on the provided student id sent as path param
 *          parameters:
 *              - in: header
 *                name: Secret
 *                schema:
 *                    type: string
 *                required: false
 *                description: Admin user secret. Value is stored in the .env file in the API project.
 *              - in: header
 *                name: Authorization
 *                schema:
 *                    type: string
 *                required: true
 *                description: JWT token generated after admin user login.
 *              - in: path
 *                name: studentId
 *                schema:
 *                    type: string
 *                required: true
 *                description: id of the student for which data needs to be updated.
 *          requestBody:
 *              required: true
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schemas/Student'
 *          responses:
 *              "200":
 *                  description: User has been successfully updated.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Student'
 *              "400":
 *                  description: 'Bad request'
 *              "403":
 *                  description: 'This operation is not allowed for other users'
 */
router.put('/api/student/:studentId', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers['authorization']);

    if (req.params.studentId == decodedToken.userId || req.header('Secret') == process.env.adminSecretKey) {
        try {
            const id = req.params.studentId;
            const student = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                birthDate: req.body.birthDate,
                studiesInfo: req.body.studiesInfo,
                hobbies: req.body.hobbies
            };
            const options = { new: true };

            const result = await Student.findByIdAndUpdate(id, student, options);
            res.send(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    else {
        return res.status(403).json({
            message: "This operation is not allowed for other users"
        })
    }
});

/**
 * @swagger
 *  /student/{studentId}:
 *      patch:
 *          tags: 
 *              - Student
 *          summary: Partially updates student user data based on the provided student id sent as path param
 *          parameters:
 *              - in: header
 *                name: Secret
 *                schema:
 *                    type: string
 *                required: false
 *                description: Admin user secret. Value is stored in the .env file in the API project.
 *              - in: header
 *                name: Authorization
 *                schema:
 *                    type: string
 *                required: true
 *                description: JWT token generated after admin user login.
 *              - in: path
 *                name: studentId
 *                schema:
 *                    type: string
 *                required: true
 *                description: id of the student for which data needs to be updated.
 *          requestBody:
 *              required: true
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schemas/Student'
 *          responses:
 *              "200":
 *                  description: User has been successfully updated.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Student'
 *              "400":
 *                  description: 'Bad request'
 *              "403":
 *                  description: 'This operation is not allowed for other users'
 */
router.patch('/api/student/:studentId', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers['authorization']);

    if (req.params.studentId == decodedToken.userId || req.header('Secret') == process.env.adminSecretKey) {
        if (req.body.password == null) {
            try {
                const id = req.params.studentId;
                const updatedData = req.body;
                const options = { new: true };

                const result = await Student.findByIdAndUpdate(id, updatedData, options);
                res.send(result);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        } else {
            res.status(400).json({ message: 'In order to update the student password please use the dedicated endpoint ( PATCH /api/student/updatePassword )' })
        }
    }
    else {
        return res.status(403).json({
            message: "This operation is not allowed for other users"
        })
    }
});

/**
 * @swagger
 *  /student/updatePassword/{studentId}:
 *      patch:
 *          tags: 
 *              - Student
 *          summary: Updates student password based on the provided student id sent as path param
 *          parameters:
 *              - in: header
 *                name: Authorization
 *                schema:
 *                    type: string
 *                required: true
 *                description: JWT token generated after admin user login.
 *              - in: path
 *                name: studentId
 *                schema:
 *                    type: string
 *                required: true
 *                description: id of the student for which password needs to be updated.
 *          requestBody:
 *              required: true
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - password
 *                          properties:
 *                              password:
 *                                  type: string
 *                                  description: 'The new passowrd'
 *                                  example: 'Password123!'
 *          responses:
 *              "200":
 *                  description: User password has been successfully updated.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              required:
 *                                  - message
 *                              properties:
 *                                  message:
 *                                      type: string
 *                                      description: 'The password has been successfully updated'
 *                                      example: 'The password has been successfully updated'
 *              "400":
 *                  description: 'Bad request'
 *              "403":
 *                  description: 'This operation is not allowed for other users'
 *              "500":
 *                  description: 'Password encryption failed or an error has been encountered'
 */
router.patch('/api/student/updatePassword/:studentId', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers['authorization']);

    if (req.body.password != null && req.body.password.length >= 10) {
        if (req.params.studentId == decodedToken.userId) {

            try {
                const id = req.params.studentId; 
                const updatedPassword = req.body.password;
                const options = { new: true };

                bcrypt.hash(updatedPassword, 10, async function (err, hash) {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const result = await Student.findByIdAndUpdate(id, hash, options);
                        res.status(200).json({
                            message: 'The password has been successfully updated'
                        });
                    }
                })
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        }
        else {
            return res.status(403).json({
                message: "This operation is not allowed for other users"
            })
        }

    } else {
        if (req.body.password == null) {
            res.status(422).json({ message: 'Password field is mandatory' });
        } else {
            res.status(422).json({ message: 'Please make sure that new password has at least 10 characters' });
        }

    }
});

module.exports = router;
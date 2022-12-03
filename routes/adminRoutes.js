const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config()

const checkAuth = require('../middleware/auth')
const AdminUser = require('../models/adminUser');
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
*            GetAllStudentsResponse:
*                type: array
*                items:
*                    $ref: '#/components/schemas/Student'
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
*            
*            DeletedStudent:
*                type: object
*                required:
*                    - message
*                properties:
*                    message:
*                        type: string
*                        example: 'Student with 62cbf044aeefbd5aca74cf88 id has been successfully deleted'
*/

/**
 * @swagger
 * tags:
 *  name: Admin
 *  description: Admin users endpoints.
 *      In order to execute these requests you'll also need a "Secret" header of which value is stored in the .env file in the API project ( e.g. adminSecretKey=abcd123!@#). 
 *      The Admin must be also logged in before executing most of these requests (expect for the /api/admin/registration). For this another header should be added to the request named "Authorization". 
 *      The key for JWT encoding is also stored in the .env project file under "secretKey" constant (e.g. secretKey=efgh456$%^).
 */

/**
 * @swagger
 *  /admin/registration:
 *      post:
 *          tags: 
 *              - Admin
 *          summary: Creates a new admin user
 *          parameters:
 *              - in: header
 *                name: Secret
 *                schema:
 *                    type: string
 *                required: true
 *                description: Admin user secret. Value is stored in the .env file in the API project.
 *          requestBody:
 *              required: true
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schemas/Admin'
 *          responses:
 *              "201":
 *                  description: Admin user has been successfully created
 *              "403":
 *                  description: 'This operation is not allowed for users having the student role'
 *              "409":
 *                  description: Email address already exists
 *              "500":
 *                  description: Password could not be encrypted or an error has been encountered and the admin could not be created
 */
router.post('/api/admin/registration', (req, res) => {
    if (req.header('Secret') == process.env.adminSecretKey) {
        AdminUser.find({ email: req.body.email })
            .exec()
            .then(adminUsers => {
                if (adminUsers.length >= 1) {
                    return res.status(409).json({
                        message: "Email is already taken"
                    });
                }
                else {
                    bcrypt.hash(req.body.password, 10, function (err, hash) {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            })
                        }
                        else {
                            const adminUser = new AdminUser({
                                email: req.body.email,
                                password: hash,
                            })

                            adminUser.save()
                                .then(() => { res.sendStatus(201) })
                                .catch(err => res.status(500).json({ error: err }))

                        }
                    })
                }
            })
    }
    else {
        return res.status(403).json({
            message: "This operation is not allowed for users having the student role"
        })
    }
});

/**
 * @swagger
 *  /admin/addNewStudent:
 *      post:
 *          tags: 
 *              - Admin
 *          summary: Creates a new student user
 *          parameters:
 *              - in: header
 *                name: Secret
 *                schema:
 *                    type: string
 *                required: true
 *                description: Admin user secret. Value is stored in the .env file in the API project.
 *              - in: header
 *                name: Authorization
 *                schema:
 *                    type: string
 *                required: true
 *                description: JWT token generated after admin user login.
 *          requestBody:
 *              required: true
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schemas/Student'
 *          responses:
 *              "201":
 *                  description: Student user has been successfully created
 *              "403":
 *                  description: 'This operation is not allowed for users having the student role'
 *              "409":
 *                  description: Email address already exists
 *              "500":
 *                  description: Password could not be encrypted or an error has been encountered and the admin could not be created
 */
router.post('/api/admin/addNewStudent', checkAuth, (req, res) => {
    if (req.header('Secret') == process.env.adminSecretKey) {
        Student.find({ email: req.body.email })
            .exec()
            .then(students => {
                if (students.length >= 1) {
                    return res.status(409).json({
                        message: "Email is already taken"
                    });
                }
                else {
                    bcrypt.hash(req.body.password, 10, function (err, hash) {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            })
                        }
                        else {

                            const student = new Student({
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                email: req.body.email,
                                password: hash,
                                phoneNumber: req.body.phoneNumber,
                                birthDate: req.body.birthDate,
                                studiesInfo: req.body.studiesInfo,
                                hobbies: req.body.hobbies
                            })

                            student.save()
                                .then(res.status(201).json(student))
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({ error: err })
                                })

                        }
                    })
                }
            })
    }
    else {
        return res.status(403).json({
            message: "This operation is not allowed for users having the student role"
        })
    }
});

/**
 * @swagger
 *  /admin/deleteStudent/{studentId}:
 *      delete:
 *          tags: 
 *              - Admin
 *          summary: Deletes a student user by id
 *          parameters:
 *              - in: header
 *                name: Secret
 *                schema:
 *                    type: string
 *                required: true
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
 *                description: id of the student that needs to be deleted.
 *          responses:
 *              "200":
 *                  description: Student user has been successfully deleted
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/DeletedStudent'
 *              "403":
 *                  description: 'This operation is not allowed for users having the student role'
 *              "404":
 *                  description: 'Student id not found'
 */
router.delete('/api/admin/deleteStudent/:studentId', checkAuth, (req, res) => {
    if (req.header('Secret') == process.env.adminSecretKey) {
        Student.deleteOne({ _id: req.params.studentId })
            .exec()
            .then(() => {
                res.status(200).json({
                    message: 'Student with ' + req.params.studentId + ' id has been successfully deleted'
                })
            })
            .catch(err => {
                console.log(err);
                res.status(404).json({
                    message: "Student id not found",
                    error: err
                })
            })
    }
    else {
        return res.status(403).json({
            message: "This operation is not allowed for users having the student role"
        })
    }
})

/**
 * @swagger
 *  /admin/getAllStudents:
 *      get:
 *          tags: 
 *              - Admin
 *          summary: Gets all the registered students data
 *          parameters:
 *              - in: header
 *                name: Secret
 *                schema:
 *                    type: string
 *                required: true
 *                description: Admin user secret. Value is stored in the .env file in the API project.
 *              - in: header
 *                name: Authorization
 *                schema:
 *                    type: string
 *                required: true
 *                description: JWT token generated after admin user login.
 *          responses:
 *              "200":
 *                  description: Registered students list is successfully returned.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/GetAllStudentsResponse'
 *              "403":
 *                  description: 'This operation is not allowed for users having the student role'
 *              "404":
 *                  description: 'There are no enrolled students yet'
 *              "500":
 *                  description: An error has been encountered while retriving the students.
 *                      
 */
router.get('/api/admin/getAllStudents', checkAuth, async (req, res) => {
    if (req.header('Secret') == process.env.adminSecretKey) {
        try {
            const students = await Student.find();

            if (students.length < 1) {
                return res.status(404).json({
                    message: "There are no enrolled students yet"
                });
            }

            res.status(200).json(students)
        }
        catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    else {
        return res.status(403).json({
            message: "This operation is not allowed for users having the student role"
        })
    }
})


module.exports = router;
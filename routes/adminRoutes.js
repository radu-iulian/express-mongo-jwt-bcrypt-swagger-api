const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config()

const checkAuth = require('../middleware/auth')
const AdminUser = require('../models/adminUser');
const Student = require('../models/student');

router.use(express.json());

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
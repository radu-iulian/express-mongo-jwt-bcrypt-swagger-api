const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

const checkAuth = require('../middleware/auth')
const Student = require('../models/student');

router.use(express.json());

router.get('/api/student/getId/:studentEmail', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers.authorization);

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

router.get('/api/student/:studentId', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers.authorization);

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

router.put('/api/student/:studentId', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers.authorization);

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

// - PATCH student
router.patch('/api/student/:studentId', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers.authorization);

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

router.patch('/api/student/updatePassword/:studentId', checkAuth, async (req, res) => {
    const decodedToken = jwt.decode(req.headers.authorization);

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
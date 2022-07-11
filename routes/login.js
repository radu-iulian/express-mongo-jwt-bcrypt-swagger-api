const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

const Student = require('../models/student');
const AdminUser = require('../models/adminUser');

router.use(express.json());

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
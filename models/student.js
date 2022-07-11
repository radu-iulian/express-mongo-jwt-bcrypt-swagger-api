const db = require('../database');

const studiesInfoSchema = new db.Schema({
    university: {type: String, require: true},
    faculty: {type: String, require:true},
    yearOfStudy: {type: Number, require:true},
});

const studentSchema = new db.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required:true},
    email: {type: String, required:true},
    password: {type: String, required:true},
    phoneNumber: {type: String, required:true},
    birthDate: {type: Date, required:false},
    studiesInfo: {type: [studiesInfoSchema], required:false},
    hobbies: {type: [String], required:false}
}, {timestamps: true});

const Student = db.model("Student", studentSchema);

module.exports = Student;
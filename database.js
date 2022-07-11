const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/studentsDB',() => {
    console.log('Students MongoDB connected')
});

module.exports = mongoose;
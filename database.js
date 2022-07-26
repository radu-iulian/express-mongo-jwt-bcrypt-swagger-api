const mongoose = require('mongoose');

mongoose.connect(process.env.mongoDbUri,() => {
    console.log('Students MongoDB connected')
});

module.exports = mongoose;
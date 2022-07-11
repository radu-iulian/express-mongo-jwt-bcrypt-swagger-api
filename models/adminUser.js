const db = require('../database');

const adminUserSchema = new db.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true}
}, {timestamps: true});

const AdminUser = db.model("Admin", adminUserSchema);

module.exports = AdminUser;
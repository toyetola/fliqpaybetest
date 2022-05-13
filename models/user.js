const mongooose = require('mongoose');
const Schema = mongooose.Schema;
const roles = require('../auth/role');

let UserSchema = new Schema({
    firstname : {
        type : String,
        default: null
    },
    lastname : {
        type : String,
        default: null
    },
    email: {
        type : String,
        required : true,
        trim : true
    },
    password: {
        type : String,
        required : true,
        select: false
    },
    role: {
        type : String,
        default : roles.CUSTOMER,
        enum : [roles.CUSTOMER, roles.AGENT, roles.ADMIN]
    },
    accessToken: {
        type: String
    },
    createdAt:{
        type : Date,
        default : Date.now
    }
})

const User = mongooose.model("user", UserSchema);
module.exports = User


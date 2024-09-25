const mongoose = require("mongoose");





const adminSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    }, 
    password : {
        type : String,
        required : true
    }
},{
    timestamps : true
});





const adminModel = mongoose.model("admin" , adminSchema);



module.exports = {
    adminModel
}
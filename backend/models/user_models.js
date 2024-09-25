const mongoose = require("mongoose");



const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    firstName : {
        type : String,
        required : true,
    },
    lastName : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    purchasedCourses : [{
        type : mongoose.Schema.Types.ObjectId,
        default : []
        
    }]
}, {
    timestamps : true
});



const userModel = mongoose.model("user" , userSchema);



module.exports = {
    userModel
}
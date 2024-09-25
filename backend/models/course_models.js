const mongoose = require("mongoose");
const { adminModel } = require("./admin_models");
const { string } = require("zod");
const ObjectId = mongoose.Schema.Types.ObjectId;



const courseSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    duration : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    createrId : {                 
        type : ObjectId ,
        ref : adminModel,
        required : true
    },
    startDate : {
        type : Date,
        required : true
    },
    imageUrl : {
        type : String,
        default : ""
    },
    createrName : {
        type : String
    },
    enrolledUsers : [{
        type : ObjectId,
        default : []
    }]
} , {
    timestamps : true
});




const courseModel = mongoose.model("courses" , courseSchema);



module.exports = {
    courseModel
}
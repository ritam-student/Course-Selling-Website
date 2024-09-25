const {Router} = require('express');
const { adminModel } = require('../models/admin_models');
const adminRouter = Router();
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { adminAuth } = require('../middwares/adminAuth');
const { courseModel } = require('../models/course_models');
const JWT_SECRET = process.env.ADMIN_JWT_SECRET;




adminRouter.post("/signup" , async (req , res) => {
    const requiredBody = z.object({
        email : z.string().email().min(11),
        firstName : z.string().min(3).max(25),
        lastName : z.string().min(3).max(25),
        password : z.string().min(8).max(30).refine((value) => /[a-z]/.test(value) , {message : "password must contain a lowercase character...." }).refine((value) => /[A-Z]/.test(value) , {message : "password must contain a uppercase character...." }).refine((value) => /[1-9]/.test(value) , {message : "password must contain a number...." }).refine((value) => /[!@#$%^&*(){}~:";'?/<>,.]/.test(value) , {message : "password must contain a special character...." })
    });
    const body = requiredBody.safeParse(req.body);
    if(!body.success){
        res.status(401).json({
            error : body.error
        });
        return;
    }
    const {email , firstName , lastName , password} = req.body;
    try {
        const isEmailExist = await adminModel.findOne({email});
        if(isEmailExist){
            res.status(401).json({
                message : "This email already exist..."
            });
            return;
        }
    }catch(err){
        res.status(500).json({
            error : err
        });
    }
    const hashedPassword = await bcrypt.hash(password , 10);
    try {
        const admin = await adminModel.create({
            email,
            firstName,
            lastName,
            password : hashedPassword
        });
        res.json({
            message : "you are signed up....",
            admin 
        });
    }catch(err){
        res.status(403).json({
            error : err
        });
    }
});



adminRouter.post("/signin" , async (req , res) => {
    const requiredBody = z.object({
        email : z.string().email().min(11),
        password : z.string().min(8).max(30).refine((value) => /[a-z]/.test(value) , {message : "password must contain a lowercase character...." }).refine((value) => /[A-Z]/.test(value) , {message : "password must contain a uppercase character...." }).refine((value) => /[1-9]/.test(value) , {message : "password must contain a number...." }).refine((value) => /[!@#$%^&*(){}~:";'?/<>,.]/.test(value) , {message : "password must contain a special character...." })
    });
    const body = requiredBody.safeParse(req.body);
    if(!body.success){
        res.status(401).json({
            error : body.error
        });
        return;
    }
    const {email , password} = req.body;
    try{
        const admin = await adminModel.findOne({email});
        if (!admin){
            res.status(403).json({
                error : "This email doesn't exist...."
            });
            return;
        }
        const isSamePassword = bcrypt.compare(password , admin.password);
        if(!isSamePassword){
            res.status(403).json({
                error : "Incorrect credentials..."
            });
            return;
        }
        const token = jwt.sign({
            _id : admin._id,
            name : admin.firstName + admin.lastName
        } , JWT_SECRET);
        res.json({
            token
        });
    }catch (err) {
        res.status(500).json({
            error : err
        })
    }

});



adminRouter.post('/course' , adminAuth ,async (req , res) => {
    const {title , description , duration , price , startDate} = req.body;
    try{
        const newCourse = await courseModel.create({
            title ,
            description,
            duration,
            price,
            startDate,
            createrId : req.admin_id,
            createrName : req.name
        });
        res.json({
            message : "your course created successfully....",
            newCourse
        });
    }catch(err){
        res.status(500).json({
            error : "Error while creating your course..." + err
        })
    }
});



adminRouter.put('/course/:courseId' , adminAuth ,async (req , res)=> {
    const courseId = req.params.courseId;
    try{
        const {title , description , duration , price , startDate} = req.body;
        const updatedCourse = await courseModel.findOneAndUpdate({_id : courseId} , {$set : {
            title,
            description , 
            duration , 
            price , 
            startDate
        }}, {new : true});
        res.json({
            updatedCourse
        });
    }catch(err){
        res.status(500).json({
            error : err
        });
    }
});



adminRouter.get('/course', adminAuth , async (req , res) => {
    const adminId = req.admin_id;
    try{
        const courses = await courseModel.find({createrId : adminId});
        if(courses.length < 1){
            res.json({
                message : "You haven't created any courses yet..."
            });
        }
        res.json({
            yourCourses : courses
        });
    }catch(err){
        res.status(500).json({
            error : err
        })
    }
});



adminRouter.delete('/course/:courseId' , adminAuth ,async (req , res)=> {
    const courseId = req.params.courseId;
    try{
        const deletedCourse = await courseModel.deleteOne({_id : courseId});
        res.json({
            message : "Course deleted successfully....",
            deletedCourse
        });
    }catch(err){
        res.status(500).json({
            error : err
        });
    }
});




module.exports = {
    adminRouter
}
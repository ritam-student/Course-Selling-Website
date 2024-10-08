const {Router} = require("express");
const userRouter = Router();
const {userModel} = require("../models/user_models");
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userAuth } = require("../middwares/userAuth");
const JWT_SECRET = process.env.USER_JWT_SECRET;
const mongoose = require("mongoose");
const { courseModel } = require("../models/course_models");



userRouter.post("/signup" , async (req , res) => {
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
    try{ 
        const isEmailExist = await userModel.findOne({email});
        if(isEmailExist){
            res.status(401).json({
                message : "This email already exist..."
            });
            return;
        }
    }catch (err) {
        res.status(500).json({
            error : err
        });
    }
    const hashedPassword = await bcrypt.hash(password , 10);
    try {
        const user = await userModel.create({
            email,
            firstName,
            lastName,
            password : hashedPassword
        });
        res.json({
            message : "you are signed up....",
            user
        });
    }catch(err){
        res.status(403).json({
            error : err
        });
    }
});


userRouter.post("/signin" , async (req , res) => {
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
        const user = await userModel.findOne({email});
        if (!user){
            res.status(403).json({
                error : "This email doesn't exist...."
            });
            return;
        }
        const isSamePassword = bcrypt.compare(password , user.password);
        if(!isSamePassword){
            res.status(403).json({
                error : "Incorrect credentials..."
            });
            return;
        }
        const token = jwt.sign({
            _id : user._id,
            name : user.firstName +  user.lastName
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


userRouter.post('/courses/purchase/:courseId' , userAuth ,async (req , res) => {
    const courseId = req.params.courseId;
    const userId = req.user_id;
    try{
        const user = await userModel.findOneAndUpdate({_id : userId} ,
            { $addToSet: { purchasedCourses: courseId } }, // Use $addToSet to avoid duplicates
            /* 
            { $push: { purchasedCourses: courseId } }, // to allow duplicates in the purchasedCourses, use $push instead of $addToSet
            */
            {new : true});
        const course = await courseModel.findOneAndUpdate({_id : courseId} , 
            {$addToSet: { enrolledUsers : userId }}
        )
        res.json({
            message : "Your purchase successfull...."
        });
    }catch(err){
        res.status(500).json({
            error : err
        });
    }
});


userRouter.get('/courses/purchasedCourses' , userAuth, async (req , res) => {
    const userId = req.user_id;
    try{
        const user = await userModel.findOne({_id : userId});
        if(!user){
            res.status(500).json({
                error : "Error while fetching your data...."
            });
        }
        res.json({
            purchasedCourses : user.purchasedCourses
        })
    }catch(err){
        res.status(500).json({
            error : "Something went Wrong...."
        });
    }
});

module.exports = {
    userRouter
}
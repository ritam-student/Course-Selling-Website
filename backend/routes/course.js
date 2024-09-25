const {Router} = require("express");
const { courseModel } = require("../models/course_models");
const courseRouter = Router();



courseRouter.get('/' , async (req , res) => {
    try{
        const courses = await courseModel.find({});
        res.json({
            courses
        });
    }catch(err) {
        res.status(404).json({
            error : err
        });
    }
});




module.exports = {
    courseRouter
}
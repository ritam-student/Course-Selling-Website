require("dotenv").config();
const express = require("express");
const { userModel } = require("./models/user_models");
const app = express();
const mongoose = require("mongoose");
const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");



app.use(express.json());



app.use("/api/v1/user" , userRouter);
app.use("/api/v1/courses" , courseRouter);
app.use("/api/v1/admin" , adminRouter);



async function connectdb () {
    try{
        await mongoose.connect(process.env.MONGODB_URL + process.env.DATABASE_NAME);
        app.listen(3000);
        console.log("DB connected successfully and app is listening on port no 3000....");
    }catch (err) {
        console.log("error whille connecting with DB....");
    }
}

connectdb();

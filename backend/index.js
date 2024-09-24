const mongoose = require("mongoose");
const express = require("express");
const app = express();
require("dotenv").config();



async function main ()  {
    try{
        await mongoose.connect(process.env.MONGODB_URL+process.env.DATABASE_NAME);
        app.listen(process.env.PORT || 3000);
        console.log("db connected successfully....");
    }catch (err) {
        console.log("error is " + err);
    }
}



main();

const express = require("express");
const dbConnect = require("./Dbconnect/db")
dbConnect();
const app = express();
require('dotenv').config();
const cors = require("cors"); 

//Routing path
const productItem = require("./Roting/ProductItem")

app.use(cors());

const port = process.env.port

app.use("/",productItem);


app.listen(port,()=>{
    console.log(`server is running on port http://localhost:${port}`);
})
import express from 'express';
import dotenv from 'dotenv';
const app = express();
dotenv.config();
app.get("/",function(req,res){
  res.send("Welcome");
});

console.log(process.env.PORT);

app.listen(process.env.PORT);
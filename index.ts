import express from 'express';

const app = express();


app.get("/",function(req,res){
  res.send("Welcome");
});

app.listen(8085);
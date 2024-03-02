const port= 4000;
const express= require("express");
const app= express();
const mongoose= require("mongoose");
const jwt= require("jsonwebtoken");
// const multer= require("multer");
const path= require("path");
const cors= require("cors");

app.use(express.json());
app.use(cors())

// Database Connection With MongoDB (EJqJShRYzZUK2puJ)
mongoose.connect("mongodb+srv://akashgupta9889:EJqJShRYzZUK2puJ@cluster0.vgoj2cj.mongodb.net/e-commerce")

// API Creation

app.get("/",(req,res)=>{
    res.send("Express App is Running")
})


// Schema creating for User model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating Endpoint for registering the User
app.post('/signup', async(req,res)=>{
    let check=await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:'existing user found with same email address'})
    }
    const user = new Users({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
    })

    await user.save();

    const data ={
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

//Endpoint for user login
app.post('/login',async (req,res)=>{
    let user=await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data ={
                user:{
                    id:user.id
                }
            }
            const token =jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,error:"Wrong Password"})
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Address"})
    }
})

// for fetching the user data
const fetchUser=async(req,res,next)=>{
    const token=req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user=data.user;
            next();
        }catch(error){
            res.status(401).send({errors:"Please authenticate using valid token"})
        }
    }
}

// for geting user info
// app.post('/Ginfo',fetchUser,async (req,res)=>{
//     console.log("Getinfo");
//     let userData=await Users.findOne({_id:req.user.id});
//     res.json(userData);
// })

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port "+port)
    }
    else{
        console.log("Error : "+error)
    }
})
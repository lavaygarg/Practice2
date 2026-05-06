const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const app=express();
app.use(express.json());
app.use(cors());
const JWT_SECRET="My_JWT_SECRET";
mongoose.connect('mongodb://127.0.0.1:27017/practice2');
const userSchema=mongoose.Schema({
    username:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
})
const User=mongoose.model('User',userSchema);
app.post('/api/register',async(req,res)=>{
    const {username,email,password}=req.body;
    try{ const salt=await bcrypt.genSalt(10);
    const hashed=await bcrypt.hash(password,salt);
    const newUser=new User({username,email,password:hashed});
    const saved=await newUser.save();
    res.status(201).json({message:"User Registered Successfully"});
    }catch(err){
        res.status(400).json({ error: "Something went wrong" });
    }
})

app.post('/api/login',async(req,res)=>{
    const {username,password}=req.body;
    try{const user=await User.findOne({username});
    const isMatch=await bcrypt.compare(password,user.password);
    if(!user||!isMatch){
        return res.status(400).json({error:"invalid credentials"});
    }
    const token=jwt.sign({id:user.id,username:user.username},JWT_SECRET,{expiresIn:'1h'});
    res.json({token,username:user.username});}catch(err){
        res.status(400).json({ error: "Something went wrong" });
    }
})
const verifyToken=(req,res,next)=>{
    try{const token=req.header('Authorization');
    if (!token) return res.status(401);
    const verified=jwt.verify(token.replace('Bearer ',''),JWT_SECRET)
    req.user=verified;
    next();}catch(err){
        res.status(400).json({ error: "Something went wrong" });

    }
}
app.get('/api/dashboard', verifyToken, (req, res) => {
    res.json({ message: `Welcome to the secure dashboard, ${req.user.username}! This data is coming from the backend.` });
});
app.listen(5000, () => console.log('Backend running on port 5000'));
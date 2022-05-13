const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

async function hashPassword(password){
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword){
    return await bcrypt.compare(plainPassword, hashedPassword);
}

//sign up with email and password
exports.signup = async (req, res, next) => {
    try{
        if (req.body.role && (req.body.role == "admin" || req.body.role == "agent")){
            res.status(403).json({error:"error", message:"Only an admin user can add another admin user"})
        }
        const {email, password, role, firstname, lastname} = req.body
        const hashedPassword = await hashPassword(password)
        const newUser = new User({email, password:hashedPassword, firstname, lastname, role})
        const accessToken = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET, {
            expiresIn: "2h"
        });
        newUser.accessToken = accessToken;
        await newUser.save();
        res.json({
            data: newUser,
            accessToken
        });
    } catch (err){
        next(err)
    }
}


//login method
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) 
            return next(new Error('Email does not exist'));
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) 
            return next(new Error('Password is not correct'))
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30m"
        });
        await User.findByIdAndUpdate(user._id, { accessToken })
        res.status(200).json({data: { _id: user._id, email: user.email, role: user.role }, accessToken})
    } catch (error) {
        next(error);
    }
}

//retrieve all users 
exports.getUsers = async (req, res, next) => {
    const users =  await User.find({});
    res.status(200).json({
        data:users
    });
}

//get a single user
exports.getUser = async (req, res, next) => {
    try{
        const userId = req.params.userId;
        // if(userId != req.user){
        //     return res.json({message:"Don't be an identity thief, use your token!"})
        // }
        const user = await User.findById(userId)
        if(!user) 
            return next(new Error('User does not exist'));
        res.status(200).json({data:{_id:user.id, role:user.role, firstname:user.firstname, lastname:user.lastname}});   
    } catch (err){
        next(err)
    }
}

//Upadte a user profile
exports.updateUser = async (req, res, next) => {
    try{
        const updateData = req.body
        const userId = req.params.userId;
        const adminUser = await User.findById(req.user.userId)
        if (adminUser.role != "admin" ){
            return res.status(403).json({data:null, message:"Only an admin user can do this."})
        }
        await User.findByIdAndUpdate(userId, updateData);
        const user = await User.findById(userId)
        res.status(200).json({data:{_id:user.id, role:user.role, firstname:user.firstname, lastname:user.lastname}, message:'User has been updated'})

    }catch(err){
        next(err)
    }
}

exports.deleteUser = async (req, res, next) => {
    try{
        const user = User.findById(req.user.userId)
        const userId = req.params.userId;
        if (user.role != "admin"){
            return res.status(403).json({data:null, message:"Only an admin user can do this."})
        }

        if (userId == user._id){
            return res.json({message:"You cannot delete your own selve"})
        }
        
        await User.findByAndDelete(userId);
        res.status(200).json({data:null, message:'User has been deleted'});
    } catch (err) {
        next(err)
    }
}


exports.allowIfloggedin = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({error:"You need to be logged in to access"});
        let loggedInUser = User.findById(user.userId)
        if (loggedInUser.role == "customer")
            if (req.params.userId != user.userId)
                return res.status(401).json({message:"You are not permitted to view this resource"})
        
        next();
    } catch (err) {
        next(err);
    }
}
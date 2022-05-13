const Comment = require('../models/comment')
const User = require('../models/user')

exports.createComment = async (req, res, next) => {
    try{
        const ticketId = req.params.ticketId
        const userId = req.params.userId

        let loggedInUser = await User.findById(req.user.userId).exec()
        if (loggedInUser && (loggedInUser.role === "admin" || loggedInUser.role === "agent")){
            let newComment = new Comment({comment:req.body.comment, ticket:ticketId, user:userId});
            await newComment.save();
            res.status(201).json({message:'Successfully commented', data: newComment});
        }else{
            const adminComment = await Comment.findOne({ticket:ticketId}).populate('user').exec()
        
            if(adminComment && (adminComment.user.role == "agent" || adminComment.user.role == "admin")){
                let newComment = new Comment({comment:req.body.comment, ticket:ticketId, user:userId});
                await newComment.save();
                return res.status(201).json({message:'Successfully commented', data: newComment});    
            }
            res.status(403).json({error: "You need to wait to an  agent to respond first"});
        } 
    } catch (err) {
        console.log(err)
        next(err)
    }
           
}


exports.editComment = async (req, res, next) =>{ 
    try{
        let loggedInUser = await User.findById(req.user.userId).exec()
        if (loggedInUser.role === "admin" || loggedInUser.role === "agent"){

        }

    } catch (err){

    }

}

    
    
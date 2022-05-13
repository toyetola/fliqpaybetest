const Comment = require('../models/comment');
const Ticket = require('../models/ticket');
const User = require('../models/user')
const fs = require("fs")
const fields = ['subject', 'content', 'createdAt', 'status'];
const path = require("path");
const json2csv = require("json2csv").parse;
const mdq = require("mongo-date-query");
const moment =  require("moment");

exports.createTicket = async (req, res) => {
    try{
        const user = req.user.userId
        const { subject, content, status} = req.body
        const newTicket =  new Ticket({subject, content, status, user:user});
        await newTicket.save();
        return res.status(201).json({message:'successfully saved', data: newTicket})
    } catch (err) {
        res.send(err)
    }
    
}


exports.updateTicket =  async (req, res, next) => {
    try{
        const loggedInUser = await User.findById(req.user.userId);
        if (loggedInUser.role == "admin" || loggedInUser.role == "agent"){
            const tickedId = req.params.ticketId;
            let updateData = req.body;
            updateData['updatedAt'] = await new Date();
            await Ticket.findByIdAndUpdate(tickedId, updateData);
            updatedTicket = await Ticket.findById(tickedId)
            return res.status(200).json({message:'Updated', data:updatedTicket})   
        }
        return res.status(403).json({error:"error", message:"Only an agent or admin can take this action"})
        
    } catch(err){
        console.log(err)
        next(err)
    }    
}

/*
@params userId
@return object 
all tickets object belonging to user
 */
exports.getMyTickets = async (req, res, next) => {
    try{
        const tickets = await Ticket.find({user:req.user.userId});
        res.status(200).json({data:tickets, message:"Succesfully fetch all tickets"})
    } catch(err){
        next(err)
    }
    
}

/* 
@return object
Get the detail of a ticket with its comments
*/
exports.getTicketDetail = async(req, res, next) =>{
    try{
        let ticket = await Ticket.findOne({_id:req.params.ticketId});
        const comment = await Comment.find({ticket:req.params.ticketId}).populate("user").exec();
        res.status(200).json({data:ticket, comments: comment, message:"Succesfully fetch ticket detail"})
    } catch( err) {
        next(err)
    }
}


/* 
@return array
This returns all ticker : Action limited to admin and agent 
*/
exports.getAllTickets = async (req, res, next) => {
    try{
        const loggedInUser = await User.findById(req.user.userId);
        if (loggedInUser.role == "admin" || loggedInUser.role == "agent"){
            const tickets = await Ticket.find({});
            return res.status(200).json({data:tickets, message:"Succesfully fetch all tickets"})
        }else{
            const tickets = await Ticket.find({user:req.user.userId});
            return res.status(200).json({data:tickets, message:"Succesfully fetch all tickets"})
        }
    } catch (err){
        next(err)
    }
    
}

exports.generateReport = async (req, res, next) => {
    try{
        const checkIfAgentOrAdmin = await User.findById(req.user.userId);
        if (checkIfAgentOrAdmin.role != "admin" && checkIfAgentOrAdmin.role != "agent"){
            return res.status(403).json({error:"error", message:"This can only be perform by agent or admin"});
        }
        const lastOneMonthTicket = await Ticket.find({createdAt:mdq.thisMonth()});

        if(lastOneMonthTicket.length > 0){
            const csv = await json2csv(lastOneMonthTicket, {fields});
            const dateTime = await moment().format('YYYYMMDDhhmmss');
            const base = await path.join(__dirname, "..", "public", "exports")
            await fs.mkdir(base, {recursive:true}, (err) =>{
                if (err){
                    return res.json(err);
                }
            })
            const filePath = await path.join(base, "csv-" + dateTime + ".csv")
            
            console.log(filePath)
            
            await fs.writeFile(filePath, csv, function (err) {
                if (err) {
                    return res.json(err);
                }else{
                    const doc = res.download("./public/exports/csv-" + dateTime + ".csv");    
                    setTimeout(()=>{
                        fs.unlink(filePath, ()=>{
                            console.log('file deleted after 10s')
                        })
                    }, 10000)
                    return doc
                }
                
                
            });
            
        }else{
            return res.json({error:"error", message:"No data found for the request"})
        }
        
    } catch (err){
        next(err)
    }
    
}
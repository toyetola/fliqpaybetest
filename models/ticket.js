const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const status = {
    OPEN: "open",
    CLOSED: "closed",
}

let TicketSchema = new Schema({
    subject : {
        type : String,
        required: true
    },
    content : {
        type : String,
        required: [true, 'Your ticket content cannot be blank']
    },
    createdAt: {
        type : Date,
        default : Date.now
    },
    updatedAt:{
        type : Date,
        default : null
    },
    status : {
        type: String,
        default: status.OPEN,
        enum: [status.OPEN, status.CLOSED]
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    comments: { type: mongoose.Schema.Types.ObjectId, ref: "Comment"},
})

const Ticket = mongoose.model("Ticket", TicketSchema);
module.exports = Ticket;


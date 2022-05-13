const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let CommentSchema = new Schema({
    comment : {
        type : String,
        required: [true, 'Your comment content cannot be blank']
    },
    ticket: {type : Schema.Types.ObjectId, ref: "Ticket", required : true},
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    createdAt: {
        type : Date,
        default : Date.now
    }
})

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;


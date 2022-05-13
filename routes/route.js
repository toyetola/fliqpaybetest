const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');
const verifyToken = require('../middleware/auth');

router.get('/', (req, res)=>{
    res.send('Welcome to this ticketing system')
});

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.use(verifyToken)


router.get('/api/user/:userId',  userController.allowIfloggedin, userController.getUser);

//Ticket operations
/* 
@params usedId TicketId
@returns object
*/
router.post('/api/user/:userId/tickets',  userController.allowIfloggedin, ticketController.createTicket)
router.get('/api/user/:userId/tickets',  userController.allowIfloggedin, ticketController.getAllTickets)
router.get('/api/user/:userId/tickets/:ticketId',  userController.allowIfloggedin, ticketController.getTicketDetail)
router.patch('/api/user/:userId/ticket/:ticketId',  userController.allowIfloggedin, ticketController.updateTicket)
router.post('/api/comment/user/:userId/ticket/:ticketId',  userController.allowIfloggedin, commentController.createComment)
//delete user : admin only
router.delete('/api/user/:userId', userController.allowIfloggedin, userController.deleteUser)
router.patch('/api/user/:userId', userController.allowIfloggedin, userController.updateUser)

/* 
route to generate csv report by agent or admin
for all request closed in the last one month
*/
router.get('/api/generateReport', userController.allowIfloggedin, ticketController.generateReport)

module.exports = router;
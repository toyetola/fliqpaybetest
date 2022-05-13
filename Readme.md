
**Customer Suppot Ticket System**

Fork/Clone the app

Run 

```
npm install 
```
to install dependencies

Run n
```
npm run dev 
```
to run the app in development

Create a ```.env``` file to include the following keys

```
JWT_SECRET = ANY_SECRET_KEY
PORT = 5000
DB_URI = YOUR_MONGO_DB_URL
DB_URI_TEST = YOUR_TEST_DB_URL
MODE = "dev"
```


This system have user roles defined in ```./auth/role.js```

 - __admin__ - top-level who can do everything (including managing users) agents can do and beyond
 - __agent__ - agent see request tickets, comments on tickets and update ticket statuses
 - __customer__ - create an account, submit support tickets, view owned support request and statuses, comments on ticket when an agent or admin as replied.

 **Routes**

 This system implement endpoints that can be found in ```routes/route.js```

 The following are the existing routes implemeted

 ```
 POST /signup for users to create an account - public for customer roles only. Any admin role has to be created secretely or by an admin

 POST /login  //for registered users to login

 POST /api/user/userId/tickets to create a new ticket

 GET /api/user/userId/tickets //all tickets created by reuesting customer. For admin or agent gets all tickets

 GET /api/user/:userId/tickets/:ticketId //to fetch ticket detail, this will usually come with ticket comments and users who made the commment

 PATCH /api/user/:userId/ticket/:ticketId //this will help and admin or an agent to edit ticket status to 'open' or 'closed' by just supplying `status` rather using PUT with will be wrong in this case

 POST api/comment/user/:userId/ticket/:ticketId //for all roles to make their comment

DELETE /api/user/:userId to delete user only an admin role can do this

PATCH /api/user/:userId only an admin can use this to update user roles and other necessary information. PATCH is more efficient than PUT here.

GET /api/generateReport //An admin or agent can use this to generate report of the last one month.


 ```

 **Schema**

 This will be found in folder ```models``` for comments, tickets and users models. Some object referencing was done to take advantage of the not so verbose mongoose relationship


 **Contollers**

 These are files that processes the requests are the land on routes, implemented functions that manupulates the request and determines responses. Fond in folder ```controllers```

 **Auth Middleware**


 I have a verify token middleware that checks every non-public route for token supplied in header ```[x-access-token]```. It determines the validity and correctness of the token in accordance with the user try to perform the request

 Other midddlewares such as the one added by bodyParser enhances processing the request and accessing request body.

 **Tests**

 Various major tests are written in folder `./tests ` which is driven by Jest and Supertest for integration testing of requests.

 Run test with

 ```
 npm run test
 ```


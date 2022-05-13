const app = require("../test-server");
const mongoose = require("mongoose");
const supertest = require("supertest");
require("dotenv").config()
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const Ticket = require("../models/ticket");
const User = require("../models/user");



beforeAll((done) => {
  mongoose.connect(process.env.DB_URI_TEST,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () =>  done());
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
  });
});


let ticket;



describe('Customer Endpoints', () => {
  it('should create a new ticket by customer', async () => {
    const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password: "1234567"})
    const userPayload = {
      userId: newUser._id
    }    
    
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
      .post(`/api/user/${newUser._id}/tickets`)
      .set('x-access-token', jwtToken)
      .send({
        subject: "I need some help from agent",
        content: 'Please attend to my account',
      })
    ticket = res.body.data;
    expect(res.statusCode).toEqual(201)
    expect(res.body.data).toBeTruthy();
    expect(res.body.data).toHaveProperty("subject");
  })

  it('should reject a comment on ticket because ONLY admin user can do that', async () => {
    const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password:"1234567" })
    const userPayload = {
      userId: newUser._id
    }    
    
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
      .post(`/api/comment/user/${newUser._id}/ticket/${ticket._id}`)
      .set('x-access-token', jwtToken)
      .send({
        content: 'I have a new comment',
      })
    expect(res.statusCode).toEqual(403)
    expect(res.body.error).toBeTruthy();
    expect(res.body.error).toEqual("You need to wait to an  agent to respond first");
  })

  it('should reject the creation of admin user using /signup : admin or agent can be created by an admin| an admin will be created manually', async () => {
    
    const userPayload = {
       firstname: "Test", lastname: "User", email:"test@user.com", password:"1234567", "role":"agent" 
    }    
    
    // const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
      .post(`/signup`)
      .send(userPayload)
    expect(res.statusCode).toEqual(403)
    expect(res.body.message).toBeTruthy();
    expect(res.body.message).toEqual("Only an admin user can add another admin user");
  })

  it('Get all tickets created by loggedin customer with comments', async () =>{
    const hashPass = await bcrypt.hash("1234567", 10)
    const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password:hashPass})
    const userPayload = {
      userId: newUser._id
    }    
    
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
      .get(`/api/user/${newUser._id}/tickets`)
      .set('x-access-token', jwtToken)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
    expect(res.body).toHaveProperty("data");
  })
})

describe('Create Admin and perform admin rights', () => {
  let adminId;
  it("should create admin user", async()=>{
    const hashPass = await bcrypt.hash("1234567", 10)
    const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password:hashPass, role: "admin" })
    adminId = newUser._id
    expect(newUser).toBeTruthy();
    expect(newUser).toHaveProperty("email");
    expect(newUser.role).toEqual("admin");
  })

  it("Create role and edit role as admin", async()=>{
    const hashPass = await bcrypt.hash("1234567", 10)
    const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password:hashPass})
    const userPayload = {
      userId: adminId
    }    
    
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
      .patch(`/api/user/${newUser._id}`)
      .set('x-access-token', jwtToken)
      .send({
        "role":"agent"
      })
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
    expect(res.body).toHaveProperty("data");
  })

  it('Get all tickets created by loggedin customer or customers depending on role', async () =>{
    const hashPass = await bcrypt.hash("1234567", 10)
    const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password:hashPass})
    const userPayload = {
      userId: newUser._id
    }    
    
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
      .get(`/api/user/${newUser._id}/tickets`)
      .set('x-access-token', jwtToken)
      .send({
        "role":"agent"
      })
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
    expect(res.body).toHaveProperty("data");
  })

  
})

describe('Agents rights', () => {
  let agentId;
  let ticketId;
  it("should create agent user", async()=>{
    const hashPass = await bcrypt.hash("1234567", 10)
    const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password:hashPass, role: "agent" })
    agentId = newUser._id
    expect(newUser).toBeTruthy();
    expect(newUser).toHaveProperty("email");
    expect(newUser.role).toEqual("agent");
  })

  it('should simulate customer creating ticket', async () =>{
    const hashPass = await bcrypt.hash("1234567", 10)
    const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password:hashPass})
    const userPayload = {
      userId: newUser._id
    }    
    
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
      .post(`/api/user/${newUser._id}/tickets`)
      .set('x-access-token', jwtToken)
      .send({
        subject: "I need some help from agent",
        content: 'Please attend to my account',
      })
    ticketId = res.body.data._id;
    expect(res.statusCode).toEqual(201)
    expect(res.body.data).toBeTruthy();
    expect(res.body.data).toHaveProperty("content");
  })

  it('should comment on the ticket', async () =>{
    const userPayload = {
      userId: agentId
    }
    console.log(ticketId)
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
    .post(`/api/comment/user/${agentId}/ticket/${ticketId}`)
    .set('x-access-token', jwtToken)
    .send({
      comment: 'Hi, I am here to help. Request being processed.',
    })
    expect(res.statusCode).toEqual(201)
    expect(res.body.data).toBeTruthy();
    expect(res.body.data).toHaveProperty("comment");
  })

  it('Updates ticket status', async () =>{
    const userPayload = {
      userId: agentId
    }
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
    .patch(`/api/user/${agentId}/ticket/${ticketId}`)
    .set('x-access-token', jwtToken)
    .send({
      "status":"closed"
    })
    expect(res.statusCode).toEqual(200)
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.status).toEqual("closed");
  })

  it('gets a ticket detail with its comments', async () =>{
    const userPayload = {
      userId: agentId
    }    
    
    const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
    const res = await supertest(app)
      .get(`/api/user/${agentId}/tickets/${ticketId}`)
      .set('x-access-token', jwtToken)
      .send({
        "role":"agent"
      })
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
    expect(res.body).toHaveProperty("comments");
    expect(res.body.data).toHaveProperty("content");
  })

})
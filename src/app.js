const express = require('express');
const UserRouter = require('./user/UserRouter');

// initializing [app]'s server
    const app = express();
// initializing [app]'s server
// initializing json body parser
    app.use(express.json());
// initializing json body parser
// connecting [router]
    app.use(UserRouter);
// connecting [router]

module.exports = app;
const express = require('express');
const User = require('./user/User');
const app = express();

// json body parser
    app.use(express.json());
// json body parser
// handling the [app.post] [req]uest to ['/api/1.0/users'] endpoint
    app.post('/api/1.0/users', (req, res)=>{
        User.create(req.body).then(()=>{
            return res.send({message: 'User created'});
        });
    });
// handling the [app.post] [req]uest to ['/api/1.0/users'] endpoint

module.exports = app;
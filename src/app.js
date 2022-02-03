const express = require('express');
const app = express();

// handling the [app.post] [req]uest to ['/api/1.0/users'] endpoint
    app.post('/api/1.0/users', (req, res)=>{
        return res.send({message: 'User created'});
    });
// handling the [app.post] [req]uest to ['/api/1.0/users'] endpoint

module.exports = app;
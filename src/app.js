const express = require('express');
const User = require('./user/User');
const bcrypt = require('bcrypt');

// initializing [app]'s server
    const app = express();
// initializing [app]'s server
// initializing json body parser
    app.use(express.json());
// initializing json body parser
// handling ['/api/1.0/users'] endpoint
    app.post('/api/1.0/users', (req, res)=>{
        
        // hashing [req.body.password] and [then] saving [user]
            bcrypt.hash(req.body.password, 10).then((hash)=>{
                
                // saving [user] in [User]'s table
                    const user = {
                        username: req.body.username,
                        email: req.body.email,
                        password: hash
                    };
                    User.create(user).then(()=>{
                        return res.send({message: 'User created'});
                    });
                // saving [user] in [User]'s table

            });
        // hashing [req.body.password] and [then] saving [user]

    });
// handling ['/api/1.0/users'] endpoint

module.exports = app;
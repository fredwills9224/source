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
        
        // sending [req.body.password] to [hash()] and [then()] saving [hashedPassword] to [user]
            bcrypt.hash(req.body.password, 10).then((hashedPassword)=>{
                
                // saving [user] in [User]'s table and [then()] sending success message
                    
                    // destructuring [user] from [req.body] option 1
                        // const user = {
                        //     username: req.body.username,
                        //     email: req.body.email,
                        //     password: hashedPassword
                        // };
                    // destructuring [user] from [req.body] option 1
                    // destructuring [user] from [req.body] option 2
                        // const user = Object.assign(
                        //     {}, req.body, { password: hashedPassword }
                        // );
                    // destructuring [user] from [req.body] option 2
                    // destructuring [user] from [req.body] option 3
                        const user = { 
                            ...req.body, 
                            password: hashedPassword 
                        };
                    // destructuring [user] from [req.body] option 3
                    User.create(user).then(()=>{
                        return res.send({message: 'User created'});
                    });

                // saving [user] in [User]'s table and [then()] sending success message

            });
        // sending [req.body.password] to [hash()] and [then()] saving [hashedPassword] to [user]

    });
// handling ['/api/1.0/users'] endpoint

module.exports = app;
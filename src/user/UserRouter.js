const express = require('express');
const router = express.Router();
const UserService = require('./UserService');

// [User.create()] w/ middlware

    router.post('/api/1.0/users', (req, res, next)=>{

        const user = req.body;
        if(user.username === null){
            return res.status(400).send({
                 
                validationErrors:{
                    username: 'Username cannot be null'
                }
                 
            });
        }
        next();
        
    }, 
    async (req, res)=>{
        await UserService.save(req.body);
        return res.send({ message: 'User created' });
    });

// [User.create()] w/ middlware

module.exports = router;
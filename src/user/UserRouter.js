const express = require('express');
const router = express.Router();
const UserService = require('./UserService');

// middlware
    const validateUsername = (req, res, next)=>{

        const user = req.body;
        if(user.username === null){
            return res.status(400).send({

                validationErrors:{
                    username: 'Username cannot be null'
                }

            });
        }
        next();

    }
// middlware

// [User.create()]

    router.post('/api/1.0/users', validateUsername, async (req, res)=>{
        await UserService.save(req.body);
        return res.send({ message: 'User created' });
    });

// middlware

// middlware

// [User.create()]

module.exports = router;
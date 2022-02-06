const express = require('express');
const router = express.Router();
const UserService = require('./UserService');

// middlware

    const validateUsername = (req, res, next)=>{

        const user = req.body;
        if(user.username === null){
            req.validationErrors = {
                username: 'Username cannot be null'
            };
        }
        next();

    };
    const validateEmail = (req, res, next)=>{

        const user = req.body;
        if (user.email === null){
            req.validationErrors = {
                ... req.validationErrors,
                email: 'E-mail cannot be null'
            };
        }
        next();

    };

// middlware
// [User.create()]

    router.post('/api/1.0/users', validateUsername, validateEmail, async (req, res)=>{
    
        if(req.validationErrors){
            const response = {validationErrors: { ...req.validationErrors }};
            return res.status(400).send(response);
        }
        await UserService.save(req.body);
        return res.send({ message: 'User created' });
    
    });

// [User.create()]

module.exports = router;
const express = require('express');
const router = express.Router();
const UserService = require('./UserService');
const { check, validationResult } = require('express-validator');

// [User.create()]

    router.post('/api/1.0/users', check('username').notEmpty(), check('email').notEmpty(), async (req, res)=>{
    
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const validationErrors = {};
            errors.array().forEach(error => (validationErrors[error.param] = error.msg));
            return res.status(400).send({ validationErrors: validationErrors });
        }
        await UserService.save(req.body);
        return res.send({ message: 'User created' });
    
    });

// [User.create()]

module.exports = router;
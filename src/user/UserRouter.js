const express = require('express');
const router = express.Router();
const UserService = require('./UserService');
const { check, validationResult } = require('express-validator');
const ValidationException = require('../error/ValidationException');

// [User].post

    router.post('/api/1.0/users',
        check('username')
            .notEmpty()
            .withMessage('username_null')
            .bail()
            .isLength({ min: 4, max: 32 })
            .withMessage('username_size')
        , 
        check('email')
            .notEmpty()
            .withMessage('email_null')
            .bail()
            .isEmail()
            .withMessage('email_invalid')
            .bail()
            .custom( async (email)=> {

                const user = await UserService.findByEmail(email);
                if(user){
                    throw new Error('email_inuse');
                }

            })
        ,
        check('password')
            .notEmpty()
            .withMessage('password_null')
            .bail()
            .isLength({ min: 6 })
            .withMessage('password_size')
            .bail()
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
            .withMessage('password_pattern')
        , 
        async (req, res, next)=>{
    
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(new ValidationException(errors.array()));
            }
            try{
                await UserService.save(req.body);
                return res.send({ message: req.t('user_create_success') });
            }catch(err){
                next(err);
            }
            
        }
    );

// [User].post
// [token].post

    router.post('/api/1.0/users/token/:token', async (req, res, next)=>{

        const token = req.params.token;
        try{
            await UserService.activate(token);
            return res.send({ message: req.t('account_activation_success') });
        }catch(err){
            next(err);
        }

    });

// [token].post
// [User].get
    router.get('/api/1.0/users', async (req, res)=>{        
        
        let page = req.query.page ? Number.parseInt(req.query.page) : 0;
        if(page < 0){
            page=0;
        }
        let size = req.query.size ? Number.parseInt(req.query.size) : 10;
        if(size > 10 || size < 1){
            size = 10;
        }
        const users = await UserService.getUsers(page, size);
        res.send(users);

    });
// [User].get
module.exports = router;
const express = require('express');
const router = express.Router();
const UserService = require('./UserService');

// [User.create()]
    router.post('/api/1.0/users', async(req, res)=>{
        await UserService.save(req.body);
        return res.send({ message: 'User created' });
    });
// [User.create()]

module.exports = router;
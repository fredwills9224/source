const User = require('./User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const EmailException = require('../email/EmailException');
const EmailService = require('../email/EmailService');
const sequelize = require('../config/database');
const InvalidTokenException = require('./InvalidTokenException');

const generateToken = (length)=>{
    return crypto.randomBytes(length).toString('hex').substring(0, length);
};
// [save]s [user] with [hashedPassword]
    const save = async(body)=>{

        const { username, email, password } = body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, email, password: hashedPassword, activationToken: generateToken(16) };
        const transaction = await sequelize.transaction();
        await User.create(user, {transaction });
        try{
            await EmailService.sendAccountActivation(email, user.activationToken);
            await transaction.commit();            
        }catch (err){
            await transaction.rollback();
            throw new EmailException();
        }
    
    };
// [save]s [user] with [hashedPassword]
// find [user] by email
    const findByEmail = async (email)=>{
        return await User.findOne({ where: { email: email } });
    };
// find [user] by email
// find [user] by token, set [inactive] prop to false + [save]
    const activate = async (token)=>{

        const user = await User.findOne({ where: { activationToken: token } });
        if(!user){
            throw new InvalidTokenException();
        }
        user.inactive = false;
        user.activationToken = null;
        await user.save();

    }; 
// find [user] by token, set [inactive] prop to false + [save]
// [getUsers]

    const getUsers = async (page, size)=>{
        
        const usersWithCount = await User.findAndCountAll({
            where: { inactive: false },
            attributes: ['id', 'username', 'email'],
            limit: size,
            offset: page*size
        });
        return {
            content: usersWithCount.rows,
            page,
            size,
            totalPages: Math.ceil( usersWithCount.count/size )
        };
    
    };

// [getUsers]

module.exports = { save, findByEmail, activate, getUsers };
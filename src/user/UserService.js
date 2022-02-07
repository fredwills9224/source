const User = require('./User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const EmailService = require('../email/EmailService');
const sequelize = require('../config/database');

const generateToken = (length)=>{
    return crypto.randomBytes(length).toString('hex').substring(0, length);
};
// [save]s [user] with [hashedPassword]
    const save = async(body)=>{

        const { username, email, password } = body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, email, password: hashedPassword, activationToken: generateToken(16) };
        const transaction = await sequelize.transaction();
        await User.create(user);
        try{
            await EmailService.sendAccountActivation(email, user.activationToken);
            await transaction.commit();            
        }catch (err){
            await transaction.rollback();
        }
    
    };
// [save]s [user] with [hashedPassword]
// finds [user] by email
    const findByEmail = async (email)=>{
        return await User.findOne({ where: { email: email } });
    };
// finds [user] by email

module.exports = { save, findByEmail };
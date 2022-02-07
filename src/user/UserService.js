const User = require('./User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const nodemailerStub = require('nodemailer-stub');

const generateToken = (length)=>{
    return crypto.randomBytes(length).toString('hex').substring(0, length);
};
// [save]s [user] with [hashedPassword]
    const save = async(body)=>{

        const { username, email, password } = body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, email, password: hashedPassword, activationToken: generateToken(16) };
        await User.create(user);
        const transporter = nodemailer.createTransport(nodemailerStub.stubTransport);
        await transporter.sendMail({
            
            from: 'My App <info@my-app.com>',
            to: email,
            subject: 'Account Activation',
            html: `Token is ${user.activationToken}`

        });
    
    };
// [save]s [user] with [hashedPassword]
// finds [user] by email
    const findByEmail = async (email)=>{
        return await User.findOne({ where: { email: email } });
    };
// finds [user] by email

module.exports = { save, findByEmail };
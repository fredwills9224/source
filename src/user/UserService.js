const User = require('./User');
const bcrypt = require('bcrypt');
const EmailException = require('../email/EmailException');
const EmailService = require('../email/EmailService');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const InvalidTokenException = require('./InvalidTokenException');
const NotFoundException = require('../error/NotFoundException');
const { randomString } = require('../shared/generator');
const TokenService = require('../auth/TokenService');
const FileService = require('../file/FileService');

// [save]s [user] with [hashedPassword]
    const save = async(body)=>{

        const { username, email, password } = body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, email, password: hashedPassword, activationToken: randomString(16) };
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

    const getUsers = async (page, size, authenticatedUser)=>{
        
        const usersWithCount = await User.findAndCountAll({
            where: { 
                inactive: false,
                id:{
                    [Sequelize.Op.not]: authenticatedUser ? authenticatedUser.id : 0
                } 
            },
            attributes: ['id', 'username', 'email','image'],
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
// [getUser]
    const getUser = async (id)=>{

        const user = await User.findOne({
            where: {
                id: id,
                inactive: false
            },
            attributes: ['id', 'username', 'email', 'image']
        });
        if(!user){
            throw new NotFoundException('user_not_found');
        }
        return user;

    };
// [getUser]
// [updateUser]

    const updateUser = async (id, updatedBody)=>{
        
        const user = await User.findOne({ where: { id: id } });
        user.username = updatedBody.username;
        if(updatedBody.image){

            if(user.image){
                await FileService.deleteProfileImage(user.image);
            }
            user.image = await FileService.saveProfileImage(updatedBody.image);

        }
        await user.save();
        return{
            id: id,
            username: user.username,
            email: user.email,
            image: user.image
        };
        
    };

// [updateUser]
// [deletUser]

    const deleteUser = async (id)=>{
        const user = await User.findOne({ where: { id: id } });
        await FileService.deleteUserFiles(user);
        await user.destroy();
    };

// [deletUser]
// [passwordReset]
    const passwordResetRequest = async (email)=>{

        const user = await findByEmail(email);
        if(!user){
            throw new NotFoundException('email_not_inuse');
        }
        user.passwordResetToken = randomString(16);
        await user.save();
        try{
            await EmailService.sendPasswordReset(email, user.passwordResetToken);
        }catch(err){
            throw new EmailException();
        }

    };
// [passwordReset]
// [updatePassword]
    const updatePassword = async (updateRequest)=>{

        const user = await findByPasswordResetToken(updateRequest.passwordResetToken);
        const updatedHashedPassword = await bcrypt.hash(updateRequest.password, 10);
        user.password = updatedHashedPassword;
        user.passwordResetToken = null;
        user.inactive = false;
        user.activationToken = null;
        await user.save();
        await TokenService.clearTokens(user.id);

    };
// [updatePassword]
// [findByPasswordResetToken]
    const findByPasswordResetToken = (token)=>{
        return User.findOne({where: { passwordResetToken: token }});
    };
// [findByPasswordResetToken]

module.exports = { 
    save, findByEmail, activate,
    getUsers, getUser, updateUser,
    deleteUser,passwordResetRequest,
    updatePassword, findByPasswordResetToken
};
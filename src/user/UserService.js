const User = require('./User');
const bcrypt = require('bcrypt');

// [save]s [user] with [hashedPassword]
    const save = async(body)=>{

        const { username, email, password } = body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, email, password: hashedPassword };
        await User.create(user);
    
    };
// [save]s [user] with [hashedPassword]
// finds [user] by email
    const findByEmail = async (email)=>{
        return await User.findOne({ where: { email: email } });
    };
// finds [user] by email

module.exports = { save, findByEmail };
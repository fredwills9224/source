const User = require('./User');
const bcrypt = require('bcrypt');

// [save]s [user] with [hashedPassword]
    const save = async(body)=>{
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const user = { ...body, password: hashedPassword };
        await User.create(user);
    };
// [save]s [user] with [hashedPassword]


module.exports = { save };
const app = require('./src/app');
const sequelize = require('./src/config/database');
const User = require('./src/user/User');
const bcrypt = require('bcrypt');
const TokenService = require('./src/auth/TokenService');

const addUsers = async (activeUserCount, inactiveUserCount=0)=>{

    const hashedPassword = await bcrypt.hash('User1password', 10);
    for(let i=0; i<activeUserCount+inactiveUserCount; i++){
        await User.create({
            username: `user${i +1}`,
            email: `user${i +1}@mail.com`,
            inactive: i>= activeUserCount,
            password: hashedPassword
        });
    }

};
sequelize.sync({ force: true }).then(async ()=>{
    await addUsers(25);
});
TokenService.scheduleCleanup();

app.listen(3000, ()=> console.log('app is running!!!!'));
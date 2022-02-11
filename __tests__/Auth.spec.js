const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');
const bcrypt = require('bcrypt');

beforeAll(async ()=>{
    await sequelize.sync();
});
beforeEach(async()=>{
    await User.destroy({ truncate: true });
});

const addUsers = async ()=>{

    const user = { 
        username: 'user1',
        email: 'user1@mail.com',
        password: 'User1password',
        inactive: false
    };
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    return await User.create(user);

};
const postAuthentication = async (credentials)=>{

    return await request(app).post('/api/1.0/auth').send(credentials);

};
describe('Authentication', ()=>{

    it('returns 200 when credentials are correct', async ()=>{

        await addUsers();
        const response = await postAuthentication({ 
            email: 'user1@mail.com', 
            password: 'User1password' 
        });
        expect(response.status).toBe(200);

    });
    it('returns only user id and username when login success', async ()=>{

        const user = await addUsers();
        const response = await postAuthentication({ 
            email: 'user1@mail.com',
            password: 'User1password'
        });
        expect(response.body.id).toBe(user.id);
        expect(response.body.username).toBe(user.username);
        expect(Object.keys(response.body)).toEqual(['id', 'username']);

    });

});
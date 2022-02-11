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

const addUser = async ()=>{

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
const postAuthentication = async (credentials, options = {})=>{

    let agent = request(app).post('/api/1.0/auth');
    if(options.language){
        agent.set('Accept-Language', options.language);
    }
    return await agent.send(credentials);

};
describe('Authentication', ()=>{

    // [validUser]

        it('returns 200 when credentials are correct', async ()=>{

            await addUser();
            const response = await postAuthentication({
                email: 'user1@mail.com',
                password: 'User1password'
            });
            expect(response.status).toBe(200);

        });
        it('returns only user id and username when login success', async ()=>{

            const user = await addUser();
            const response = await postAuthentication({
                email: 'user1@mail.com',
                password: 'User1password'
            });
            expect(response.body.id).toBe(user.id);
            expect(response.body.username).toBe(user.username);
            expect(Object.keys(response.body)).toEqual(['id', 'username']);

        });

    // [validUser]
    // [invalidUser]

        it('returns 401 when user does not exist', async ()=>{

            const response = await postAuthentication({ 
                email: 'user1@mail.com',
                password: 'User1password' 
            });
            expect(response.status).toBe(401);

        });
        it('returns proper error body when authentication fails', async ()=>{

            const nowInMillis = new Date().getTime();
            const response = await postAuthentication({ 
                email: 'user1@mail.com',
                password: 'User1password'
            });
            const error = response.body;
            expect(error.path).toBe('/api/1.0/auth');
            expect(error.timestamp).toBeGreaterThan(nowInMillis);
            expect(Object.keys(error)).toEqual(['path', 'timestamp', 'message']);

        });
        it.each`
            language | message
            ${'tr'}  | ${'Kullanici bilgileri hatali'}
            ${'en'}  | ${'Incorrect credentials'}
            `('return $message when authentication fails and language is set as $language', 
            async ({language, message})=>{

            const response = await postAuthentication({
                email: 'user1@mail.com',
                password: 'User1password'
            }, {language});
            expect(response.body.message).toBe(message);

        });

    // [invalidUser]

});
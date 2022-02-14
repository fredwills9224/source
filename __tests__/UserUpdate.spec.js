const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');
const bcrypt = require('bcrypt');
const en = require('../locales/en/translation.json');
const tr = require('../locales/tr/translation.json');

beforeAll(async ()=>{
    await sequelize.sync();
});
beforeEach(async ()=>{
    await User.destroy({ truncate: true });
});

const activeUser = { 
    username: 'user1',
    email: 'user1@mail.com',
    password: 'User1password',
    inactive: false
};
const addUser = async (user = {...activeUser})=>{

    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    return await User.create(user);

};
const putUser = async (id = 5, body = null, options = {})=>{

    let agent = request(app);
    let token;
    if(options.auth){
        const response = await agent.post('/api/1.0/auth').send(options.auth);
        token = response.body.token;
    }
    agent = request(app).put('/api/1.0/users/' + id);
    if(options.language){
        agent.set('Accept-Language', options.language);
    }
    if(token){
        agent.set('Authorization', `Bearer ${token}`);
    }
    return agent.send(body);

};
describe('User Update', ()=>{

    // in[validUser]

        it('returns forbidden when request sent without basic authorization', async ()=>{

            const response = await request(app).put('/api/1.0/users/5').send();
            expect(response.status).toBe(403);

        });
        it.each`
            language | message
            ${'tr'}  | ${tr.unauthorized_user_update}
            ${'en'}  | ${en.unauthorized_user_update}
            `('returns error body with $message for unauthorized request when language is $language',
            async ({ language, message })=>{

            const nowInMillis = new Date().getTime();
            const response = await putUser(5, null, {language});
            expect(response.body.path).toBe('/api/1.0/users/5');
            expect(response.body.timestamp).toBeGreaterThan(nowInMillis);
            expect(response.body.message).toBe(message);

        });
        it('returns forbidden when request sent with incorrect email in basic authorization',
            async ()=>{

            await addUser();
            const response = await putUser(
                 
                5,
                null,
                { 
                    auth: {
                        email: 'user1000@mail.com',
                        password: 'User5password'
                    }
                }
                 
            );
            expect(response.status).toBe(403);

        });
        it('returns forbidden when request sent with incorrect password in basic authorization',
            async ()=>{

            await addUser();
            const response = await putUser(
                 
                5,
                null,
                { 
                    auth: {
                        email: 'user5@mail.com',
                        password: 'password'
                    }
                }
                 
            );
            expect(response.status).toBe(403);

        });
        it('returns forbidden when update request is sent with correct credentials but for different user',
            async ()=>{

            await addUser();
            const userToBeUpdated = await addUser({
                ...activeUser,
                username: 'user2',
                email: 'user2@mail.com'
            }); 
            const response = await putUser(
                 
                userToBeUpdated.id,
                null,
                { 
                    auth: {
                        email: 'user5@mail.com',
                        password: 'User5password'
                    }
                }
                 
            );
            expect(response.status).toBe(403);

        });
        it('returns forbidden when update request is sent by inactive user with correct credentials for its own user',
            async ()=>{

            const inactiveUser = await addUser({ ...activeUser, inactive: true }); 
            const response = await putUser(
                 
                inactiveUser.id,
                null,
                { 
                    auth: {
                        email: 'user5@mail.com',
                        password: 'User5password'
                    }
                }
                 
            );
            expect(response.status).toBe(403);

        });

    // in[validUser]
    // [validUser]

        it('returns 200 ok when valid update request sent from authorized user',
            async ()=>{

            const savedUser = await addUser();
            const validUpdate = { username: 'user1-updated' };
            const response = await putUser(
                
                savedUser.id,
                validUpdate,
                { 
                    auth: 
                    {
                        email: savedUser.email,
                        password: 'User1password'
                    } 
                }

            );
            expect(response.status).toBe(200);

        });
        it('updates username in database when valid update request is sent from authorized user',
            async ()=>{

            const savedUser = await addUser();
            const validUpdate = { username: 'user1-updated' };
            await putUser(
                
                savedUser.id,
                validUpdate,
                { 
                    auth: 
                    {
                        email: savedUser.email,
                        password: 'User1password'
                    } 
                }

            );
            const inDBUser = await User.findOne({ where: { id: savedUser.id } });
            expect(inDBUser.username).toBe(validUpdate.username);

        });

    // [validUser]

});
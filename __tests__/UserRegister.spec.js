const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll(()=>{
    return sequelize.sync();
});
beforeEach(()=>{
    return User.destroy({ truncate: true });            
});

const validUser = {
    username: 'user1',
    email: 'user1@mail.com',
    password: 'user1password'
};
const postUser = (user = validUser)=>{
    return request(app).post('/api/1.0/users').send(user);
};
describe('User Registration', ()=>{

    // Valid post [req]uests

        it('returns 200 OK when signup request is valid', async ()=>{
            const response = await postUser();
            expect(response.status).toBe(200);
        }); 
        it('returns success message when signup request is valid', async ()=>{
            const response = await postUser();
            expect(response.body.message).toBe('User created');
        });
        it('saves the user to database', async ()=> {

            await postUser();
            const userList = await User.findAll();
            expect(userList.length).toBe(1);

        });
        it('saves the username and email to database', async ()=>{

            await postUser();
            const userList = await User.findAll();        
            const savedUser = userList[0];
            expect(savedUser.username).toBe('user1');
            expect(savedUser.email).toBe('user1@mail.com');

        });
        it('it hashes the password in database', async ()=>{

            await postUser();
            const userList = await User.findAll();
            const savedUser = userList[0];
            expect(savedUser.password).not.toBe('user1password');

        });

    // Valid post [req]uests
    // Invalid post [req]uests

        it('returns 400 when username is null', async ()=>{

            const response = await postUser({
                username: null,
                email: 'user1@mail.com',
                password: 'user1@mail.com'
            });
            expect(response.status).toBe(400);

        });
        it('returns validationErrorrs field in response body when error occurs', async ()=>{

            const response = await postUser({
                username: null,
                email: 'user1@mail.com',
                password: 'user1password'
            });
            const body = response.body;
            expect(body.validationErrors).not.toBeUndefined();

        });
        it('returns errors for both when username and email is null', async()=>{

            const response = await postUser({
                username: null,
                email: null,
                password: 'user1password'
            });
            const body = response.body;
            expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);

        });
        // dynamic test with pipe columns
            it.each`
                    field          |  value              | expectedMessage
                    ${'username'}  |  ${null}            | ${'Username cannot be null'}
                    ${'username'}  |  ${'usr'}           | ${'Must have min 4 and max 32 characters'}
                    ${'username'}  |  ${'a'.repeat(33)}  | ${'Must have min 4 and max 32 characters'}
                    ${'email'}     |  ${null}            | ${'E-mail cannot be null'}
                    ${'password'}  |  ${null}            | ${'Password cannot be null'} 
                `('returns  $expectedMessage when $field is $value', async ({ field, expectedMessage, value })=>{

                const user = {
                    username: 'user1',
                    email: 'user1@mail.com',
                    password: 'user1password'
                };
                user[field] = value;
                const response = await postUser(user);
                const body = response.body;
                expect(body.validationErrors[field]).toBe(expectedMessage);

            });
        // dynamic test with pipe columns

    // Invalid post [req]uests

});














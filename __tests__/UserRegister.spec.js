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
    password: 'User1password'
};
const postUser = (user = validUser, options = {})=>{

    const agent = request(app).post('/api/1.0/users');
    if(options.language){
        agent.set('Accept-Language', options.language);
    }
    return agent.send(user);

};
describe('User Registration', ()=>{

    // [postUser()] w/ [validUser]

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
            expect(savedUser.password).not.toBe('User1password');

        });

    // [postUser()] w/ [validUser]
    // [postUser] w/ in[validUser]

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
                password: 'User1password'
            });
            const body = response.body;
            expect(body.validationErrors).not.toBeUndefined();

        });
        it('returns errors for both when username and email is null', async()=>{

            const response = await postUser({
                username: null,
                email: null,
                password: 'User1password'
            });
            const body = response.body;
            expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);

        });
        // dynamic test with pipe columns
            
            const username_null = 'Username cannot be null';
            const username_size = 'Must have min 4 and max 32 characters';
            const email_null = 'E-mail cannot be null';
            const email_invalid = 'E-mail is not valid';
            const email_inuse = 'E-mail in use';
            const password_null = 'Password cannot be null';
            const password_size = 'Password must be at least 6 characters';
            const password_pattern = 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number';
            it.each`
                    field          |  value              | expectedMessage
                    ${'username'}  |  ${null}            | ${username_null}
                    ${'username'}  |  ${'usr'}           | ${username_size}
                    ${'username'}  |  ${'a'.repeat(33)}  | ${username_size}
                    ${'email'}     |  ${null}            | ${email_null}
                    ${'email'}     |  ${'mail.com'}      | ${email_invalid}
                    ${'email'}     |  ${'user.mail.com'} | ${email_invalid}
                    ${'email'}     |  ${'user@mail'}     | ${email_invalid}
                    ${'password'}  |  ${null}            | ${password_null} 
                    ${'password'}  |  ${'P4ssw'}         | ${password_size} 
                    ${'password'}  |  ${'alllowercase'}  | ${password_pattern} 
                    ${'password'}  |  ${'ALLUPPERCASE'}  | ${password_pattern} 
                    ${'password'}  |  ${'12344567890'}   | ${password_pattern} 
                    ${'password'}  |  ${'lowerandUPPER'} | ${password_pattern} 
                    ${'password'}  |  ${'lowerand5667'}  | ${password_pattern} 
                    ${'password'}  |  ${'UPPER44494'}    | ${password_pattern} 
                `('returns  $expectedMessage when $field is $value', async ({ field, expectedMessage, value })=>{

                const user = {
                    username: 'user1',
                    email: 'user1@mail.com',
                    password: 'User1password'
                };
                user[field] = value;
                const response = await postUser(user);
                const body = response.body;
                expect(body.validationErrors[field]).toBe(expectedMessage);

            });

        // dynamic test with pipe columns
        // [email_inuse]
            it(`returns ${email_inuse} use when same email is already in use`, async()=>{
                await User.create({ ...validUser });
                const response =  await postUser();
                expect(response.body.validationErrors.email).toBe(email_inuse);
            });
            it('returns errors for both username is null and email is in use', async ()=>{

                await User.create({ ...validUser });
                const response = await postUser({
                    username: null,
                    email: validUser.email,
                    password: 'User1password'
                });
                const body = response.body;
                expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
            
            });
        // [email_inuse]

    // [postUser] w/ in[validUser]
    // inactive mode
        
        it('creates user in inactive mode', async ()=>{
            
            await postUser();
            const users = await User.findAll();
            const savedUser = users[0];
            expect(savedUser.inactive).toBe(true);
        
        });
        it('creates user in inactive mode even when the request body contains inactive set as false',
            async ()=>{

            const newUser = { ...validUser, inactive: false };
            await postUser(newUser);
            const users = await User.findAll();
            const savedUser = users[0];
            expect(savedUser.inactive).toBe(true);

        });

    // inactive mode

});

describe('Internationalization', ()=>{

    // [postUser] w/ in[validUser]
        // dynamic test with pipe columns
            
            const username_null = 'Kullanici adi bos olamaz';
            const username_size = 'En az 4 en fazla 32 karakter olamali';
            const email_null = 'E-Posta bos olamaz';
            const email_invalid = 'E-Posta gecerli degil';
            const password_null = 'Sifre bos olamaz';
            const password_size = 'Sifre en az 6 karakter olmali';
            const password_pattern = 'Sifrede en az 1 buyuk, 1 kucuk harf ve 1 sayi bulunmalidir';
            const email_inuse = 'Bu E-Posta kullaniliyor';
            const user_create_success = 'Kullanici olusturuldu';
            it.each`
                    field          |  value              | expectedMessage
                    ${'username'}  |  ${null}            | ${username_null}
                    ${'username'}  |  ${'usr'}           | ${username_size}
                    ${'username'}  |  ${'a'.repeat(33)}  | ${username_size}
                    ${'email'}     |  ${null}            | ${email_null}
                    ${'email'}     |  ${'mail.com'}      | ${email_invalid}
                    ${'email'}     |  ${'user.mail.com'} | ${email_invalid}
                    ${'email'}     |  ${'user@mail'}     | ${email_invalid}
                    ${'password'}  |  ${null}            | ${password_null} 
                    ${'password'}  |  ${'P4ssw'}         | ${password_size} 
                    ${'password'}  |  ${'alllowercase'}  | ${password_pattern} 
                    ${'password'}  |  ${'ALLUPPERCASE'}  | ${password_pattern} 
                    ${'password'}  |  ${'12344567890'}   | ${password_pattern} 
                    ${'password'}  |  ${'lowerandUPPER'} | ${password_pattern} 
                    ${'password'}  |  ${'lowerand5667'}  | ${password_pattern} 
                    ${'password'}  |  ${'UPPER44494'}    | ${password_pattern} 
                `('returns  $expectedMessage when $field is $value when language is set as turkish', 
                async ({ field, expectedMessage, value })=>{
                
                const user = {
                    username: 'user1',
                    email: 'user1@mail.com',
                    password: 'User1password'
                };
                user[field] = value;
                const response = await postUser(user, { language: 'tr' });
                const body = response.body;
                expect(body.validationErrors[field]).toBe(expectedMessage);
            
            });
        
        // dynamic test with pipe columns
        // [email_inuse]
            it(`returns ${email_inuse} use when same email is already in use when language is set as turkish`,
                async()=>{

                await User.create({ ...validUser });
                const response =  await postUser({...validUser}, { language: 'tr' });
                expect(response.body.validationErrors.email).toBe(email_inuse);
            
            });
        // [email_inuse]
    // [postUser] w/ in[validUser]
    // [postUser] w/ [validUser]
        it(`returns success message of ${user_create_success} when signup request is valid and language is set as turkish`, 
            async ()=>{
            const response = await postUser({...validUser}, { language: 'tr' });
            expect(response.body.message).toBe(user_create_success);
        });
    // [postUser] w/ [validUser]

});
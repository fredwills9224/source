const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const Hoax = require('../src/hoax/Hoax');
const bcrypt = require('bcrypt');
const en = require('../locales/en/translation.json');
const tr = require('../locales/tr/translation.json');

beforeEach(async ()=>{
    await User.destroy({ truncate: { cascade: true } });
});

const activeUser = { 
    username: 'user1',
    email: 'user1@mail.com',
    password: 'User1password',
    inactive: false
};
// const credentials = { email: 'user1@mail.com', password: 'User1password' };
const addUser = async (user = {...activeUser})=>{

    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    return await User.create(user);

};

const addHoax = async (userId)=>{

    return await Hoax.create({
        content: 'Hoax for user',
        timestamp: Date.now(),
        userId: userId
    });

};

const auth = async (options = {})=>{
    
    let token;
    if(options.auth){
        const response = await request(app).post('/api/1.0/auth').send(options.auth);
        token = response.body.token;
    }
    return token;

};
const deleteHoax = async (id = 5, options = {})=>{

    const agent = request(app).delete('/api/1.0/hoaxes/' + id);
    if(options.language){
        agent.set('Accept-Language', options.language);
    }
    if(options.token){
        agent.set('Authorization', `Bearer ${options.token}`);
    }
    return agent.send();

};

describe('Delete Hoax', ()=>{

    it('returns 403 when request is unauthorized', async ()=>{
        const response = await deleteHoax();
        expect(response.status).toBe(403);
    });
    it('returns 403 when token is invalid', async ()=>{
        const response = await deleteHoax(5, { token: 'abcde' });
        expect(response.status).toBe(403);
    });
    it.each`
            language | message
            ${'tr'}  | ${tr.unauthorized_hoax_delete}
            ${'en'}  | ${en.unauthorized_hoax_delete}
        `('returns error body with $message for unauthorized request when language is $language',
        async ({ language, message })=>{
    
        const nowInMillis = Date.now();
        const response = await deleteHoax(5, {language});
        expect(response.body.path).toBe('/api/1.0/hoaxes/5');
        expect(response.body.timestamp).toBeGreaterThan(nowInMillis);
        expect(response.body.message).toBe(message);
    });
    it('returns 403 when user tries to delete another user\'s hoax', async ()=>{

        const user = await addUser();
        const hoax = await addHoax(user.id);
        const user2 = await addUser({ 
            ...activeUser,
            username: 'user2',
            email: 'user2@mail.com' 
        });
        const token = await auth({ auth: { email: user2.email, password: 'User2password' } });
        const response = await deleteHoax(hoax.id, {token});
        expect(response.status).toBe(403);

    });

});
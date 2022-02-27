const request = require('supertest');
const app = require('../src/app');
const en = require('../locales/en/translation.json');
const tr = require('../locales/tr/translation.json');
const User = require('../src/user/User');
const Hoax = require('../src/hoax/Hoax');
const sequelize = require('../src/config/database');
const bcrypt = require('bcrypt');

beforeAll(async ()=>{
    if(process.env.NODE_ENV === 'test'){
        await sequelize.sync();
    }
});
beforeEach(async ()=>{
    await Hoax.destroy({ truncate: true });
    await User.destroy({ truncate: { cascade: true } });
});

const activeUser = { 
    username: 'user1',
    email: 'user1@mail.com',
    password: 'User1password',
    inactive: false
};
const credentials = { email: 'user1@mail.com', password: 'User1password' };
const addUser = async (user = {...activeUser})=>{

    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    return await User.create(user);

};
const postHoax = async (body = null, options = {})=>{

    let agent = request(app);
    let token;
    if(options.auth){
        const response = await agent.post('/api/1.0/auth').send(options.auth);
        token = response.body.token;
    }
    agent = request(app).post('/api/1.0/hoaxes');
    if(options.language){
        agent.set('Accept-Language', options.language);
    }
    if(token){
        agent.set('Authorization', `Bearer ${token}`);
    }
    if(options.token){
        agent.set('Authorization', `Bearer ${options.token}`);
    }
    return agent.send(body);

};
describe('Post Hoax', ()=>{

    it('returns 401 when hoax post request has no authentication', async ()=>{
        const response = await postHoax();
        expect(response.status).toBe(401);
    });
    it.each`
            language | message
            ${'tr'}  | ${tr.unauthorized_hoax_submit}
            ${'en'}  | ${en.unauthorized_hoax_submit}
        `('returns error body with $message when unauthorized', async ({language, message})=>{

        const nowInMillis = Date.now();
        const response = await postHoax(null, {language});
        const error = response.body;
        expect(error.path).toBe('/api/1.0/hoaxes');
        expect(error.message).toBe(message);
        expect(error.timestamp).toBeGreaterThan(nowInMillis);

    });
    it('returns 200 when valid hoax submitted with authorized user', async ()=>{

        await addUser();
        const response = await postHoax( 
            { content: 'Hoax content' },
            {auth: credentials} 
        );
        expect(response.status).toBe(200);

    });
    it('saves the hoax to database when authorized user sends valid request', async ()=>{

        await addUser();
        await postHoax( { content: 'Hoax content' }, {auth: credentials} );
        const hoaxes = await Hoax.findAll();
        expect(hoaxes.length).toBe(1);

    });
    it('saves the hoax content and timestamp to database', async ()=>{

        await addUser();
        const beforeSubmit = Date.now();
        await postHoax( { content: 'Hoax content' }, {auth: credentials} );
        const hoaxes = await Hoax.findAll();
        const savedHoax = hoaxes[0];
        expect(savedHoax.content).toBe('Hoax content');
        expect(savedHoax.timestamp).toBeGreaterThan(beforeSubmit);
        expect(savedHoax.timestamp).toBeLessThan(Date.now());

    });
    it.each`
            language | message
            ${'tr'}  | ${tr.hoax_submit_success}
            ${'en'}  | ${en.hoax_submit_success}
        `('returns $message to success submit when language is $language', 
        async ({language, message})=>{

        await addUser();
        const response = await postHoax({ content: 'Hoax content' }, { auth: credentials, language });
        expect(response.body.message).toBe(message);

    });
    it.each`
            language | message
            ${'tr'}  | ${tr.validation_failure}
            ${'en'}  | ${en.validation_failure}
        `('returns 400 and $message when hoax content is less than 10 characters and language is $language', 
        async ({language, message})=>{

        await addUser();
        const response = await postHoax({ content: '123456789' }, { auth: credentials, language });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(message);

    });
    it('returns validation error body when an invalid hoax post by authorized user', async ()=>{

        await addUser();
        const nowInMillis = Date.now();
        const response = await postHoax({ content: '123456789' }, { auth: credentials });
        const error = response.body;
        expect(error.timestamp).toBeGreaterThan(nowInMillis);
        expect(error.path).toBe('/api/1.0/hoaxes');
        expect(Object.keys(error))
            .toEqual(['path', 'timestamp', 'message', 'validationErrors'])
        ;

    });
    it.each`
            language | content             | contentForDescription | message
            ${'tr'}  | ${null}             | ${'null'}             | ${tr.hoax_content_size}
            ${'tr'}  | ${'a'.repeat(9)}    | ${'short'}            | ${tr.hoax_content_size}
            ${'tr'}  | ${'a'.repeat(5001)} | ${'very long'}        | ${tr.hoax_content_size}
            ${'en'}  | ${null}             | ${'null'}             | ${en.hoax_content_size}
            ${'en'}  | ${'a'.repeat(9)}    | ${'short'}            | ${en.hoax_content_size}
            ${'en'}  | ${'a'.repeat(5001)} | ${'very long'}        | ${en.hoax_content_size}
        `('returns $message when the content is $contentForDescription and the language is $language', 
        async ({ language, content, message })=>{

        await addUser();
        const response = await postHoax(
            { content: content }, 
            { auth: credentials, language }
        );
        expect(response.body.validationErrors.content).toBe(message);

    });

});
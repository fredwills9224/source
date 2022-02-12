const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');
// const bcrypt = require('bcrypt');
const en = require('../locales/en/translation.json');
const tr = require('../locales/tr/translation.json');

beforeAll(async ()=>{
    await sequelize.sync();
});
beforeEach(async ()=>{
    await User.destroy({ truncate: true });
});

const pustUser = (id = 5, body = null, options = {})=>{

    const agent = request(app).put('/api/1.0/users/' + id);
    if(options.language){
        agent.set('Accept-Language', options.language);
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
            const response = await pustUser(5, null, {language});
            expect(response.body.path).toBe('/api/1.0/users/5');
            expect(response.body.timestamp).toBeGreaterThan(nowInMillis);
            expect(response.body.message).toBe(message);

        });

    // in[validUser]

});
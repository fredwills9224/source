const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');
// const bcrypt = require('bcrypt');
// const en = require('../locales/en/translation.json');
// const tr = require('../locales/tr/translation.json');

beforeAll(async ()=>{
    await sequelize.sync();
});
beforeEach(async ()=>{
    await User.destroy({ truncate: true });
});

describe('User Update', ()=>{

    // in[validUser]

        it('returns forbidden when request sent without basic authorization', async ()=>{

            const response = await request(app).put('/api/1.0/users/5').send();
            expect(response.status).toBe(403);

        });

    // in[validUser]

});
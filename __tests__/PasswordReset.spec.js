const request = require('supertest');
const app = require('../src/app');
const en = require('../locales/en/translation.json');
const tr = require('../locales/tr/translation.json');

describe('Password Reset Request', ()=>{

    it('returns 404 when a password reset request is sent for unkown e-mail', async ()=>{

        const response = await request(app)
            .post('/api/1.0/password-reset')
            .send({email: 'user1@mail.com'})
        ;
        expect(response.status).toBe(404);
        
    });
    it.each`
        language | message
        ${'tr'}  | ${tr.email_not_inuse}
        ${'en'}  | ${en.email_not_inuse}
        `('returns error body with $message for unknown email for password reset request when language is $language',
        async ({ language, message })=>{ 

        const nowInMillis = new Date().getTime();
        const response = await request(app)
            .post('/api/1.0/password-reset')
            .set('Accept-Language', language)
            .send({email: 'user1@mail.com'})
        ;
        expect(response.body.path).toBe('/api/1.0/password-reset');
        expect(response.body.timestamp).toBeGreaterThan(nowInMillis);
        expect(response.body.message).toBe(message);

    });


});
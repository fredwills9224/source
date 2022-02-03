const request = require('supertest');
const app = require('../app');

it('returns 200 OK when signup request is valid', (done)=>{
    
    request(app).post('/api/1.0/users').send({
            username: 'user1',
            email: 'user1@mail.com',
            password: 'user1password'
        }).expect(200, done)
    ;

});
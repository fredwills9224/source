const request = require('supertest');
const app = require('../src/app');

describe('Listing Users', ()=>{

    it('returns 200 ok when there are no user in database', async()=>{
        const response = await request(app).get('/api/1.0/users');
        expect(response.status).toBe(200);    
    });

});
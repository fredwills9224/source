const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll( async ()=>{
    await sequelize.sync();
});
beforeEach(()=>{
    return User.destroy({ truncate: true });
});

const getUsers = ()=>{
    return request(app).get('/api/1.0/users');
};
const addUsers = async (count)=>{

    for(let i=0; i<count; i++){
        await User.create({
            username: `users${i +1}`,
            email: `users${i +1}@mail.com`
        });
    }

};
describe('Listing Users', ()=>{

    it('returns 200 ok when there are no user in database', async()=>{
        const response = await getUsers();
        expect(response.status).toBe(200);    
    });
    it('returns page object as response body', async()=>{

        const response = await getUsers();
        expect(response.body).toEqual({
            content:[],
            page: 0,
            size: 10,
            totalPages:0
        });

    });
    it('returns 10 users in page content when there are 11 users in database', async ()=>{
   
        await addUsers(11);
        const response = await getUsers();
        expect(response.body.content.length).toBe(10);

    });

});
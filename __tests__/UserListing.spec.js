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
const addUsers = async (activeUserCount, inactiveUserCount=0)=>{

    for(let i=0; i<activeUserCount+inactiveUserCount; i++){
        await User.create({
            username: `user${i +1}`,
            email: `users${i +1}@mail.com`,
            inactive: i>= activeUserCount
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
    it('returns 6 users in page content when there are active 6 users and inactive 5 users in database',
        async ()=>{

        await addUsers(6, 5);
        const response = await getUsers();
        console.log(response.body.content[0]);
        expect(response.body.content.length).toBe(6);

    });
    it('returns only id, username and email in content array for each user', async ()=>{

        await addUsers(11);
        const response = await getUsers();
        const user = response.body.content[0];
        expect(Object.keys(user)).toEqual(['id', 'username', 'email']);
        
    });
    it('returns 2 as totalPages when there are 15 active and 7 inactive users', async ()=>{

        // limit 10 users per page
            await addUsers(15, 7);
            const response = await getUsers();
            expect(response.body.totalPages).toBe(2);
        // limit 10 users per page

    });
    it('returns second page users and page indicator when page is set as 1 in request parameter', 
        async ()=>{
       
        await addUsers(11);
        const response = await getUsers().query({page: 1});
        expect(response.body.content[0].username).toBe('user11');
        expect(response.body.page).toBe(1);

    });
    it('returns first page when page is set below zero as request parameter', async ()=>{

        await addUsers(11);
        const response = await getUsers().query({ page: -5 });
        expect(response.body.page).toBe(0);

    });
    it('returns 5 users and corresponding size indicator when size is set as 5 in request parameter',
        async ()=>{

        await addUsers(11);
        const response = await getUsers().query({ size: 5 });
        expect(response.body.content.length).toBe(5);
        expect(response.body.size).toBe(5);
            
    });
    it('returns 10 users and corresponding size indicator when size is set as 1000', async ()=>{

        await addUsers(11);
        const response = await getUsers().query({ size: 1000 });
        expect(response.body.content.length).toBe(10);
        expect(response.body.size).toBe(10);

    });
    it('returns 10 users and corresponding size indicator when size is set as 0', async ()=>{

        await addUsers(11);
        const response = await getUsers().query({ size: 0 });
        expect(response.body.content.length).toBe(10);
        expect(response.body.size).toBe(10);

    });
    it('returns page as zero and size as 10 when non numeric query params provided for both', 
        async ()=>{

        await addUsers(11);
        const response = await getUsers().query({ size: 'size', page: 'page' });
        expect(response.body.size).toBe(10);
        expect(response.body.page).toBe(0);

    });

});

describe('Get User', ()=>{

    const getUser = (id = 5)=>{
        return request(app).get('/api/1.0/users/' + id);
    };
    // test automatically passes because express sends 404 response as a default
        it('returns 404 when user not found', async ()=>{

            const response = await getUser();
            expect(response.status).toBe(404);

        });
    // test automatically passes because express sends 404 response as a default
    it.each`
        language | message
        ${'tr'}  | ${'Kullanici bulunamadi'}
        ${'en'}  | ${'User not found'}
        `('returns $message for unknown user when language is set to $language', 
        async ({language, message})=> {

        const response = await getUser().set('Accept-Language', language);
        expect(response.body.message).toBe(message);

    });
    it('returns proper error body when user not found', async ()=>{

        const nowInMillis = new Date().getTime();
        const response = await getUser();
        const error = response.body;
        expect(error.path).toBe('/api/1.0/users/5');
        expect(error.timestamp).toBeGreaterThan(nowInMillis);
        expect(Object.keys(error)).toEqual(['path', 'timestamp', 'message']);

    });
    it('returns 200 when an active user exist', async()=>{

        const user = await User.create({
            username: 'user1', email: 'user1@mail.com', inactive: false
        });
        const response = await getUser(user.id);
        expect(response.status).toBe(200);

    });
    it('returns id, username and email in response body when an active user exist', async ()=>{

        const user = await User.create({
            username: 'user1',
            email: 'user1@mail.com',
            inactive: false
        });
        const response = await getUser(user.id);
        expect(Object.keys(response.body)).toEqual(['id', 'username', 'email']);

    });
    it('returns 404 when the user is inactive', async ()=>{

        const user = await User.create({
            username: 'user1',
            email: 'user1@mail.com',
            inactive: true
        });
        const response = await getUser(user.id);
        expect(response.status).toBe(404);

    });

});
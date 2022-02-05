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

describe('User Registration', ()=>{

    it('returns 200 OK when signup request is valid', (done)=>{
    
        request(app).post('/api/1.0/users').send({
            
            username: 'user1',
            email: 'user1@mail.com',
            password: 'user1password'
            }).then((response)=>{
                expect(response.status).toBe(200);
                done();
            })
    
        ;
    
    }); 
    it('returns success message when signup request is valid', (done)=>{
        
        request(app).post('/api/1.0/users').send({
            
            username: 'user1',
            email: 'user1@mail.com',
            password: 'user1password'
            }).then((response)=>{
                expect(response.body.message).toBe('User created');
                done();
            })
    
        ;
    
    });
    it('saves the user to database', (done)=>{
        
        request(app).post('/api/1.0/users').send({
            
            username: 'user1',
            email: 'user1@mail.com',
            password: 'user1password'
            }).then(()=>{
                User.findAll().then((userList)=>{
                    expect(userList.length).toBe(1);
                    done();
                });
            })
    
        ;
    
    });

});
const sequelize = require('../src/config/database');
const Token = require('../src/auth/Token');
const TokenService = require('../src/auth/TokenService');

beforeAll(async ()=>{
    await sequelize.sync();
});
beforeEach(async ()=>{
    // only dealing with [Token] table w/o foriegn keys so [{truncate: true}] Ok
        await Token.destroy({ truncate: true });
    // only dealing with [Token] table w/o foriegn keys so [{truncate: true}] Ok
});

describe('Scheduled Token Cleanup', ()=>{

    it('clears the expired token with scheduled task', async()=>{

        const token = 'test-token';
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
        await Token.create({
            token: token,
            lastUsedAt: eightDaysAgo
        });
        TokenService.scheduleCleanup();
        const tokenInDB = await Token.findOne({ where: { token: token } });
        expect(tokenInDB).toBeNull();

    });

});










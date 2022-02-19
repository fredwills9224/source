'use strict';

const bcrypt = require('bcrypt');
module.exports = {
  
  // eslint-disable-next-line no-unused-vars
  async up (queryInterface, Sequelize) {
    
    const hashedPassword = await bcrypt.hash('User1password', 10);
    const users = [];
    for(let i=0; i < 25; i++){
      
      users.push({
        username: `user${i +1}`,
        email: `user${i +1}@mail.com`,
        inactive: false,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
  
    }
    await queryInterface.bulkInsert('users', users, {});

  },
  // eslint-disable-next-line no-unused-vars
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }

};

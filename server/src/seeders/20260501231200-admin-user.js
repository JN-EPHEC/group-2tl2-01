'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'thomascharlier40404@gmail.com' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      console.log('Admin déjà existant, seed ignoré.');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      email: 'thomascharlier40404@gmail.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Thomas',
      lastName: 'Charlier',
      isActive: true,
      familyId: null,
      forcePasswordChange: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);

    console.log('✅ Utilisateur admin créé: thomascharlier40404@gmail.com / admin123');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'thomascharlier40404@gmail.com' });
  },
};
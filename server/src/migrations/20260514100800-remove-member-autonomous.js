'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('members', 'isAutonomous');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('members', 'isAutonomous', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};
'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class DepositSchema extends Schema {
  up() {
    this.create('deposits', (table) => {
      table.increments();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table.float('amount').unsigned();
      table.string('reference', 255);
      table.timestamps();
    });
  }

  down() {
    this.drop('deposits');
  }
}

module.exports = DepositSchema;

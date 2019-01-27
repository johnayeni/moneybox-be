'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class WithdrawalSchema extends Schema {
  up() {
    this.create('withdrawals', (table) => {
      table.increments();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table.string('transfer_code', 256).notNullable();
      table.string('recipient_code', 256).notNullable();
      table.float('amount').unsigned();
      table.timestamps();
    });
  }

  down() {
    this.drop('withdrawals');
  }
}

module.exports = WithdrawalSchema;

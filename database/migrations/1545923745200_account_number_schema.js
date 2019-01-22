'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AccountNumberSchema extends Schema {
  up() {
    this.create('account_numbers', (table) => {
      table.increments();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table.string('account_no', 20).notNullable();
      table.string('account_name', 80).notNullable();
      table.string('bank', 80).notNullable();
      table.string('bank_code', 10).notNullable();
      table.timestamps();
    });
  }

  down() {
    this.drop('account_numbers');
  }
}

module.exports = AccountNumberSchema;

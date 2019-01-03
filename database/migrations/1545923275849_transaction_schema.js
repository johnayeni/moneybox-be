'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TransactionSchema extends Schema {
  up() {
    this.create('transactions', (table) => {
      table.increments();
      table.integer('user_id').notNullable();
      table.float('amount').notNullable();
      table.string('type', 30).notNullable();
      table.string('method', 30).notNullable();
      table.string('reference', 255);
      table.timestamps();
    });
  }

  down() {
    this.drop('transactions');
  }
}

module.exports = TransactionSchema;

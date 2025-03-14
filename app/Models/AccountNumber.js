'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class AccountNumber extends Model {
  /**
   * A relationship on users
   * @method user
   *
   * @return {Object}
   */
  user() {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = AccountNumber;

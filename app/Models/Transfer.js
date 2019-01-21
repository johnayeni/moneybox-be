'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Transfer extends Model {
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

module.exports = Transfer;

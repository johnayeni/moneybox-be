'use strict';

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class User extends Model {
  static boot() {
    super.boot();

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    });
  }

  /**
   * These fields are hidden, so  are therefore not returned
   * when an object of user is fetched from the database
   */
  static get hidden() {
    return ['password'];
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens() {
    return this.hasMany('App/Models/Token');
  }
  accounts() {
    return this.hasOne('App/Models/AccountNumber');
  }
  wallets() {
    return this.hasOne('App/Models/Wallet');
  }
  transactions() {
    return this.hasMany('App/Models/Transactions');
  }
}

module.exports = User;

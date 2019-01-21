'use strict';

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

const Transfer = use('App/Models/Transfer');

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
  /**
   * A relationship on account number tied to a user
   *
   * @method account
   *
   * @return {Object}
   */

  account() {
    return this.hasOne('App/Models/AccountNumber');
  }
  /**
   * A relationship on deposits tied to a user
   * @method deposits
   *
   * @return {Array}
   */

  deposits() {
    return this.hasMany('App/Models/Deposit');
  }
  /**
   * A relationship on transfers made to other users
   * @method moneySent
   *
   * @return {Array}
   */

  moneySent() {
    return this.hasMany('App/Models/Transfer');
  }
  /**
   * A relationship on transfers received to other users
   * @method moneyReceived
   *
   * @return {Array}
   */

  async moneyReceived() {
    const { id } = this.toJSON();
    return await Transfer.query()
      .where('receiver_id', '=', id)
      .fetch();
  }
  /**
   * A relationship on withdrawals tied to a user
   * @method withdrawals
   *
   * @return {Array}
   */

  withdrawals() {
    return this.hasMany('App/Models/Withdrawal');
  }
  /**
   * Get a users balance by calculating all transactions
   * @method balance
   *
   * @return {Number}
   */

  async balance() {
    let balance = 0.0;

    const deposits = await this.deposits().fetch();
    const moneySent = await this.moneySent().fetch();
    const moneyReceived = await this.moneyReceived();
    const withdrawals = await this.withdrawals().fetch();

    for (let deposit of deposits.toJSON()) {
      balance = balance + deposit.amount;
    }

    for (let transfer of moneyReceived.toJSON()) {
      balance = balance + transfer.amount;
    }

    for (let withdrawal of withdrawals.toJSON()) {
      balance = balance - withdrawal.amount;
    }

    for (let transfer of moneySent.toJSON()) {
      balance = balance - transfer.amount;
    }

    return balance;
  }
}

module.exports = User;

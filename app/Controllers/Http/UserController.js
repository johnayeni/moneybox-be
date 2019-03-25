'use strict';

const Env = use('Env');
const { validateAll } = use('Validator');
const AccountNumber = use('App/Models/AccountNumber');

const sk = Env.get('PAYSTACK_SECRET_KEY');

const Paystack = require('paystack-api')(sk);

class UserController {
  // get details of authenticated user
  async read({ auth, response }) {
    const user = await auth.getUser();
    const balance = await user.balance();
    const bankAccount = await user.account().fetch();
    return response
      .status(200)
      .json({ message: 'User details gotten', user: { ...user.toJSON(), balance, bankAccount } });
  }

  // add a user's account number
  async addAccountNumber({ auth, request, response }) {
    const data = request.only(['account_no', 'bank_code']);

    const validation = await validateAll(data, {
      account_no: 'required',
      bank_code: 'required',
    });

    if (validation.fails()) {
      return response.status(400).json({ messages: validation.messages() });
    }

    const accountVerify = await Paystack.verification.resolveAccount({
      account_number: data.account_no,
      bank_code: data.bank_code,
    });

    const {
      data: { account_name },
    } = accountVerify;

    const user = await auth.getUser();

    if (await user.account().fetch()) {
      return response.status(400).json({ message: 'Cannot add more than one account number' });
    }

    const newAccountNumber = await AccountNumber.create({
      ...data,
      account_name,
      user_id: user.id,
    });

    return response
      .status(200)
      .json({ message: 'You have successfull added your account number', newAccountNumber });
  }

  // update a user's account number
  async updateAccountNumber({ auth, request, response }) {
    const data = request.only(['account_no', 'bank', 'bank_code']);

    const validation = await validateAll(data, {
      account_no: 'required',
      bank: 'required',
      bank_code: 'required',
    });

    if (validation.fails()) {
      return response.status(400).json({ messages: validation.messages() });
    }

    const accountVerify = await Paystack.verification.resolveAccount({
      account_number: data.account_no,
      bank_code: data.bank_code,
    });

    const {
      data: { account_name },
    } = accountVerify;

    const user = await auth.getUser();

    const accountNumber = await user.account().fetch();

    await accountNumber.merge({
      ...data,
      account_name,
    });

    accountNumber.save();

    return response
      .status(200)
      .json({ message: 'You have successfull updated your account number', accountNumber });
  }
}

module.exports = UserController;

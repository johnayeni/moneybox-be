'use strict';

const { validateAll } = use('Validator');
const AccountNumber = use('App/Models/AccountNumber');
// const Paystack = use('App/')

class UserController {
  // get details of authenticated user
  async get({ auth, response }) {
    const user = await auth.getUser();
    const balance = await user.balance();
    const bankAccount = await user.account().fetch();
    return response
      .status(200)
      .json({ message: 'User details gotten', user: { ...user.toJSON(), balance, bankAccount } });
  }

  // add a user's account number
  async addAccountNumber({ auth, request, response }) {
    const data = request.only(['account_no', 'account_name', 'bank']);

    const validation = await validateAll(data, {
      account_no: 'required',
      account_name: 'required',
      bank: 'required',
    });

    if (validation.fails()) {
      return response.status(400).json({ messages: validation.messages() });
    }

    const user = await auth.getUser();

    if (!user) {
      return response.status(400).json({ message: 'Could not add account number' });
    }

    if (await user.account().fetch()) {
      return response.status(400).json({ message: 'Cannot add more than one account number' });
    }

    const newAccountNumber = await AccountNumber.create({ ...data, user_id: user.id });

    if (!newAccountNumber) {
      return response.status(400).json({ message: 'Could not add account number' });
    }

    return response
      .status(200)
      .json({ message: 'You have successfull added your account number', newAccountNumber });
  }

  // update a user's account number
  async updateAccountNumber({ auth, request, response }) {
    const data = request.only(['account_no', 'account_name', 'bank']);

    const user = await auth.getUser();

    if (!user) {
      return response.status(400).json({ message: 'Could not add account number' });
    }

    const accountNumber = await user.account().fetch();

    await accountNumber.merge({ ...data });

    accountNumber.save();

    return response
      .status(200)
      .json({ message: 'You have successfull updated your account number', accountNumber });
  }
}

module.exports = UserController;

'use strict';

const { validateAll } = use('Validator');
const User = use('App/Models/User');
const Deposit = use('App/Models/Deposit');
const Transfer = use('App/Models/Transfer');
const Withdrawal = use('App/Models/Withdrawal');

class TransactionController {
  // get a user's transaction records
  async get({ auth, response }) {
    const user = await auth.getUser();

    if (!user) {
      return response.status(400).json({ message: 'Could not retrieve transactions' });
    }

    const deposits = await user.deposits().fetch();
    const moneySent = await user.moneySent().fetch();
    const withdrawals = await user.withdrawals().fetch();
    const moneyReceived = await user.moneyReceived();

    return response.status(200).json({
      message: 'Transactions retrieved',
      transactions: { deposits, withdrawals, moneySent, moneyReceived },
    });
  }

  // deposit money to user's account
  async deposit({}) {}
  // withdraw money from user's account
  async withdraw({}) {}
  // transfer money from user's account to another user on the platform
  async transfer({ auth, request, response }) {
    const data = request.only(['receiver_id', 'amount']);

    const validation = await validateAll(data, {
      receiver_id: 'required',
      amount: 'required',
    });

    if (validation.fails()) {
      return response.status(400).json({ messages: validation.messages() });
    }

    const user = await auth.getUser();

    if (!user) {
      return response.status(400).json({ message: 'Transfer failed' });
    }

    const userBalance = await user.balance();
    if (data.amount > userBalance) {
      return response.status(400).json({ message: 'Insufficient funds' });
    }

    const receiver = await User.find(data.receiver_id);

    if (!receiver) {
      return response.status(400).json({ message: 'Transfer failed, receiver invalid' });
    }

    if (user.id == receiver.id) {
      return response.status(400).json({ message: 'Cannot transfer to self' });
    }

    const newTransfer = await Transfer.create({ ...data, user_id: user.id });

    if (!newTransfer) {
      return response.status(400).json({ message: 'Transfer failed' });
    }

    return response.status(200).json({
      message: 'Transaction successful',
      newTransfer,
    });
  }
}

module.exports = TransactionController;

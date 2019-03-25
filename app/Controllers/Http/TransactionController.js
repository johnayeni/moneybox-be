'use strict';

const Env = use('Env');
const { validateAll } = use('Validator');
const User = use('App/Models/User');
const Deposit = use('App/Models/Deposit');
const Transfer = use('App/Models/Transfer');
const Withdrawal = use('App/Models/Withdrawal');

const sk = Env.get('PAYSTACK_SECRET_KEY');

const Paystack = require('paystack-api')(sk);

class TransactionController {
  // get a user's transaction records
  async get({ auth, response }) {
    const user = await auth.getUser();
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
  async deposit({ auth, request, response }) {
    const { reference } = request.all();

    const validation = await validateAll(
      { reference },
      {
        reference: 'required',
      },
    );

    if (validation.fails()) {
      return response.status(400).json({ messages: validation.messages() });
    }

    const user = await auth.getUser();

    const paymentVerification = await Paystack.transaction.verify({ reference });

    if (paymentVerification) {
      const {
        data: { status, amount, gateway_response },
      } = paymentVerification;
      if (status == 'success') {
        const newDeposit = await Deposit.create({
          reference,
          user_id: user.id,
          // divide amount by 100 becuase paytack retruns in kobo
          amount: Number(amount) / 100,
        });

        return response.status(200).json({
          message: gateway_response,
          newDeposit,
        });
      } else {
        return response.status(400).json({ message: gateway_response });
      }
    }

    return response.status(400).json({ message: 'Deposit failed' });
  }
  // withdraw money from user's account
  async withdraw({ auth, request, response }) {
    const data = request.only(['amount', 'password']);

    const user = await auth.getUser();

    const verifyPassword = await auth.attempt(user.email, data.password);

    if (!verifyPassword) {
      return response.status(401).json({ message: 'Transfer failed, unauthorized use' });
    }

    const userBalance = await user.balance();
    if (Number(data.amount) > Number(userBalance)) {
      return response.status(400).json({ message: 'Insufficient funds' });
    }

    const bankDetails = await user.account();

    const transferReceipt = await Paystack.transfer_recipient.create({
      type: 'nuban',
      name: bankDetails.account_name,
      bank_code: bankDetails.bank_code,
      account_number: bankDetails.account_no,
    });

    if (transferReceipt) {
      const {
        data: { recipient_code },
      } = transferReceipt;
      const transfer = await Paystack.transfer.create({
        source: 'balance',
        amount: data.amount,
        recipient: recipient_code,
      });

      if (transfer) {
        if (transfer.status) {
          const {
            data: { transfer_code, amount },
          } = transfer;

          const newWithdrawal = await Withdrawal.create({
            amount,
            transfer_code,
            recipient_code,
            user_id: user.id,
          });

          return response.status(200).json({
            message: 'Withdrawal successful',
            newWithdrawal,
          });
        }
        return response.status(400).json({ message: transfer.message });
      }

      return response.status(400).json({ message: 'Error with payment gateway' });
    }

    return response.status(400).json({ message: 'Error with payment gateway' });
  }
  // transfer money from user's account to another user on the platform
  async transfer({ auth, request, response }) {
    const data = request.only(['receiver_matric_number', 'amount', 'password']);

    const validation = await validateAll(data, {
      receiver_matric_number: 'required',
      amount: 'required',
      password: 'required',
    });

    if (validation.fails()) {
      return response.status(400).json({ messages: validation.messages() });
    }

    const user = await auth.getUser();

    const verifyPassword = await auth.attempt(user.email, data.password);

    if (!verifyPassword) {
      return response.status(401).json({ message: 'Transfer failed, unauthorized use' });
    }

    const userBalance = await user.balance();
    if (Number(data.amount) > Number(userBalance)) {
      return response.status(400).json({ message: 'Insufficient funds' });
    }

    const receiver = await User.query()
      .where('matric_number', data.receiver_matric_number)
      .first();

    if (!receiver) {
      return response.status(400).json({ message: 'Transfer failed, receiver invalid' });
    }

    if (user.id == receiver.id) {
      return response.status(400).json({ message: 'Cannot transfer to self' });
    }

    const newTransfer = await Transfer.create({
      // multiply by 100 because paystack receies amount value  in kobo
      amount: Number(data.amount) * 100,
      user_id: user.id,
      receiver_id: receiver.id,
    });

    return response.status(200).json({
      message: 'Transaction successful',
      newTransfer,
    });
  }
}

module.exports = TransactionController;

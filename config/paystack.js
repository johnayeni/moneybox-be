const Env = use('Env');

const sk = Env.get('PAYSTACK_SECRET_KEY');

const Paystack = require('paystack')(sk);

module.exports = Paystack;

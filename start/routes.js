'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.on('/').render('welcome');

Route.get('deposit', ({ view }) => {
  return view.render('deposit');
});

Route.get('withdraw', ({ view }) => {
  return view.render('withdraw');
});

Route.get('transfer', ({ view }) => {
  return view.render('transfer');
});

Route.get('addaccountnumber', ({ view }) => {
  return view.render('addaccountnumber');
});

Route.group(() => {
  Route.post('register', 'AuthController.register').as('register');
  Route.post('login', 'AuthController.login').as('login');
  Route.get('logout', 'AuthController.logout').as('logout');
}).prefix('auth');

Route.group(() => {
  // user related routes
  Route.get('user', 'UserController.read');
  Route.post('user/accountnumber', 'UserController.addAccountNumber');
  Route.put('user/accountnumber', 'UserController.updateAccountNumber');

  // transanction related routes
  Route.get('transaction', 'TransactionController.get');
  Route.post('transaction/deposit', 'TransactionController.deposit');
  Route.post('transaction/withdraw', 'TransactionController.withdraw');
  Route.post('transaction/transfer', 'TransactionController.transfer');
})
  .prefix('api')
  .middleware('auth');

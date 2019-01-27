'use strict';

const { validateAll } = use('Validator');
const User = use('App/Models/User');

class AuthController {
  // Register a new user
  async register({ request, response }) {
    const data = request.only(['firstname', 'lastname', 'matric_number', 'email', 'password']);

    const validation = await validateAll(data, {
      firstname: 'required',
      lastname: 'required',
      matric_number: 'required|unique:users, matric_number',
      email: 'required|email|unique:users, email',
      password: 'required',
    });

    if (validation.fails()) {
      return response.status(400).json({ messages: validation.messages() });
    }

    const user = await User.create({ ...data });

    return response.status(200).json({ message: 'You have successfull created an account', user });
  }

  // Login a user
  async login({ request, auth, response }) {
    const { email, password } = request.all();
    const { token } = await auth.attempt(email, password);
    return response.status(200).json({ message: 'Logged in successfully', token });
  }
}

module.exports = AuthController;

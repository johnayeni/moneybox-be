'use strict';

const { validate } = use('Validator');
const User = use('App/Models/User');

class AuthController {
  // Register a new user
  async register({ request, response }) {
    const validation = await validate(request.all(), {
      firstname: 'required',
      lastname: 'required',
      matric_number: 'required|unique:users, matric_number',
      email: 'required|email|unique:users, email',
      password: 'required',
    });

    if (validation.fails()) {
      return response.status(400).json({ messages: validation.messages() });
    }

    const user = await User.create(request.all());

    if (!user) {
      return response.status(400).json({ message: 'Could not create user' });
    }

    return response.status(200).json({ message: 'You have successfull created an account' });
  }

  // Login a user
  async login({ request, auth, response }) {
    const { email, password } = request.all();
    const { token } = await auth.attempt(email, password);
    return response.status(200).json({ message: 'Logged in successfully', token });
  }
}

module.exports = AuthController;

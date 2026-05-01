import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { signToken } from '../utils/tokens.js';

async function getSignupRole(email) {
  if (!env.INITIAL_ADMIN_EMAIL || email !== env.INITIAL_ADMIN_EMAIL.toLowerCase()) {
    return 'Member';
  }

  const adminExists = await User.exists({ role: 'Admin' });
  return adminExists ? 'Member' : 'Admin';
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.validated.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new HttpError(409, 'Email is already registered');
    }

    const role = await getSignupRole(email);
    const user = await User.create({ name, email, password, role });
    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = signToken(user);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({ user: req.user });
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

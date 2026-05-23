import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { pool } from '../../config/db.js';
import { sendResponse } from '../../utils/response.js';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    // Check if user exists
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
     return res.status(StatusCodes.CONFLICT).json({
  success: false,
  message: 'User already exists with this email',
});
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
   const allowedRoles = ['contributor', 'maintainer'];

if (role && !allowedRoles.includes(role)) {
  return res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: 'Invalid role',
  });
}

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at',
      [name, email, hashedPassword, role]
    );

    sendResponse(res, StatusCodes.CREATED, true, 'User registered successfully', result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Sign Token with id, name, role
    const tokenPayload = { 
      id: Number(user.id), 
      name: String(user.name), 
      role: user.role as 'contributor' | 'maintainer' 
    };

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(
      tokenPayload, 
      jwtSecret, 
      {
        expiresIn: jwtExpiresIn as any
      }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    sendResponse(res, StatusCodes.OK, true, 'Login successful', { token, user: userData });
  } catch (error) {
    next(error);
  }
};
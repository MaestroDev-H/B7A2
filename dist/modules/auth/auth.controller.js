import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { pool } from '../../config/db.js';
import { sendResponse } from '../../utils/response.js';
const VALID_ROLES = ['contributor', 'maintainer'];
export const signup = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Name, email and password are required',
            });
        }
        if (role && !VALID_ROLES.includes(role)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Role must be contributor or maintainer',
            });
        }
        const userExist = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: 'User already exists with this email',
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'contributor';
        const result = await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at', [name, email, hashedPassword, userRole]);
        sendResponse(res, StatusCodes.CREATED, true, 'User registered successfully', result.rows[0]);
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
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
        const tokenPayload = {
            id: Number(user.id),
            name: String(user.name),
            role: user.role,
        };
        const jwtSecret = process.env.JWT_SECRET ?? 'fallback_secret_key';
        const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1d');
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: jwtExpiresIn });
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
        sendResponse(res, StatusCodes.OK, true, 'Login successful', { token, user: userData });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=auth.controller.js.map
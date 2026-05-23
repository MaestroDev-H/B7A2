import { StatusCodes } from 'http-status-codes';
export const globalErrorHandler = (err, req, res, next) => {
    console.error('Error Logged:', err.message || err);
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Something went wrong';
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || null,
    });
};
//# sourceMappingURL=error.middleware.js.map
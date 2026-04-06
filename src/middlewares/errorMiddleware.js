const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode;
    let message = err.message;

    if (!statusCode) {
        if (err.name === 'ValidationError') {
            statusCode = 400;
        } else if (err.name === 'CastError') {
            statusCode = 400;
            message = message || 'Invalid ID or value';
        } else if (err.code === 11000) {
            statusCode = 400;
            message = 'Duplicate field value (e.g., email already exists)';
        } else {
            statusCode =
                res.statusCode >= 400 && res.statusCode < 600
                    ? res.statusCode
                    : 500;
        }
    }

    if (statusCode === 200) {
        statusCode = 500;
    }

    res.status(statusCode).json({
        message: message || 'Internal server error',
        ...(process.env.NODE_ENV === 'production'
            ? {}
            : { stack: err.stack }),
    });
};

module.exports = { errorHandler };
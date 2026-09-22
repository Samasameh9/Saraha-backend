export const globalErrorHandling = (error, req, res, next) => {
    const status = error.cause?.status ?? 500;

    return res.status(status).json({
        error_message: error.message || "Something went wrong Server error",
        error: {},
        cause: {
            status,
            ...(error.cause?.extra && {
                issues: error.cause.extra
            })
        }
    });
};
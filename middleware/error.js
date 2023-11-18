const ErrorResponse = require("../utilities/errorResponse");

module.exports.notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not Found - ${req.originalUrl}`, 404);

  next(error);
};

module.exports.errorHandler = (err, req, res, next) => {
  let statusCode = err?.statusCode ?? 500;
  let message = err?.message ?? "Somthing went wrong";
  let extrafield = err?.extrafield ?? null;

  res.status(statusCode).json({
    status: "failed",
    message,
    extrafield,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

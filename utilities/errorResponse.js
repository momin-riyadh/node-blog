class ErrorResponse extends Error {
  constructor(message, statusCode, extrafield = null) {
    super(message);
    this.statusCode = statusCode;
    this.extrafield = extrafield;
  }
}

module.exports = ErrorResponse;

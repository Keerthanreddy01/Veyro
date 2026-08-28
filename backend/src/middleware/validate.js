const { validationResult } = require('express-validator');

/**
 * Middleware to evaluate express-validator results.
 * Returns HTTP 400 with structured validation errors if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      error: formattedErrors[0].message,
      message: formattedErrors[0].message,
      errors: formattedErrors,
    });
  }
  next();
};

module.exports = { validate };

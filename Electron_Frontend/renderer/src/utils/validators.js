/**
 * Validation utility module
 * Provides functions and constants for form validation and input sanitization
 */

// Regular expressions for validation
const REGEX = {
  // Only allow letters, numbers, and underscores, 3-20 characters
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  
  // Password must:
  // - Be between 8 and 128 characters
  // - Contain at least one uppercase letter
  // - Contain at least one lowercase letter
  // - Contain at least one number
  // - Contain at least one special character
  // - Not contain spaces
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,128}$/
};

/**
 * Error message constants
 * Standardized error messages for validation failures
 */
const ERROR_MESSAGES = {
  USERNAME: {
    REQUIRED: 'Username is required',
    INVALID: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    INVALID: 'Password must be 8-128 characters and include: uppercase, lowercase, number, and special character',
    MATCH: 'Passwords do not match'
  }
};

/**
 * Validation functions collection
 * Exported as an object containing all validation utilities
 */
export const validators = {
  /**
   * Validates a username against requirements
   * 
   * @param {string} username - The username to validate
   * @returns {string|null} Error message or null if valid
   */
  validateUsername: (username) => {
    if (!username) return ERROR_MESSAGES.USERNAME.REQUIRED;
    if (!REGEX.USERNAME.test(username)) return ERROR_MESSAGES.USERNAME.INVALID;
    return null;
  },

  /**
   * Validates a password against complexity requirements
   * 
   * @param {string} password - The password to validate
   * @returns {string|null} Error message or null if valid
   */
  validatePassword: (password) => {
    if (!password) return ERROR_MESSAGES.PASSWORD.REQUIRED;
    if (!REGEX.PASSWORD.test(password)) return ERROR_MESSAGES.PASSWORD.INVALID;
    return null;
  },

  /**
   * Validates that password and confirmation match
   * 
   * @param {string} password - The password
   * @param {string} confirmPassword - The confirmation password
   * @returns {string|null} Error message or null if valid
   */
  validatePasswordMatch: (password, confirmPassword) => {
    if (password !== confirmPassword) return ERROR_MESSAGES.PASSWORD.MATCH;
    return null;
  },

  /**
   * Sanitizes input to prevent XSS attacks
   * Removes potentially dangerous characters and trims whitespace
   * 
   * @param {string} input - The input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .trim(); // Remove leading/trailing whitespace
  },

  /**
   * Validates the entire registration form
   * Combines individual validation functions
   * 
   * @param {Object} formData - The form data to validate
   * @param {string} formData.username - The username
   * @param {string} formData.password - The password
   * @param {string} formData.confirmPassword - The confirmation password
   * @returns {Object} Validation result with isValid flag and errors object
   */
  validateRegistrationForm: (formData) => {
    const errors = {};
    const usernameError = validators.validateUsername(formData.username);
    const passwordError = validators.validatePassword(formData.password);
    const passwordMatchError = validators.validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );

    if (usernameError) errors.username = usernameError;
    if (passwordError) errors.password = passwordError;
    if (passwordMatchError) errors.confirmPassword = passwordMatchError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validates the login form
   * Combines username and password validation
   * 
   * @param {Object} formData - The form data to validate
   * @param {string} formData.username - The username
   * @param {string} formData.password - The password
   * @returns {Object} Validation result with isValid flag and errors object
   */
  validateLoginForm: (formData) => {
    const errors = {};
    const usernameError = validators.validateUsername(formData.username);
    const passwordError = validators.validatePassword(formData.password);

    if (usernameError) errors.username = usernameError;
    if (passwordError) errors.password = passwordError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default validators; 
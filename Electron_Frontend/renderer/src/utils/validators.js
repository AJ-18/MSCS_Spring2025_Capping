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

// Validation error messages
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

// Validation functions
export const validators = {
  // Validate username
  validateUsername: (username) => {
    if (!username) return ERROR_MESSAGES.USERNAME.REQUIRED;
    if (!REGEX.USERNAME.test(username)) return ERROR_MESSAGES.USERNAME.INVALID;
    return null;
  },

  // Validate password
  validatePassword: (password) => {
    if (!password) return ERROR_MESSAGES.PASSWORD.REQUIRED;
    if (!REGEX.PASSWORD.test(password)) return ERROR_MESSAGES.PASSWORD.INVALID;
    return null;
  },

  // Validate password confirmation
  validatePasswordMatch: (password, confirmPassword) => {
    if (password !== confirmPassword) return ERROR_MESSAGES.PASSWORD.MATCH;
    return null;
  },

  // Sanitize input to prevent XSS
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .trim(); // Remove leading/trailing whitespace
  },

  // Validate entire registration form
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

  // Validate login form
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
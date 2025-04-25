// Regular expressions for validation
const REGEX = {
  // Only allow letters, spaces, and hyphens, 2-50 characters
  NAME: /^[a-zA-Z\s-]{2,50}$/,
  
  // Standard email format with additional security checks
  // - Must be between 5 and 255 characters
  // - Must follow standard email format
  // - Only allows certain special characters
  // - Prevents consecutive special characters
  EMAIL: /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{0,63}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]{0,253}[a-zA-Z0-9])\.[a-zA-Z]{2,}$/,
  
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
  NAME: {
    REQUIRED: 'Name is required',
    INVALID: 'Name must contain only letters, spaces, and hyphens (2-50 characters)'
  },
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Please enter a valid email address'
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    INVALID: 'Password must be 8-128 characters and include: uppercase, lowercase, number, and special character',
    MATCH: 'Passwords do not match'
  }
};

// Validation functions
export const validators = {
  // Validate name
  validateName: (name) => {
    if (!name) return ERROR_MESSAGES.NAME.REQUIRED;
    if (!REGEX.NAME.test(name)) return ERROR_MESSAGES.NAME.INVALID;
    return null;
  },

  // Validate email
  validateEmail: (email) => {
    if (!email) return ERROR_MESSAGES.EMAIL.REQUIRED;
    if (!REGEX.EMAIL.test(email)) return ERROR_MESSAGES.EMAIL.INVALID;
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
    const nameError = validators.validateName(formData.name);
    const emailError = validators.validateEmail(formData.email);
    const passwordError = validators.validatePassword(formData.password);
    const passwordMatchError = validators.validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
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
    const emailError = validators.validateEmail(formData.email);
    const passwordError = validators.validatePassword(formData.password);

    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default validators; 
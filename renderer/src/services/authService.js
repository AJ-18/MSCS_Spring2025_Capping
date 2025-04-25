// Mock user database
const mockUsers = new Map();

// Mock authentication service
const authService = {
  // Register a new user
  register: async ({ name, email, password }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    if (mockUsers.has(email)) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString()
    };

    // Store user in mock database
    mockUsers.set(email, user);

    // Generate mock JWT token
    const token = `mock-jwt-${user.id}`;

    // Return the same structure as your future backend
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  },

  // Login user
  login: async ({ email, password }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get user from mock database
    const user = mockUsers.get(email);

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Generate mock JWT token
    const token = `mock-jwt-${user.id}`;

    // Return the same structure as your future backend
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  },

  // Verify token (for protected routes)
  verifyToken: async (token) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if token follows our mock format
    if (!token || !token.startsWith('mock-jwt-')) {
      throw new Error('Invalid token');
    }

    return true;
  }
};

export default authService; 
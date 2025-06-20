const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In production, use environment variables for these
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Simple user database (in production, use a real database)
const users = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Administrator',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'editor-1',
    username: 'editor',
    email: 'editor@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    name: 'Content Editor',
    role: 'editor',
    createdAt: new Date().toISOString()
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Login route
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Validate token route
const validateToken = (req, res) => {
  // If we reach here, the token is valid (authenticateToken middleware passed)
  res.json({
    success: true,
    user: req.user
  });
};

// Refresh token route
const refreshToken = (req, res) => {
  try {
    // Create new token with same user data
    const token = jwt.sign(
      { 
        id: req.user.id, 
        username: req.user.username, 
        email: req.user.email, 
        role: req.user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout route (client-side logout, but can be used for server-side cleanup)
const logout = (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return success
  res.json({ success: true });
};

module.exports = {
  authenticateToken,
  requireRole,
  login,
  validateToken,
  refreshToken,
  logout
}; 
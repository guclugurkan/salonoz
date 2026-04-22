const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * Controller for admin login
 */
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username matches
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials." 
      });
    }

    // Check if password matches the hash
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials." 
      });
    }

    // Create token
    const token = jwt.sign(
      { username: process.env.ADMIN_USERNAME },
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // Token valid for 8 hours
    );

    res.json({
      success: true,
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error during login." 
    });
  }
};

/**
 * Verify token validity
 */
const verify = (req, res) => {
  res.json({ 
    success: true, 
    user: req.user 
  });
};

module.exports = { login, verify };

// =====================================
// Authentication Controller
// =====================================

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// Register User
// ===============================
exports.register = async (req, res) => {
  try {
    const { name, mobile, password, state, district, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: "Mobile number already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      mobile,
      password: hashedPassword,
      state,
      district,
      role
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Login User
// ===============================
exports.login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Update Profile
// ===============================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, state, district } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, state, district },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

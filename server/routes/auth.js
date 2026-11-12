
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    // Validate required fields
    if (
      typeof fullName !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    // Normalize user information
    const normalizedFullName = fullName.trim();
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "El formato del correo electrónico no es válido",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "La contraseña debe tener mínimo 8 caracteres",
      });
    }

    // Check whether the username or email already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [normalizedUsername, normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "El nombre de usuario o el correo electrónico ya existe",
      });
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const [result] = await pool.execute(
      `INSERT INTO users
        (full_name, username, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [
        normalizedFullName,
        normalizedUsername,
        normalizedEmail,
        passwordHash,
      ]
    );

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: result.insertId,
        fullName: normalizedFullName,
        username: normalizedUsername,
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    // Handle duplicate entries detected by database constraints
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "El nombre de usuario o el correo electrónico ya existe",
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor al registrar el usuario",
    });
  }
});

// Log in an existing user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "El nombre de usuario y la contraseña son obligatorios",
      });
    }

    const normalizedUsername = username.trim();

    // Find the user by username
    const [users] = await pool.execute(
      `SELECT id, full_name, username, email, password_hash
       FROM users
       WHERE username = ?`,
      [normalizedUsername]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    const user = users[0];

    // Compare the submitted password with the stored hash
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    // Ensure the JWT secret is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no está configurado");

      return res.status(500).json({
        message: "Error de configuración del servidor",
      });
    }

    // Generate the authentication token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      message: "Error interno del servidor al iniciar sesión",
    });
  }
});

module.exports = router;

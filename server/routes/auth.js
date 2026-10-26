const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../db')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body

    // Validar campos obligatorios
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios'
      })
    }

    // Validar contraseña
    if (password.length < 8) {
      return res.status(400).json({
        message: 'La contraseña debe tener mínimo 8 caracteres'
      })
    }

    // Verificar si username o email ya existen
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'El nombre de usuario o correo ya existe'
      })
    }

    // Generar hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const [result] = await pool.execute(
      `INSERT INTO users
       (full_name, username, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [fullName, username, email, passwordHash]
    )

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        id: result.insertId,
        fullName,
        username,
        email
      }
    })
  } catch (error) {
    console.error('Error al registrar usuario:', error)

    res.status(500).json({
      message: 'Error interno del servidor'
    })
  }
})
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar campos obligatorios
    if (!email || !password) {
      return res.status(400).json({
        message: 'El correo y la contraseña son obligatorios'
      })
    }

    // Buscar usuario por correo
    const [users] = await pool.execute(
      'SELECT id, full_name, username, email, password_hash FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos'
      })
    }

    const user = users[0]

    // Comparar contraseña con el hash almacenado
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos'
      })
    }

    // Crear JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h'
      }
    )

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error al iniciar sesión:', error)

    res.status(500).json({
      message: 'Error interno del servidor'
    })
  }
})
module.exports = router
module.exports = router
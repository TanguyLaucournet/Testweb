import express from 'express'

import { createToken, checkToken } from './utils/token.js'
import { getConnection } from './connect.js'

import { createUser } from './models/user-queries.js'

import dotenv from 'dotenv'

dotenv.config()

console.log(process.env.TOKEN_SECRET)

const app = express()
const port = process.env.PORT || 3000

const stan = {
  id: 1,
  login: 'stan',
  password: 'stan'
}

app.use(express.json())
app.use(express.static('static'))
app.get('/api/v1/version', (req, res) => {
  res.json('1.0.0')
})

app.post('/api/v1/user', (req, res) => {
  const firstname = req.body.firstname
  const lastname = req.body.lastname
  const login = req.body.login
  const email = req.body.email
  const password = req.body.password

  createUser({
    firstname,
    lastname,
    login,
    email,
    password
  }).then(user => {
    res.status(201).json({
      success: true,
      user
    })
  })
})

app.post('/api/v1/auth/token', (req, res) => {
  const body = req.body || {}
  const { login, password } = body

  if (!login || !password) {
    res.status(401).json({
      success: false,
      message: 'Login and password are required'
    })
    return
  }

  // Vérifier ici que les identifiants sont valides
  const isValidCredentials = login === stan.login && password === stan.password //

  if (!isValidCredentials) {
    res.status(401).json({
      success: false,
      message: 'Identifiants invalides'
    })
    return
  }

  const payload = {
    login
  }

  const token = createToken(payload)
  res.status(201).json({
    success: true,
    user: {
      ...stan,
      password: undefined
    },
    token
  })
})

app.get('/api/v1/me', (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '')

  const response = res
    .header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    .header('Expires', '-1')
    .header('Pragma', 'no-cache')

  try {
    const payload = checkToken(token)
    // const login = payload.login
    // Chercher et trouver l'utilisateur correspondant à ce login
    // TODO: à faire avec mongodb
    console.log({ payload })
    response.json({
      success: true,
      user: {
        ...stan,
        password: undefined
      }
    })
  } catch (error) {
    response.status(401)
      .json({
        success: false,
        message: 'Token invalide'
      })
  }
})

getConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
    })
  }).catch(error => {
    console.error(error)
  })

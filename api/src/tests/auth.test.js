process.env.DATABASE_URL = 'postgres://hindsight_user:hindsight_pass@localhost:5433/hindsight'
process.env.JWT_SECRET = 'test_secret'
const request = require('supertest')
const express = require('express')
const pool = require('../db/pool')

require('dotenv').config()

const authRoutes = require('../routes/auth')

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

afterAll(async () => {
  await pool.end()
})

describe('Health', () => {
  it('sanity check', () => {
    expect(1 + 1).toBe(2)
  })
})

describe('POST /api/auth/register', () => {
  const testEmail = `test_${Date.now()}@example.com`

  it('creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'password123', display_name: 'Test User' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe(testEmail)
    expect(res.body.user.password_hash).toBeUndefined()
  })

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'password123', display_name: 'Test User' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'password123', display_name: 'Test User' })

    expect(res.status).toBe(409)
  })

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@example.com' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  const loginEmail = `login_${Date.now()}@example.com`

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: loginEmail, password: 'password123', display_name: 'Login User' })
  })

  it('returns a token with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail, password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginEmail, password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })

    expect(res.status).toBe(401)
  })
})

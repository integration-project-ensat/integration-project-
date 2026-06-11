import { describe, it, expect, beforeEach} from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import api from '../../services/api.js'
import authService from '../../services/auth.service'

Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: '' }
})

// mock axios
const mock = new MockAdapter(api)

describe('auth.service', () => {
  beforeEach(() => {
    localStorage.clear()
    mock.resetHandlers()
  })



  // ── LOGIN ──
  it('login réussit et sauvegarde le token', async () => {

    mock.onPost('/auth/seconnecter').replyOnce(200, {
      token: 'fake-token-123',
      user: { id: '1', email: 'test@test.com', role: 'student' }
    })

    const result = await authService.login('test@test.com', '123456')

    expect(result.token).toBe('fake-token-123')
    expect(localStorage.getItem('token')).toBe('fake-token-123')
  })

  it('login échoue avec mauvais identifiants', async () => {
    
    mock.onPost('/auth/seconnecter').replyOnce(401, {
      message: 'Identifiants invalides'
    })

    await expect(
      authService.login('wrong@test.com', 'wrongpass')
    ).rejects.toMatchObject({
      response: { status: 401 }
    })
  })

  // ── SIGNUP ──
  it('signup réussit et sauvegarde le token', async () => {
    mock.onPost('/auth/sinscrire').reply(201, {
      token: 'signup-token-456',
      user: { id: '2', email: 'new@test.com', role: 'student' }
    })

    const result = await authService.signup({
      firstName: 'Ferdaous',
      lastName: 'Test',
      email: 'new@test.com',
      password: '123456',
      role: 'student'
    })

    expect(result.token).toBe('signup-token-456')
    expect(localStorage.getItem('token')).toBe('signup-token-456')
  })

  it('signup échoue si email déjà utilisé', async () => {
    mock.onPost('/auth/sinscrire').reply(409, {
      message: 'Email déjà utilisé'
    })

    await expect(
      authService.signup({
        firstName: 'Test',
        lastName: 'Test',
        email: 'existing@test.com',
        password: '123456',
        role: 'student'
      })
    ).rejects.toMatchObject({
      response: { status: 409 }
    })
  })

  // ── LOGOUT ──
  it('logout supprime le token', () => {
    localStorage.setItem('token', 'some-token')
    authService.logout()
    expect(localStorage.getItem('token')).toBeNull()
  })

  // ── TOKEN ──
  it('le token est attaché automatiquement aux requêtes', async () => {
    localStorage.setItem('token', 'my-jwt-token')

    mock.onGet('/profile').reply(config => {
      expect(config.headers.Authorization).toBe('Bearer my-jwt-token')
      return [200, { user: 'ok' }]
    })

    await api.get('/profile')
  })
})
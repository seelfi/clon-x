const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud')
  }

  return data
}

export function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password
    })
  })
}

export function register(fullName, username, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      username,
      email,
      password
    })
  })
}
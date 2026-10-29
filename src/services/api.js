
const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
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
    body: JSON.stringify({ username, password }),
  })
}

export function register(fullName, username, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      username,
      email,
      password,
    }),
  })
}

export function getFeed(page = 1, size = 10) {
  return request(`/feed?page=${page}&size=${size}`)
}

export function createTweet(content) {
  return request('/tweets', {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function getUserProfile(username) {
  return request(`/users/${encodeURIComponent(username)}`)
}

export function searchUsers(query) {
  return request(`/users/search?q=${encodeURIComponent(query)}`)
}

export function followUser(username) {
  return request('/follows', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export function unfollowUser(username) {
  return request('/follows', {
    method: 'DELETE',
    body: JSON.stringify({ username }),
  })
}

export function updateBio(bio) {
  return request('/users/me/bio', {
    method: 'PUT',
    body: JSON.stringify({ bio }),
  })
}


export function toggleLike(tweetId) {
  return request(`/tweets/${tweetId}/like`, {
    method: 'POST',
  })
}

export function toggleRetweet(tweetId) {
  return request(`/tweets/${tweetId}/retweet`, {
    method: 'POST',
  })
}

export function getComments(tweetId) {
  return request(`/tweets/${tweetId}/comments`)
}

export function createComment(tweetId, content) {
  return request(`/tweets/${tweetId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}


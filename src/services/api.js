
const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

let getAuthToken = () => null
let onUnauthorized = () => {}

export function setAuthIntegration(integration = {}) {
  getAuthToken = integration.getToken || (() => null)
  onUnauthorized = integration.onUnauthorized || (() => {})
}

async function request(
  endpoint,
  options = {},
  fallbackMessage = 'Error en la solicitud'
) {
  const isAuthEndpoint = endpoint.startsWith('/auth/')
  const token = isAuthEndpoint ? null : getAuthToken()

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

  if (response.status === 401 && token) {
    onUnauthorized(token)
  }

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage)
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


export function getFeed(page = 1, size = 10, tab = "forYou") {
  return request(
    `/feed?page=${page}&size=${size}&tab=${encodeURIComponent(tab)}`
  );
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

export function getUserTweets(username, page = 1, size = 10) {
  return request(
    `/users/${encodeURIComponent(username)}/tweets?page=${page}&size=${size}`,
    {},
    'Error loading user posts'
  )
}

export function getUserRetweets(username, page = 1, size = 10) {
  return request(
    `/users/${encodeURIComponent(username)}/retweets?page=${page}&size=${size}`,
    {},
    'Error loading user retweets'
  )
}

export function getFollowers(username, page = 1, size = 10) {
  return request(
    `/users/${encodeURIComponent(username)}/followers?page=${page}&size=${size}`,
    {},
    'No se pudieron cargar los seguidores.'
  )
}

export function getFollowing(username, page = 1, size = 10) {
  return request(
    `/users/${encodeURIComponent(username)}/following?page=${page}&size=${size}`,
    {},
    'No se pudo cargar la lista de seguidos.'
  )
}

export function getFollowStatus(
  username,
  fallbackMessage = 'No se pudo consultar el seguimiento.'
) {
  return request(
    `/follows/${encodeURIComponent(username)}/status`,
    {},
    fallbackMessage
  )
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


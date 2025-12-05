// Authentication utilities

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('token')
  return !!token
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const getUser = (): any | null => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')

  if (!userStr || userStr === 'undefined' || userStr === 'null') {
    return null
  }

  try {
    return JSON.parse(userStr)
  } catch (e) {
    console.error('Invalid user JSON in localStorage:', userStr)
    return null
  }
}

export const logout = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export const requireAuth = (callback: () => void): void => {
  if (!isAuthenticated()) {
    window.location.href = '/login'
  } else {
    callback()
  }
}

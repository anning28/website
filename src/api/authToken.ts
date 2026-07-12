let authToken = '';

export function getAuthToken() {
  return authToken;
}

export function setAuthToken(token: string) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = '';
}

export function validateCredentials(email: unknown, password: unknown) {
  return typeof email === 'string' && email.includes('@') && typeof password === 'string' && password.length >= 8;
}

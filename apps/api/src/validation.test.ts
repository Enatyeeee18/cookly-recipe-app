import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCredentials } from './validation.js';

test('accepts valid credentials', () => {
  assert.equal(validateCredentials('cook@example.com', 'password123'), true);
});

test('rejects short or malformed credentials', () => {
  assert.equal(validateCredentials('cookexample.com', 'password123'), false);
  assert.equal(validateCredentials('cook@example.com', 'short'), false);
});

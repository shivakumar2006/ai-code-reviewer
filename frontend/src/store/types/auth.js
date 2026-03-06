// JSDoc types — gives you autocomplete without TypeScript
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} created_at
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} access_token
 * @property {string} refresh_token
 * @property {User} user
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} name
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */
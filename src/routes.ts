/**
 * An array of routes available to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/"];

/**
 * An array of routes protected from public access
 * These routes do require authentication
 * @type {string[]}
 */
export const privateRoutes = ["/logbook", "/flights"];

/**
 * An array of routes used for authentication
 * These routes do not require authentication
 * @type {string[]}
 */
export const authRoutes = [
  "/login",
  "/register",
  "/reset-password",
  "/new-password",
];

/**
 * Default redirect routes
 * @type {string}
 */
export const DEFAULT_REDIRECT = "/flights";

export const SESSION_COOKIE_NAME = "user_session";

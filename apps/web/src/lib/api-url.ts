/**
 * Get the API URL for server-side requests (API routes)
 * Uses internal Docker network URL in production, falls back to localhost for dev
 */
export const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

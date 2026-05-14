export async function computeSHA256(buffer) {
  return crypto.subtle.digest('SHA-256', buffer);
}
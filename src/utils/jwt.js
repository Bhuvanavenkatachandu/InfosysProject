export const createJWT = (user) => {
  return btoa(JSON.stringify({ user, exp: Date.now() + 3600 * 1000 }));
};

export const verifyJWT = (token) => {
  try {
    const data = JSON.parse(atob(token));
    return data.exp > Date.now() ? data.user : null;
  } catch {
    return null;
  }
};

const USERS_KEY = "dbs_users";
const SESSION_KEY = "dbs_session";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sanitize(user) {
  const safe = { ...user };
  delete safe.passwordHash;
  return safe;
}

export async function registerUser({ username, email, password, role }) {
  const users = getUsers();
  const exists = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (exists) {
    throw new Error("An account with this email already exists.");
  }
  if (!["doctor", "patient"].includes(role)) {
    throw new Error("Please choose a valid role.");
  }
  const user = {
    id: crypto.randomUUID(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
  return sanitize(user);
}

export async function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user) {
    throw new Error("No account found with this email.");
  }
  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    throw new Error("Incorrect password.");
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }));
  return sanitize(user);
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { id } = JSON.parse(raw);
    const user = getUsers().find((u) => u.id === id);
    return user && ["doctor", "patient"].includes(user.role)
      ? sanitize(user)
      : null;
  } catch {
    return null;
  }
}

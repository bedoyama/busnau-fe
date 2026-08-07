import type { CreateUserRequest } from "@/lib/model/createUserRequest";
import type { PageUser } from "@/lib/model/pageUser";
import type { User } from "@/lib/model/user";
import { UserRole } from "@/lib/model/userRole";

let nextId = 1;
let users: User[] = [];
let seeded = false;

/** Session mirror for mock /me after login. */
let sessionUser: User | null = null;

function seedIfNeeded(): void {
  if (seeded) return;
  seeded = true;
  const seededUsers: User[] = [
    { id: nextId++, username: "admin", role: UserRole.ADMIN },
    { id: nextId++, username: "alice", role: UserRole.USER },
    { id: nextId++, username: "bob", role: UserRole.USER },
  ];
  for (let i = 1; i <= 18; i++) {
    seededUsers.push({
      id: nextId++,
      username: `user${i}`,
      role: i % 7 === 0 ? UserRole.ADMIN : UserRole.USER,
    });
  }
  users = seededUsers;
}

export function setSessionUser(user: User | null): void {
  sessionUser = user;
}

export function getSessionUser(): User | null {
  return sessionUser;
}

export function listUsersPage(page: number, size: number): PageUser {
  seedIfNeeded();
  const safePage = Math.max(0, page);
  const safeSize = Math.max(1, size);
  const totalElements = users.length;
  const totalPages =
    totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize);
  const start = safePage * safeSize;
  const content = users.slice(start, start + safeSize);

  return {
    content,
    totalElements,
    totalPages,
    size: safeSize,
    number: safePage,
    numberOfElements: content.length,
    first: safePage === 0,
    last: totalPages === 0 || safePage >= totalPages - 1,
    empty: content.length === 0,
  };
}

export function createUser(body: CreateUserRequest): User {
  seedIfNeeded();
  const role =
    body.role === UserRole.ADMIN || body.role === "ADMIN"
      ? UserRole.ADMIN
      : UserRole.USER;
  const user: User = {
    id: nextId++,
    username: body.username,
    role,
  };
  users = [...users, user];
  return user;
}

export function findUserByUsername(username: string): User | undefined {
  seedIfNeeded();
  return users.find((u) => u.username === username);
}

import type { UserInterface } from "@/types/user.interface";

/** Mock users matching the POC MongoDB Users collection shape. */
export const mockUsers: UserInterface[] = [
  {
    id: "user_super_admin_001",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "SUPER_ADMIN",
    createdAt: "2025-01-15T08:00:00.000Z",
    updatedAt: "2025-01-15T08:00:00.000Z",
  },
];

/**
 * Server-only credential map — never import this in UI or client components.
 * Keyed by user email; swap for bcrypt hash comparison when MongoDB is connected.
 */
export const mockUserCredentials: Record<string, string> = {
  "john@example.com": "SuperAdmin123!",
};

export function findMockUserByEmail(email: string): UserInterface | undefined {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findMockUserById(id: string): UserInterface | undefined {
  return mockUsers.find((user) => user.id === id);
}

export function verifyMockUserPassword(email: string, password: string): boolean {
  const stored = mockUserCredentials[email.toLowerCase()];
  if (!stored) {
    return false;
  }
  return stored === password;
}

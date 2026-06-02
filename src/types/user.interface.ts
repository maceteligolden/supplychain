export type UserRole = "SUPER_ADMIN";

export interface UserInterface {
  /** Unique user identifier. */
  id: string;
  /** User first name. */
  firstName: string;
  /** User last name. */
  lastName: string;
  /** Login email address. */
  email: string;
  /** Platform role — SUPER_ADMIN only in POC. */
  role: UserRole;
  /** ISO timestamp when the user was created. */
  createdAt: string;
  /** ISO timestamp of last profile update. */
  updatedAt: string;
}

export interface AuthSessionInterface {
  /** Authenticated user identifier embedded in the session token. */
  userId: string;
  /** ISO timestamp when the session expires. */
  expiresAt: string;
}

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginOutput = {
  user: UserInterface;
};

export type GetCurrentUserOutput = UserInterface;

export type LogoutOutput = {
  success: boolean;
};

export type UserRole = 'admin' | 'instructor' | 'student';
export type SelfAssignableRole = Exclude<UserRole, 'admin'>;

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  message?: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  register: (name: string, email: string, password: string, role?: SelfAssignableRole) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

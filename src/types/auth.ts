/** Matches backend UserResponse / UserDto (login may omit some fields) */
export interface User {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  roles: string[];
  projectsCount?: number;
  conversationsCount?: number;
}

/** Request body for register - matches RegisterUserRequest */
export interface RegisterUserRequest {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  profileImage?: File | null;
}

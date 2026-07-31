export interface User {
  id:       string;
  email:    string;
  fullName: string;
  isActive: boolean;
  roles:    string[];
}

export interface NewUser {
  email:    string;
  fullName: string;
  password: string;
}

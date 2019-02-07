import {Team} from './team.model';

export interface User {
  loginId: string;
  role: UserRole;
}

export interface Student extends User {
  team: Team;
}

export interface Tutor extends User {
  allocatedTeams: Team[];
}

export interface Admin extends User {
  allocatedTeams?: Team[];
}

export enum UserRole {
  Admin = 'Admin',
  Tutor = 'Tutor',
  Student = 'Student'
}

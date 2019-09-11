import { Team } from './team.model';

export interface User {
  loginId: string;
  role: UserRole;
  team?: Team;
  allocatedTeams?: Team[];
}

export enum UserRole {
  Admin = 'Admin',
  Tutor = 'Tutor',
  Student = 'Student'
}

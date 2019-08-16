import { User } from './user.model';

export interface Team {
  id: string;
  teamMembers: User[];
}

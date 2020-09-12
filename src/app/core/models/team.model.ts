import { User } from './user.model';

export interface TeamData {
  id: string;
  teamMembers: User[];
}

export class Team implements TeamData {
  id: string;
  teamMembers: User[];

  constructor(data: TeamData) {
    Object.assign(this, data);
  }

  get tutorialClassId() {
    const [tutorialClass, tutorialName] = this.id.split('-');
    return `${tutorialClass}-${tutorialName}`;
  }

  get teamId() {
    return this.id.split('-')[2];
  }
}

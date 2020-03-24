import { DataFile } from '../../src/app/core/models/data-file.model';
import { Team } from '../../src/app/core/models/team.model';
import { User, UserRole } from '../../src/app/core/models/user.model';

// An example csv string that would be obtained from GitHub
export const csvString = `
role,name,team
admin,admin,
tutor,tutor1,CS2103T-W1-1
tutor,tutor1,CS2103T-W1-2
tutor,tutor2,CS2103T-W1-3
tutor,tutor2,CS2103T-W1-4
student,student1,CS2103T-W1-1
student,student2,CS2103T-W1-1
student,student3,CS2103T-W1-2
student,student4,CS2103T-W1-2
`;

// An example data file that would be obtained from processing the above csv string
export const dataFile = {
  roles: {
    students: {
      student1: 'true',
      student2: 'true',
      student3: 'true',
      student4: 'true'
    },
    tutors: { tutor1: 'true', tutor2: 'true' },
    admins: { admin: 'true' }
  },
  'team-structure': {
    'CS2103T-W1-1': { student1: 'true', student2: 'true' },
    'CS2103T-W1-2': { student3: 'true', student4: 'true' }
  },
  'students-allocation': {
    student1: { teamId: 'CS2103T-W1-1' },
    student2: { teamId: 'CS2103T-W1-1' },
    student3: { teamId: 'CS2103T-W1-2' },
    student4: { teamId: 'CS2103T-W1-2' }
  },
  'tutors-allocation': {
    tutor1: { 'CS2103T-W1-1': 'true', 'CS2103T-W1-2': 'true' },
    tutor2: { 'CS2103T-W1-3': 'true', 'CS2103T-W1-4': 'true' }
  },
  'admins-allocation': { admin: {} }
};

const teamStructure = new Map<string, Team>();
const team1: User[] = [{loginId: 'student1', role: UserRole.Student}, {loginId: 'student2', role: UserRole.Student}];
const team2: User[] = [{loginId: 'student3', role: UserRole.Student}, {loginId: 'student4', role: UserRole.Student}];
teamStructure.set('CS2103T-W1-1', {id: 'CS2103T-W1-1', teamMembers: team1});
teamStructure.set('CS2103T-W1-2', {id: 'CS2103T-W1-2', teamMembers: team2});

export const dataFileTeamStructure: DataFile = {
  teamStructure: teamStructure
};

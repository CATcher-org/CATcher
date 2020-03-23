import { UserRole } from "../../src/app/core/models/user.model"

export const csvString = `
role,name,team
student,JunWei96,CS2103T-W12-3
admin,damithc,
tutor,anubh-v,CS2103T-W12-3
admin,geshuming,
tutor,testathorTutor,CS2103T-W12-3
tutor,testathorTutor,CS2103T-W12-4
tutor,anotherTutor,CS2103T-W12-4
tutor,testathorTutor,CS2103T-W12-3
student,testathorStudent,CS2103T-W12-3
student,damithc,CS2103T-W12-3
student,somestudent,CS2103T-W12-4
student,RonakLakhotia,CS2103T-W12-4
student,ptvrajsk,CS2103T-W12-3
`

// jsonData is a json representation of csvString
export const jsonData = {
    roles: {
      students: {
        junwei96: 'true',
        testathorstudent: 'true',
        damithc: 'true',
        somestudent: 'true',
        ronaklakhotia: 'true',
        ptvrajsk: 'true'
      },
      tutors: { 'anubh-v': 'true', testathortutor: 'true', anothertutor: 'true' },
      admins: { damithc: 'true', geshuming: 'true' }
    },
    'team-structure': {
      'CS2103T-W12-3': {
        junwei96: 'true',
        testathorstudent: 'true',
        damithc: 'true',
        ptvrajsk: 'true'
      },
      'CS2103T-W12-4': { somestudent: 'true', ronaklakhotia: 'true' }
    },
    'students-allocation': {
      junwei96: { teamId: 'CS2103T-W12-3' },
      testathorstudent: { teamId: 'CS2103T-W12-3' },
      damithc: { teamId: 'CS2103T-W12-3' },
      somestudent: { teamId: 'CS2103T-W12-4' },
      ronaklakhotia: { teamId: 'CS2103T-W12-4' },
      ptvrajsk: { teamId: 'CS2103T-W12-3' }
    },
    'tutors-allocation': {
      'anubh-v': { 'CS2103T-W12-3': 'true' },
      testathortutor: { 'CS2103T-W12-3': 'true', 'CS2103T-W12-4': 'true' },
      anothertutor: { 'CS2103T-W12-4': 'true' }
    },
    'admins-allocation': { damithc: {}, geshuming: {} }
  };

// These are objects representing some users and teams in jsonData
const TEAM_3 = {
    id: 'CS2103T-W12-3',
    teamMembers: [{loginId: 'junwei96', role: UserRole.Student},
                  {loginId: 'testathorstudent', role: UserRole.Student}  ,
                  {loginId: 'damithc',  role: UserRole.Student},
                  {loginId: 'ptvrajsk', role: UserRole.Student}]
}

export const USER_JUNWEI = {
    loginId: 'junwei96',
    role: UserRole.Student,
    team: TEAM_3
}

export const USER_ANUBHAV = {
    loginId: 'anubh-v',
    role: UserRole.Tutor,
    allocatedTeams: [TEAM_3]
}

export const csvString = `
role,name,team
student,JunWei96,CS2103T-W12-3
admin,damithc,
tutor,anubh-v,CS2103T-W12-3
admin,geshuming,
tutor,jj-lim,CS2103T-W12-3
tutor,jj-lim,CS2103T-W12-4
tutor,q,CS2103T-W12-4
tutor,jj-lim,CS2103T-W12-3
student,003-samuel,CS2103T-W12-3
student,damithc,CS2103T-W12-3
student,RonakLakhotia,CS2103T-W12-4
student,ptvrajsk,CS2103T-W12-3
`

// jsonData is a json representation of csvString
export const jsonData = {
    roles: {
      students: {
        junwei96: 'true',
        '003-samuel': 'true',
        damithc: 'true',
        ronaklakhotia: 'true',
        ptvrajsk: 'true'
      },
      tutors: { 'anubh-v': 'true', 'jj-lim': 'true', q: 'true' },
      admins: { damithc: 'true', geshuming: 'true' }
    },
    'team-structure': {
      'CS2103T-W12-3': {
        junwei96: 'true',
        '003-samuel': 'true',
        damithc: 'true',
        ptvrajsk: 'true'
      },
      'CS2103T-W12-4': { ronaklakhotia: 'true' }
    },
    'students-allocation': {
      junwei96: { teamId: 'CS2103T-W12-3' },
      '003-samuel': { teamId: 'CS2103T-W12-3' },
      damithc: { teamId: 'CS2103T-W12-3' },
      ronaklakhotia: { teamId: 'CS2103T-W12-4' },
      ptvrajsk: { teamId: 'CS2103T-W12-3' }
    },
    'tutors-allocation': {
      'anubh-v': { 'CS2103T-W12-3': 'true' },
      'jj-lim': { 'CS2103T-W12-3': 'true', 'CS2103T-W12-4': 'true' },
      q: { 'CS2103T-W12-4': 'true' }
    },
    'admins-allocation': { damithc: {}, geshuming: {} }
  }
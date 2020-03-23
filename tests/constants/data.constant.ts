import { DataService } from "../../src/app/core/services/data.service"

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

const dataService = new DataService(null);
export const jsonData = dataService.constructData({data: csvString});

export const USER_ANUBHAV = {
    loginId: 'anubh-v',
    role: 'tutor',
    team: 'CS2103-W12-3'
}
import { GithubService } from '../../src/app/core/services/github.service';
import { DataService } from '../../src/app/core/services/data.service';
import { autoSpy } from '../auto-spy';

const csvString = `
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

describe('DataService', () => {
  it('when getDataFile is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.getDataFile();
    // assert
    // expect(c).toEqual
  });

  it('when constructData is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.constructData();
    // assert
    // expect(c).toEqual
  });

  it('when parseAdminAllocation is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const admins = c.parseAdminAllocation(csvString);
    // assert
    expect(admins['admin']).toBeTruthy();
  });

  it('when parseTutorAllocation is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.parseTutorAllocation();
    // assert
    // expect(c).toEqual
  });

  it('when parseStudentAllocation is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.parseStudentAllocation();
    // assert
    // expect(c).toEqual
  });

  it('when parseTeamStructureData is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.parseTeamStructureData();
    // assert
    // expect(c).toEqual
  });

  it('when parseRolesData is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.parseRolesData();
    // assert
    // expect(c).toEqual
  });

  it('when csvParser is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.csvParser();
    // assert
    // expect(c).toEqual
  });

  it('when getTeam is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.getTeam();
    // assert
    // expect(c).toEqual
  });

  it('when getTeams is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.getTeams();
    // assert
    // expect(c).toEqual
  });

  it('when reset is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    // c.reset();
    // assert
    // expect(c).toEqual
  });


});

function setup() {
  const githubService = autoSpy(GithubService);
  const builder = {
    githubService,
    default() {
      return builder;
    },
    build() {
      return new DataService(githubService);
    }
  };

  return builder;
}

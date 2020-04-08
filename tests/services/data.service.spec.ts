import { of } from 'rxjs';
import { DataService } from '../../src/app/core/services/data.service';
import { GithubService } from '../../src/app/core/services/github.service';
import { autoSpy } from '../auto-spy';
import { csvString, jsonData, dataFileTeamStructure } from '../constants/data.constants';

describe('DataService', () => {
  it('when getDataFile is called it should return the correct data', done => {
    // arrange
    const { build, githubService } = setup().default();
    const c = build();
    githubService.fetchDataFile.and.returnValue(of({'data': csvString}));
    // act
    const d = c.getDataFile();
    // assert
    d.subscribe(data => {
      expect(data).toEqual(jsonData);
      done();
    });
  });

  it('when getDataFile is called it should set dataFile with correct data', done => {
    // arrange
    const { build, githubService } = setup().default();
    const c = build();
    githubService.fetchDataFile.and.returnValue(of({'data': csvString}));
    // act
    const d = c.getDataFile();
    // assert
    d.subscribe(data => {
      expect(c.dataFile).toEqual(dataFileTeamStructure);
      done();
    });
  });

  it('when constructData is called it should return the correct data', () => {
    // arrange
    const { build, githubService } = setup().default();
    const c = build();
    githubService.fetchDataFile.and.returnValue(of({'data': csvString}));
    // act
    let d: {};
    githubService.fetchDataFile().subscribe(data => {
      d = c.constructData(data);
    });
    // assert
    expect(d).toEqual(jsonData);
  });

  it('when parseAdminAllocation is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseAdminAllocation(csvString);
    // assert
    expect(d).toEqual(jsonData['admins-allocation']);
  });

  it('when parseTutorAllocation is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseTutorAllocation(csvString);
    // assert
    expect(d).toEqual(jsonData['tutors-allocation']);
  });

  it('when parseStudentAllocation is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseStudentAllocation(csvString);
    // assert
    expect(d).toEqual(jsonData['students-allocation']);
  });

  it('when parseTeamStructureData is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseTeamStructureData(csvString);
    // assert
    expect(d).toEqual(jsonData['team-structure']);
  });

  it('when parseRolesData is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseRolesData(csvString);
    // assert
    expect(d).toEqual(jsonData['roles']);
  });

  it('when getTeam is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    spyOn(c, 'getDataFile').and.callFake(() => {
      c.dataFile = dataFileTeamStructure;
      return of({});
    });
    // act
    c.getDataFile();
    // assert
    expect(c.getTeam('CS2103T-W12-3')).toEqual(dataFileTeamStructure.teamStructure.get('CS2103T-W12-3'));
    expect(c.getTeam('CS2103T-W12-4')).toEqual(dataFileTeamStructure.teamStructure.get('CS2103T-W12-4'));
    expect(c.getTeam('CS2103T-W12-1')).toBeUndefined();
    expect(c.getTeam('CS2103T-W12-2')).toBeUndefined();
  });

  it('when getTeams is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    spyOn(c, 'getDataFile').and.callFake(() => {
      c.dataFile = dataFileTeamStructure;
      return of({});
    });
    const teams = [
      'CS2103T-W12-3',
      'CS2103T-W12-4'
    ];
    // act
    c.getDataFile();
    const d = c.getTeams();
    // assert
    expect(d).toEqual(teams);
  });

  it('when reset is called it should set dataFile to undefined', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    spyOn(c, 'getDataFile').and.callFake(() => {
      c.dataFile = dataFileTeamStructure;
      return of({});
    });
    // assert
    c.getDataFile();
    expect(c.dataFile).toBeDefined();
    c.reset();
    expect(c.dataFile).toBeUndefined();
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

import { of } from 'rxjs';
import { DataService } from '../../src/app/core/services/data.service';
import { GithubService } from '../../src/app/core/services/github.service';
import { autoSpy } from '../auto-spy';
import { csvString, dataFile, dataFileTeamStructure } from '../constants/data.constants';

describe('DataService', () => {
  it('when getDataFile is called it should return the correct data', () => {
    // arrange
    const { build, githubService } = setup().default();
    const c = build();
    githubService.fetchDataFile.and.returnValue(of({'data': csvString}));
    // act
    const d = c.getDataFile();
    // assert
    d.subscribe(data => {
      expect(data).toEqual(dataFile);
    });
  });

  it('when getDataFile is called it should set dataFile with correct data', () => {
    // arrange
    const { build, githubService } = setup().default();
    const c = build();
    githubService.fetchDataFile.and.returnValue(of({'data': csvString}));
    // act
    const d = c.getDataFile();
    // assert
    d.subscribe(data => undefined);
    expect(c.dataFile).toEqual(dataFileTeamStructure);
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
    expect(d).toEqual(dataFile);
  });

  it('when parseAdminAllocation is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseAdminAllocation(csvString);
    // assert
    expect(d).toEqual(dataFile['admins-allocation']);
  });

  it('when parseTutorAllocation is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseTutorAllocation(csvString);
    // assert
    expect(d).toEqual(dataFile['tutors-allocation']);
  });

  it('when parseStudentAllocation is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseStudentAllocation(csvString);
    // assert
    expect(d).toEqual(dataFile['students-allocation']);
  });

  it('when parseTeamStructureData is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseTeamStructureData(csvString);
    // assert
    expect(d).toEqual(dataFile['team-structure']);
  });

  it('when parseRolesData is called it should return the correct data', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    const d = c.parseRolesData(csvString);
    // assert
    expect(d).toEqual(dataFile['roles']);
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
    expect(c.getTeam('CS2103T-W1-1')).toEqual(dataFileTeamStructure.teamStructure.get('CS2103T-W1-1'));
    expect(c.getTeam('CS2103T-W1-2')).toEqual(dataFileTeamStructure.teamStructure.get('CS2103T-W1-2'));
    expect(c.getTeam('CS2103T-W1-3')).toBeUndefined();
    expect(c.getTeam('CS2103T-W1-4')).toBeUndefined();
    expect(c.getTeam('CS2103T-W2-1')).toBeUndefined();
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
      'CS2103T-W1-1',
      'CS2103T-W1-2'
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

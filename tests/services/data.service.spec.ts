import { of } from 'rxjs';
import { DataService } from '../../src/app/core/services/data.service';
import { GithubService } from '../../src/app/core/services/github.service';
import { autoSpy } from '../auto-spy';
import { csvString, jsonData, dataFileTeamStructure } from '../constants/data.constants';

describe('DataService', () => {
  it('when getDataFile is called it should return the correct data', done => {
    const { build, githubService } = setup();
    const dataService = build();
    githubService.fetchDataFile.and.returnValue(of({'data': csvString}));

    dataService.getDataFile().subscribe(actual => {
      expect(actual).toEqual(jsonData);
      done();
    });
  });

  it('when getDataFile is called it should set dataFile with correct data', done => {
    const { build, githubService } = setup();
    const dataService = build();
    githubService.fetchDataFile.and.returnValue(of({'data': csvString}));

    dataService.getDataFile().subscribe(actual => {
      expect(dataService.dataFile).toEqual(dataFileTeamStructure);
      done();
    });
  });

  it('when getTeam is called it should return the correct data', () => {
    // arrange
    const { build } = setup();
    const dataService = build();
    spyOn(dataService, 'getDataFile').and.callFake(() => {
      dataService.dataFile = dataFileTeamStructure;
      return of({});
    });
    // act
    dataService.getDataFile();
    // assert
    expect(dataService.getTeam('CS2103T-W12-3')).toEqual(dataFileTeamStructure.teamStructure.get('CS2103T-W12-3'));
    expect(dataService.getTeam('CS2103T-W12-4')).toEqual(dataFileTeamStructure.teamStructure.get('CS2103T-W12-4'));
    expect(dataService.getTeam('CS2103T-W12-1')).toBeUndefined();
    expect(dataService.getTeam('CS2103T-W12-2')).toBeUndefined();
  });

  it('when getTeams is called it should return the correct data', () => {
    // arrange
    const { build } = setup();
    const dataService = build();
    spyOn(dataService, 'getDataFile').and.callFake(() => {
      dataService.dataFile = dataFileTeamStructure;
      return of({});
    });
    const teams = [
      'CS2103T-W12-3',
      'CS2103T-W12-4'
    ];
    // act
    dataService.getDataFile();
    const actual = dataService.getTeams();
    // assert
    expect(actual).toEqual(teams);
  });

  it('when reset is called it should set dataFile to undefined', () => {
    // arrange
    const { build } = setup();
    const dataService = build();
    spyOn(dataService, 'getDataFile').and.callFake(() => {
      dataService.dataFile = dataFileTeamStructure;
      return of({});
    });
    // assert
    dataService.getDataFile();
    expect(dataService.dataFile).toBeDefined();
    dataService.reset();
    expect(dataService.dataFile).toBeUndefined();
  });
});

function setup() {
  const githubService = autoSpy(GithubService);
  const builder = {
    githubService,
    build() {
      return new DataService(githubService);
    }
  };

  return builder;
}

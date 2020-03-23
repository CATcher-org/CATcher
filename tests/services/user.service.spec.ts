import { jsonData, USER_JUNWEI, USER_ANUBHAV } from '../constants/data.constant'
import { UserService } from '../../src/app/core/services/user.service'
import { of } from 'rxjs';

let dataService: any;

describe('UserService should correctly create User objects', () => {
  
  beforeAll(() => {
    dataService = jasmine.createSpyObj("DataService", ['getDataFile']);
    dataService.getDataFile.and.returnValue(of(jsonData));
  });

  it('should create a Student user correctly', async () => {
    const userService = new UserService(null, dataService);
    const user = await userService.createUserModel(USER_JUNWEI.loginId).toPromise();
    expect(user).toEqual(USER_JUNWEI);
  });

  it('should create a Tutor user correctly', async () => {
    const userService = new UserService(null, dataService);
    const user = await userService.createUserModel(USER_ANUBHAV.loginId).toPromise();
    expect(user).toEqual(USER_ANUBHAV);
  });
});
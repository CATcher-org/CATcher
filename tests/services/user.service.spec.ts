import { jsonData, USER_ANUBHAV } from '../constants/data.constant'
import { UserService } from '../../src/app/core/services/user.service'
import { of } from 'rxjs';

let dataService: any;

describe('Test the User Service', () => {
  
  beforeAll(() => {
    dataService = jasmine.createSpyObj("DataService", ['getDataFile']);
    dataService.getDataFile.and.returnValue(of(jsonData));
  })

  it('createUserModel should create a User correctly, from json data', async () => {
    const userService = new UserService(null, dataService);
    const user = await userService.createUserModel(USER_ANUBHAV.loginId).toPromise();
    expect(user.loginId).toBe(USER_ANUBHAV.loginId);
    expect(user.role).toBe(USER_ANUBHAV.role);
    expect(user.team).toBe(USER_ANUBHAV.team);
  });

  
});
import { jsonData, USER_JUNWEI } from '../constants/data.constant'
import { UserService } from '../../src/app/core/services/user.service'
import { of } from 'rxjs';

let dataService: any;

describe('Test the User Service', () => {
  
  beforeAll(() => {
    dataService = jasmine.createSpyObj("DataService", ['getDataFile']);
    dataService.getDataFile.and.returnValue(of(jsonData));
  })

  it('createUserModel should create a Student user correctly, from json data', async () => {
    const userService = new UserService(null, dataService);
    const user = await userService.createUserModel(USER_JUNWEI.loginId).toPromise();
    expect(user).toEqual(USER_JUNWEI);
  });

  
});
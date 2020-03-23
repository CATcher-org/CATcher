import { jsonData, USER_JUNWEI, USER_ANUBHAV, USER_SHUMING } from '../constants/data.constant'
import { UserService } from '../../src/app/core/services/user.service'
import { of } from 'rxjs';
import { User } from '../../src/app/core/models/user.model';
import { doesNotReject } from 'assert';

let dataService: any;

describe('UserService should correctly create User objects', () => {
  beforeAll(() => {
    dataService = jasmine.createSpyObj("DataService", ['getDataFile']);
    dataService.getDataFile.and.returnValue(of(jsonData));
  });

  it('should create a Student user correctly', async () => {
    await createAndVerifyUser(USER_JUNWEI.loginId, USER_JUNWEI);
  });

  it('should create a Tutor user correctly', async () => {
    await createAndVerifyUser(USER_ANUBHAV.loginId, USER_ANUBHAV);
  });

  it('should create an Admin user correctly', async () => {
    await createAndVerifyUser(USER_SHUMING.loginId, USER_SHUMING);
  });

  it('should throw an error if the user is unauthorized', (done) => {
    const userService = new UserService(null, dataService);
    userService.createUserModel('RandomUser').subscribe(
      user => {
        fail('This test case should have failed.');
        done();
      },
      error => {
        expect(error).toBe('Unauthorized user.');
        done();
      }
    );
  });
});

async function createAndVerifyUser(loginId: string, expectedUser: User) {
  const userService = new UserService(null, dataService);
  const actualUser = await userService.createUserModel(loginId).toPromise();
  expect(actualUser).toEqual(expectedUser);
}
import { jsonData, USER_JUNWEI, USER_Q, USER_SHUMING, USER_WITH_TWO_ROLES } from '../constants/data.constants'
import { UserService } from '../../src/app/core/services/user.service'
import { User, UserRole } from '../../src/app/core/models/user.model';
import { of } from 'rxjs';

let dataService: any;

describe('UserService', () => {
  describe('.createUserModel(loginId)', () => {
    beforeAll(() => {
      dataService = jasmine.createSpyObj("DataService", ['getDataFile']);
      dataService.getDataFile.and.returnValue(of(jsonData));
    });

    it('creates a Student user correctly', async () => {
      await createAndVerifyUser(USER_JUNWEI.loginId, USER_JUNWEI);
    });

    it('creates a Tutor user correctly when loginId is very short', async () => {
      await createAndVerifyUser(USER_Q.loginId, USER_Q);
    });

    it('creates an Admin user correctly', async () => {
      await createAndVerifyUser(USER_SHUMING.loginId, USER_SHUMING);
    });

    it('treats the loginId in a case insensitive manner', async () => {
      await createAndVerifyUser('JUNWEi96', USER_JUNWEI);
    });

    it('assigns highest possible role to a user, based on all roles of that user in data.csv', async () => {
      await createAndVerifyUser(USER_WITH_TWO_ROLES.loginId, USER_WITH_TWO_ROLES);
    });

    it('throws an error if the user is unauthorized', (done) => {
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
});

async function createAndVerifyUser(loginId: string, expectedUser: User) {
  const userService = new UserService(null, dataService);
  const actualUser = await userService.createUserModel(loginId).toPromise();
  expect(actualUser).toEqual(expectedUser);
}
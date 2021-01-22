import { Profile } from '../app/auth/profiles/profiles.component';

export const AppConfig = {
  production: false,
  test: true,
  clientId: '0cbc5e651d8b01e36687',
  githubUrl: 'https://github.com',
  accessTokenUrl: 'https://catcher-proxy.herokuapp.com/authenticate',
  origin: 'http://localhost:4200',
  profiles: [
    <Profile>{
      profileName: 'CATcher',
      encodedText: 'CATcher-org/public_data'
    }
  ],
  role: 'student',
  username: 'CAT-Tester',
  team: 'CS2103T-W12-3'
};

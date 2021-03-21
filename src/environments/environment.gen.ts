import { Profile } from '../app/core/models/profile.model';

const BaseConfig = {
  githubUrl: 'https://github.com',
  accessTokenUrl: 'https://catcher-proxy.herokuapp.com/authenticate',
  clientDataUrl: 'https://raw.githubusercontent.com/CATcher-org/client_data/master/profiles.json'
};

export function generateDefaultEnv() {
  return {
    ...BaseConfig,
    production: false,
    test: false,
    clientId: '0cbc5e651d8b01e36687',
    origin: 'http://localhost:4200',
    profiles: [
      <Profile>{
        profileName: 'CATcher',
        encodedText: 'CATcher-org/public_data'
      }
    ]
  };
}

export function generateTestEnv() {
  return {
    ...generateDefaultEnv(),
    test: true,
    role: 'student',
    username: 'CAT-Tester',
    team: 'CS2103T-W12-3'
  };
}

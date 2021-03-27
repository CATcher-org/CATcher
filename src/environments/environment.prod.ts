import { Profile } from '../app/core/models/profile.model';

const appSetting = require('../../package.json');

export const AppConfig = {
  production: true,
  test: false,
  version: appSetting.version, 
  clientId: '5e1ed08cff7f0de1d68d',
  githubUrl: 'https://github.com',
  accessTokenUrl: 'https://catcher-proxy.herokuapp.com/authenticate',
  origin: 'https://catcher-org.github.io',
  profiles: [
    <Profile>{
      profileName: 'CS2103/T Alpha Test',
      encodedText: 'nus-cs2103-AY2021S2/alpha'
    },
    <Profile>{
      profileName: 'CS2103/T PE Dry run',
      encodedText: 'nus-cs2103-AY2021S2/PED'
    },
    <Profile>{
      profileName: 'CS2103/T PE',
      encodedText: 'nus-cs2103-AY2021S2/PE'
    },
    <Profile>{
      profileName: 'CS2113/T Alpha Test',
      encodedText: 'nus-cs2113-AY2021S2/alpha'
    },
    <Profile>{
      profileName: 'CS2113/T PE Dry run',
      encodedText: 'nus-cs2113-AY2021S2/PED'
    },
    <Profile>{
      profileName: 'CS2113/T PE',
      encodedText: 'nus-cs2113-AY2021S2/PE'
    },
    <Profile>{
      profileName: 'TIC4002 Alpha Test',
      encodedText: 'nus-tic4002-AY2021S2/alpha'
    },
    <Profile>{
      profileName: 'TIC4002 PE Dry run',
      encodedText: 'nus-tic4002-AY2021S2/PED'
    },
    <Profile>{
      profileName: 'TIC4002 PE',
      encodedText: 'nus-tic4002-AY2021S2/PE'
    }
  ]
};

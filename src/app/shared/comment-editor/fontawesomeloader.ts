import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBold,
  faItalic,
  faStrikethrough,
  faListOl,
  faListUl,
  faHeading,
  faQuoteRight,
  faCode,
  faLink,
  faFileImage,
  faTable,
  faWrench,
  faQuestionCircle,
  faDownload,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';

// Add an icon to the library for convenient access in other components
export const fontAwesomeLoader = {
  libraryLoader: () => {
    library.add(
      faBold,
      faItalic,
      faStrikethrough,
      faListOl,
      faListUl,
      faHeading,
      faQuoteRight,
      faCode,
      faLink,
      faFileImage,
      faTable,
      faWrench,
      faQuestionCircle,
      faDownload,
      faUpload,
      faTwitter,
      faGithub
    );
  }
};

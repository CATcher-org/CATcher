import {UploadService, SUPPORTED_FILE_TYPES} from '../../src/app/core/services/upload.service';

describe('Test the UploadService', () => {
    it('Test whether the UploadService can detect valid / invalid filetypes', () => {
        const uploadService = new UploadService(null);
        const numOfAcceptedFileTypes = SUPPORTED_FILE_TYPES.length;
        const randomValidFileType = SUPPORTED_FILE_TYPES[randomIntBetween(0, numOfAcceptedFileTypes)];
        const validFileName = "testFile." + randomValidFileType;
        const invalidFileName = "testFile." + 'java';
        expect(uploadService.isSupportedFileType(validFileName)).toBe(true);
        expect(uploadService.isSupportedFileType(invalidFileName)).toBe(false);
    });
});

function randomIntBetween(smallerInt : number, largerInt : number) {
  return Math.floor(Math.random() * (largerInt - smallerInt)) + smallerInt;
}
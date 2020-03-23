import {UploadService, SUPPORTED_FILE_TYPES, FILE_TYPE_SUPPORT_ERROR} from '../../src/app/core/services/upload.service';

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

    it('UploadService should throw an error if an invalid filetype is uploaded', done => {
      const uploadService = new UploadService(null);
      uploadService.uploadFile('testdata', 'testFile.java').subscribe(
        val => {
          fail('This test case should fail.');
          done();
        },
        error => {
          expect(error).toBe(FILE_TYPE_SUPPORT_ERROR);
          done();
        }
      );
    });
});

function randomIntBetween(smallerInt : number, largerInt : number) {
  return Math.floor(Math.random() * (largerInt - smallerInt)) + smallerInt;
}
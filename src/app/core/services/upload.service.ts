import {Injectable} from '@angular/core';
import {GithubService} from './github.service';
import {uuid} from '../../shared/lib/uuid';
import {throwError} from 'rxjs';

export const FILE_TYPE_SUPPORT_ERROR = 'We dont support that file type.' +
  ' Try again with GIF, JPEG, JPG, PNG, DOCX, GZ, LOG, PDF, PPTX, TXT, XLSX, ZIP.';
const SUPPORTED_FILE_TYPES = ['gif', 'jpeg', 'jpg', 'png', 'docx', 'gz', 'log', 'pdf', 'pptx', 'txt', 'xlsx', 'zip'];

@Injectable({
  providedIn: 'root',
})
export class UploadService {

  constructor(private githubService: GithubService) {}

  uploadFile(base64File: string | ArrayBuffer, userFilename: string) {
    let base64String: string;
    if (base64File instanceof ArrayBuffer) {
      base64String = String.fromCharCode.apply(null, new Uint16Array(base64File));
    } else {
      base64String = base64File;
    }
    const fileType = userFilename.split('.').pop();

    if (SUPPORTED_FILE_TYPES.includes(fileType.toLowerCase())) {
      base64String = base64String.split(',')[1];
      const onlineFilename = uuid();
      return this.githubService.uploadFile(`${onlineFilename}.${fileType}`, base64String);
    } else {
      return throwError(FILE_TYPE_SUPPORT_ERROR);
    }
  }

  isSupportedFileType(fileName): boolean {
    const fileType = fileName.split('.').pop();
    return SUPPORTED_FILE_TYPES.includes(fileType.toLowerCase());
  }
}

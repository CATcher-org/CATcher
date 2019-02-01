import {Injectable} from '@angular/core';
import {GithubService} from './github.service';
import {uuid} from '../../shared/lib/uuid';
import {throwError} from 'rxjs';

const SUPPORTED_FILE_TYPES = ['gif', 'jpeg', 'jpg', 'png', 'docx', 'gz', 'log', 'pdf', 'pptx', 'txt', 'xlsx', 'zip'];

@Injectable({
  providedIn: 'root',
})
export class UploadService {

  constructor(private githubService: GithubService) {}

  uploadImage(base64Image: string | ArrayBuffer, userFilename: string) {
    let base64String: string;
    if (base64Image instanceof ArrayBuffer) {
      base64String = String.fromCharCode.apply(null, new Uint16Array(base64Image));
    } else {
      base64String = base64Image;
    }
    const fileType = userFilename.split('.')[1];

    if (SUPPORTED_FILE_TYPES.includes(fileType)) {
      base64String = base64String.split(',')[1];
      const onlineFilename = uuid();
      return this.githubService.uploadImage(`${onlineFilename}.${fileType}`, base64String);
    } else {
      return throwError('We dont support that file type. Try again with GIF, JPEG, JPG, PNG, DOCX, GZ, LOG, PDF, PPTX, TXT, XLSX, ZIP.');
    }
  }
}

import { LoadingService } from '../../../core/services/loading.service';

export interface Saveable {
  isSavePending: boolean;
  loadingService: LoadingService;
  showSpinner(): void;
  hideSpinner(): void;
}

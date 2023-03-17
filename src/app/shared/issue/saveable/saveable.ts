import { LoadingService } from '../../../core/services/loading.service';

export interface Saveable {
  isSavePending: boolean;
  loader: LoadingService;
  showSavePending(): void;
  hideSavePending(): void;
}

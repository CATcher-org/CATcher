import {Team} from './team.model';

export interface DataFile {
  // Mapping from teamId to their respective team model.
  teamStructure: Map<string, Team>;
}

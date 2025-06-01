// src/app/core/models/ui.model.ts
import {MediaItem} from '@models/media.model';
import {Subscription} from 'rxjs';

export interface Breadcrumb {
  label: string;
  link?: string;
}

export interface SectionState {
  details: boolean;
  files: boolean;
  notes: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  badge?: string;
  active?: boolean;
}


export interface LogMessage {
  type: string;
  date: string;
  time: string;
  user: string;
  message: string;
}

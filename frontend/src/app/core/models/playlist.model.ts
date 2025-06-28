import { Song } from './song.model';
import { User } from './user.model';

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  owner: User;
  songs: Song[];
  isPublic: boolean;
  followers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}
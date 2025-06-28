export interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  profileImage?: string;
  avatar?: string;
  followers: string[];
  following: string[];
  likedSongs: string[];
  playlists: string[];
  recentlyPlayed: RecentlyPlayedItem[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecentlyPlayedItem {
  songId: string;
  playedAt: Date;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profileImage?: string;
  avatar?: string;
  followers: User[];
  following: User[];
  playlists: Playlist[];
  recentlyPlayed: RecentlyPlayedItem[];
  isFollowing?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  customAvatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Avatar {
  id: string;
  url: string;
  name: string;
}

import { Playlist } from "./playlist.model";

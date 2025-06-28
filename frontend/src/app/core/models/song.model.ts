export interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl: string;
  imageUrl?: string;
  genre: string;
  releaseDate: Date;
  playCount: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Album {
  _id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  releaseDate: Date;
  genre: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayHistory {
  _id: string;
  userId: string;
  songId: string;
  song: Song;
  playedAt: Date;
}
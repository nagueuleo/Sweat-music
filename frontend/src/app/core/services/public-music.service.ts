import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Song } from "../models/song.model";

@Injectable({
  providedIn: "root",
})
export class PublicMusicService {
  // Musiques publiques disponibles dans le dossier public
  private publicSongs: Song[] = [
    {
      _id: "public-1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: 200,
      audioUrl: "/songs/The Weeknd - Blinding Lights.mp3",
      imageUrl: "/cover-images/1.jpg",
      genre: "Pop",
      playCount: 1500000,
      likes: 45000,
      releaseDate: new Date("2020-03-20"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-2",
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      duration: 174,
      audioUrl: "/songs/Harry Styles - Watermelon Sugar (Official Video).mp3",
      imageUrl: "/cover-images/2.jpg",
      genre: "Pop",
      playCount: 1200000,
      likes: 38000,
      releaseDate: new Date("2019-12-13"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-3",
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: 203,
      audioUrl:
        "/songs/Dua Lipa - Levitating Featuring DaBaby (Official Music Video).mp3",
      imageUrl: "/cover-images/3.jpg",
      genre: "Pop",
      playCount: 980000,
      likes: 32000,
      releaseDate: new Date("2020-03-27"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-4",
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: 178,
      audioUrl: "/songs/Olivia Rodrigo - good 4 u (Official Video).mp3",
      imageUrl: "/cover-images/4.jpg",
      genre: "Pop",
      playCount: 850000,
      likes: 28000,
      releaseDate: new Date("2021-05-14"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-5",
      title: "Stay",
      artist: "The Kid LAROI & Justin Bieber",
      album: "F*CK LOVE 3: OVER YOU",
      duration: 141,
      audioUrl:
        "/songs/The Kid LAROI, Justin Bieber - STAY (Official Video).mp3",
      imageUrl: "/cover-images/5.jpg",
      genre: "Hip-Hop",
      playCount: 750000,
      likes: 25000,
      releaseDate: new Date("2021-07-09"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-6",
      title: "Shivers",
      artist: "Ed Sheeran",
      album: "= (Equals)",
      duration: 207,
      audioUrl: "/songs/Ed Sheeran - Shivers [Official Video].mp3",
      imageUrl: "/cover-images/6.jpg",
      genre: "Pop",
      playCount: 680000,
      likes: 22000,
      releaseDate: new Date("2021-09-10"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-7",
      title: "Easy On Me",
      artist: "Adele",
      album: "30",
      duration: 225,
      audioUrl: "/songs/7.mp3",
      imageUrl: "/cover-images/7.jpg",
      genre: "Pop",
      playCount: 920000,
      likes: 35000,
      releaseDate: new Date("2021-10-15"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-8",
      title: "We Don't Talk About Bruno",
      artist: "Carolina Gaitán, Mauro Castillo",
      album: "Encanto (Original Motion Picture Soundtrack)",
      duration: 189,
      audioUrl: "/songs/8.mp3",
      imageUrl: "/cover-images/8.jpg",
      genre: "Other",
      playCount: 1100000,
      likes: 42000,
      releaseDate: new Date("2021-11-19"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-9",
      title: "As It Was",
      artist: "Harry Styles",
      album: "Harry's House",
      duration: 167,
      audioUrl: "/songs/9.mp3",
      imageUrl: "/cover-images/9.jpg",
      genre: "Pop",
      playCount: 1350000,
      likes: 48000,
      releaseDate: new Date("2022-03-31"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-10",
      title: "About Damn Time",
      artist: "Lizzo",
      album: "Special",
      duration: 191,
      audioUrl: "/songs/10.mp3",
      imageUrl: "/cover-images/10.jpg",
      genre: "Pop",
      playCount: 720000,
      likes: 24000,
      releaseDate: new Date("2022-04-14"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-11",
      title: "Late Night Talking",
      artist: "Harry Styles",
      album: "Harry's House",
      duration: 178,
      audioUrl: "/songs/11.mp3",
      imageUrl: "/cover-images/11.jpg",
      genre: "Pop",
      playCount: 650000,
      likes: 21000,
      releaseDate: new Date("2022-05-20"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-12",
      title: "Hold Me Closer",
      artist: "Elton John & Britney Spears",
      album: "The Lockdown Sessions",
      duration: 203,
      audioUrl: "/songs/12.mp3",
      imageUrl: "/cover-images/12.jpg",
      genre: "Pop",
      playCount: 580000,
      likes: 19000,
      releaseDate: new Date("2022-08-26"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-13",
      title: "Unholy",
      artist: "Sam Smith & Kim Petras",
      album: "Gloria",
      duration: 156,
      audioUrl: "/songs/13.mp3",
      imageUrl: "/cover-images/13.jpg",
      genre: "Pop",
      playCount: 890000,
      likes: 31000,
      releaseDate: new Date("2022-09-22"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-14",
      title: "Lift Me Up",
      artist: "Rihanna",
      album: "Black Panther: Wakanda Forever",
      duration: 190,
      audioUrl: "/songs/14.mp3",
      imageUrl: "/cover-images/14.jpg",
      genre: "R&B",
      playCount: 780000,
      likes: 27000,
      releaseDate: new Date("2022-10-28"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-15",
      title: "Anti-Hero",
      artist: "Taylor Swift",
      album: "Midnights",
      duration: 200,
      audioUrl: "/songs/15.mp3",
      imageUrl: "/cover-images/15.jpg",
      genre: "Pop",
      playCount: 1100000,
      likes: 45000,
      releaseDate: new Date("2022-10-21"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-16",
      title: "Flowers",
      artist: "Miley Cyrus",
      album: "Endless Summer Vacation",
      duration: 200,
      audioUrl: "/songs/16.mp3",
      imageUrl: "/cover-images/16.jpg",
      genre: "Pop",
      playCount: 1200000,
      likes: 52000,
      releaseDate: new Date("2023-01-13"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-17",
      title: "Kill Bill",
      artist: "SZA",
      album: "SOS",
      duration: 153,
      audioUrl: "/songs/17.mp3",
      imageUrl: "/cover-images/17.jpg",
      genre: "R&B",
      playCount: 950000,
      likes: 38000,
      releaseDate: new Date("2022-12-09"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "public-18",
      title: "Last Night",
      artist: "Morgan Wallen",
      album: "One Thing at a Time",
      duration: 159,
      audioUrl: "/songs/18.mp3",
      imageUrl: "/cover-images/18.jpg",
      genre: "Country",
      playCount: 820000,
      likes: 29000,
      releaseDate: new Date("2023-02-03"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor() {}

  // Récupérer toutes les musiques publiques
  getPublicSongs(): Observable<Song[]> {
    return of(this.publicSongs);
  }

  // Récupérer les musiques populaires (premières 10)
  getPopularSongs(): Observable<Song[]> {
    return of(this.publicSongs.slice(0, 10));
  }

  // Récupérer les musiques par genre
  getSongsByGenre(genre: string): Observable<Song[]> {
    const filteredSongs = this.publicSongs.filter(
      (song) => song.genre === genre
    );
    return of(filteredSongs);
  }

  // Rechercher dans les musiques publiques
  searchPublicSongs(query: string): Observable<Song[]> {
    const searchTerm = query.toLowerCase();
    const filteredSongs = this.publicSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm) ||
        song.album.toLowerCase().includes(searchTerm)
    );
    return of(filteredSongs);
  }

  // Récupérer une musique par ID
  getSongById(id: string): Observable<Song | undefined> {
    const song = this.publicSongs.find((s) => s._id === id);
    return of(song);
  }
}

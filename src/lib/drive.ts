import { Project, ProjectType, Track } from '../types';

export async function scanCatalog(): Promise<Project[]> {
  // Since the user requested no Google Drive API and no authentication, 
  // we provide the Radio Lofi archive structure directly here.
  // In a real-world scenario without the Drive API, this JSON would
  // be generated during a static build step or hosted as a public catalog.json file.
  
  return [
    {
      id: "proj_1",
      title: "Midnight Broadcast",
      year: 2026,
      type: "Album",
      coverArtId: "", 
      tracks: [
        { id: "t1", title: "Signal Lost", driveFileId: "", trackNumber: 1 },
        { id: "t2", title: "Neon Static", driveFileId: "", trackNumber: 2 },
        { id: "t3", title: "Frequency", driveFileId: "", trackNumber: 3 },
        { id: "t4", title: "Late Night Drive", driveFileId: "", trackNumber: 4 },
        { id: "t5", title: "White Noise", driveFileId: "", trackNumber: 5 },
        { id: "t6", title: "End of Tape", driveFileId: "", trackNumber: 6 }
      ]
    },
    {
      id: "proj_2",
      title: "Urban Isolation EP",
      year: 2026,
      type: "EP",
      coverArtId: "",
      tracks: [
        { id: "t7", title: "City Lights", driveFileId: "", trackNumber: 1 },
        { id: "t8", title: "Rain on Window", driveFileId: "", trackNumber: 2 },
        { id: "t9", title: "Distant Sirens", driveFileId: "", trackNumber: 3 },
        { id: "t10", title: "Empty Streets", driveFileId: "", trackNumber: 4 },
        { id: "t10a", title: "Alleyway", driveFileId: "", trackNumber: 5 }
      ]
    },
    {
      id: "proj_3",
      title: "Analog Dreams",
      year: 2027,
      type: "Album",
      coverArtId: "",
      tracks: [
        { id: "t11", title: "Cassette Tape", driveFileId: "", trackNumber: 1 },
        { id: "t12", title: "Vinyl Dust", driveFileId: "", trackNumber: 2 },
        { id: "t13", title: "VCR Tracking", driveFileId: "", trackNumber: 3 },
        { id: "t14", title: "CRT Glow", driveFileId: "", trackNumber: 4 },
        { id: "t15", title: "Warped Record", driveFileId: "", trackNumber: 5 },
        { id: "t16", title: "Rewind", driveFileId: "", trackNumber: 6 }
      ]
    },
    {
      id: "proj_4",
      title: "Lo-Fi Study Beats",
      year: 2027,
      type: "Single",
      coverArtId: "",
      tracks: [
        { id: "t17", title: "Library Vibes", driveFileId: "", trackNumber: 1 }
      ]
    },
    {
       id: "proj_5",
       title: "Transmission Error",
       year: 2028,
       type: "Album",
       coverArtId: "",
       tracks: [
           { id: "t18", title: "Error 404", driveFileId: "", trackNumber: 1 },
           { id: "t19", title: "Server Down", driveFileId: "", trackNumber: 2 },
           { id: "t20", title: "Packet Loss", driveFileId: "", trackNumber: 3 },
           { id: "t21", title: "Ping Timeout", driveFileId: "", trackNumber: 4 },
           { id: "t22", title: "Reconnecting...", driveFileId: "", trackNumber: 5 },
           { id: "t23", title: "Connection Restored", driveFileId: "", trackNumber: 6 }
       ]
    },
    {
        id: "proj_6",
        title: "Coffee Shop Acoustics",
        year: 2029,
        type: "EP",
        coverArtId: "",
        tracks: [
            { id: "t24", title: "Espresso Machine", driveFileId: "", trackNumber: 1 },
            { id: "t25", title: "Rainy Cafe", driveFileId: "", trackNumber: 2 },
            { id: "t26", title: "Muted Conversations", driveFileId: "", trackNumber: 3 },
            { id: "t27", title: "Morning Brew", driveFileId: "", trackNumber: 4 }
        ]
    },
    {
        id: "proj_7",
        title: "Lost Frequencies",
        year: 2030,
        type: "Album",
        coverArtId: "",
        tracks: [
            { id: "t28", title: "Ghost in the Machine", driveFileId: "", trackNumber: 1 },
            { id: "t29", title: "Fading Voices", driveFileId: "", trackNumber: 2 },
            { id: "t30", title: "Echo Chamber", driveFileId: "", trackNumber: 3 },
            { id: "t31", title: "Static Memory", driveFileId: "", trackNumber: 4 },
            { id: "t32", title: "Forgotten Channel", driveFileId: "", trackNumber: 5 },
            { id: "t33", title: "Radio Silence", driveFileId: "", trackNumber: 6 }
        ]
    },
    {
        id: "proj_8",
        title: "Future Nostalgia",
        year: 2031,
        type: "Single",
        coverArtId: "",
        tracks: [
            { id: "t34", title: "Cyber Sunset", driveFileId: "", trackNumber: 1 }
        ]
    },
    {
        id: "proj_9",
        title: "Neon City EP",
        year: 2032,
        type: "EP",
        coverArtId: "",
        tracks: [
            { id: "t35", title: "Highway Drive", driveFileId: "", trackNumber: 1 },
            { id: "t36", title: "Night Market", driveFileId: "", trackNumber: 2 },
            { id: "t37", title: "Alleyway Shadows", driveFileId: "", trackNumber: 3 }
        ]
    }
  ];
}

export function getDriveImageUrl(fileId?: string) {
  if (!fileId || fileId === "") {
    return '/default-cover.png'; 
  }
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

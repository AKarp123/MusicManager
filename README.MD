# MusicManager

MusicManager is a simple and efficient tool for managing your music library. Allows for easy uploading, format conversion and file movement of your music files to a media server.

## Features

- Simple and easy directory upload
- Support for Hi Res Flac (24bit+ ) to 16bit/44.1kHz conversion
- Support for Flac to MP3 conversion
- Automatic ReplayGain calculation 
- Simple folder navigation

## Prerequisites
- Node.js
- MongoDB
- [FFmpeg](https://ffmpeg.org/download.html)
- [Rsgain](https://github.com/complexlogic/rsgain)

## Installation
- Ensure prereqs installed
- Clone Repo
- install node modules for both client and server
- in server .env add MONGODB_URI connection string, SESSION_SECRET secret and PORT number
- npm run build
- npm run start
- complete configuration on <ip>:port

### Todo
- Completely async processing and file movement (once you upload and choose folder it will auto process and everything, no need to wait till after process to move)
- Multi user support
- (Potential) better multithreading support when processing


Recommended for people using Navidrome/ subsonic media servers


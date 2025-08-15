# KetikMatic - AI Typing Simulator

KetikMatic adalah aplikasi web yang mensimulasikan pengetikan otomatis dari topik bebas dengan dua mode berbeda:

## Features

- **Mode SERIUS/TUGAS**: AI membuat esai lengkap di awal (panjang terkontrol), kemudian "mengetik" karakter demi karakter
- **Mode INFINITE**: Paragraf demi paragraf tanpa batas; selama user belum stop, AI terus menghasilkan konten
- **3 Mode Typing**: Per karakter, per kata, atau chunk acak (5-9 karakter)
- **Multi-bahasa**: Indonesia dan English dengan tone yang berbeda
- **Local Storage**: Otomatis menyimpan dan memulihkan session

## Teknologi

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: Google Gemini 2.5 Flash
- **Icons**: Lucide React

## Setup & Installation

### Prerequisites

- Node.js 18+
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone repository dan install dependencies:

```bash
npm install
```

2. Setup environment variables:

```bash
cp .env.example .env
```

Edit `.env` dan tambahkan Gemini API Key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

3. Install server dependencies:

```bash
cd server
npm install
```

### Running the Application

1. Start the backend server:

```bash
cd server
npm run dev
```

2. Start the frontend (in another terminal):

```bash
npm run dev
```

3. Open browser ke `http://localhost:5173`

## Usage

### Mode SERIUS/TUGAS

1. Masukkan topik yang ingin dibahas
2. Pilih bahasa (Indonesia/English)
3. Pilih nada (Netral/Formal/Santai/Persuasif/Naratif)
4. Pilih mode "SERIUS/TUGAS"
5. Pilih panjang (Ringkas ~250 kata, Sedang ~600 kata, Panjang ~1000 kata)
6. Klik "Mulai Mengetik"

### Mode INFINITE

1. Masukkan topik yang ingin dibahas
2. Pilih bahasa dan nada
3. Pilih mode "INFINITE"
4. Klik "Mulai Mengetik"

### Kontrol Typing

- **Mode Ketik**:
  - Per Karakter: Ketik satu karakter per waktu
  - Per Kata: Ketik satu kata per waktu
  - Chunk Acak: Ketik 5-9 karakter secara acak

## Project Structure

```
/
├── src/                     # React frontend
│   ├── components/          # UI components
│   │   ├── PreSettingsPanel.tsx
│   │   ├── DocTopBar.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── PaperEditor.tsx
│   │   ├── FooterActions.tsx
│   │   └── StatusBar.tsx
│   ├── lib/                 # Utilities & core logic
│   │   ├── typingEngine.ts  # Typing simulation logic
│   │   ├── api.ts           # API communication
│   │   ├── localStore.ts    # LocalStorage utilities
│   │   ├── textUtils.ts     # Text processing utilities
│   │   └── prompts.ts       # AI prompt builders
│   ├── types/               # TypeScript definitions
│   └── App.tsx             # Main application
├── server/                  # Express backend
│   ├── index.ts            # Express server
│   ├── gemini.ts           # Gemini API wrapper
│   └── prompts.ts          # Prompt building logic
└── README.md
```

## API Endpoints

- `POST /api/serious` - Generate complete essay for SERIOUS mode
- `POST /api/infinite` - Stream continuous content for INFINITE mode

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

MIT License - lihat file LICENSE untuk detail lengkap.

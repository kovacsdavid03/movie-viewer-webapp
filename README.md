# Movie Viewer Web Application

## Áttekintés

A **Movie Viewer Web Application** egy teljes körű webalkalmazás filmek böngészésére, kezelésére és ajánlására. Az alkalmazás React frontendet és Node.js/Express backendet használ, TypeScript-ben írva.

## Technológiai Stack

### Frontend
- **React 19.1.1** (TypeScript)
- **Material-UI (MUI)** - modern UI komponensek
- **React Router DOM** - navigáció
- **React Testing Library** - tesztelés

### Backend
- **Node.js** + **Express.js** (TypeScript)
- **Sequelize ORM** - adatbázis kezelés
- **SQL Server** - adatbázis
- **Jest** - tesztelés
- **bcrypt** - jelszó titkosítás

## Főbb Funkciók

### 🎬 Film Böngészés
- Filmek listázása és keresése
- Részletes film információk megtekintése
- Szűrés műfajok, évek és értékelések alapján
- Filmek információi: cast, crew, műfajok, kulcsszavak, gyártási adatok

### ⭐ Felhasználói Funkciók
- Regisztráció és bejelentkezés
- Kedvenc filmek kezelése
- Személyre szabott film ajánlások
- Felhasználói értékelések

### 📊 Admin Funkciók
- Film adatok importálása
- Adatbázis statisztikák
- Film adatok szerkesztése

## Projekt Struktúra

```
movie-viewer-webapp/
├── src/                          # React frontend
│   ├── components/              # Újrafelhasználható komponensek
│   ├── pages/                   # Oldal komponensek
│   └── App.tsx                  # Fő alkalmazás komponens
├── server/                      # Node.js backend
│   ├── src/
│   │   ├── models/             # Sequelize modellek
│   │   ├── routes/             # API endpoint-ok
│   │   ├── services/           # Üzleti logika
│   │   └── tests/              # Unit és integrációs tesztek
│   └── package.json
└── build/                      # Production build
```

### Adatbázis Modellek
- **User** - Felhasználók
- **Movie** - Filmek
- **Favorite** - Kedvenc filmek
- **Genre** - Műfajok
- **Cast** - Színészek
- **Crew** - Stáb tagok
- **Keyword** - Kulcsszavak
- **ProductionCompany** - Gyártó cégek

## Telepítés és Futtatás

### Előfeltételek
- Node.js 16+
- SQL Server
- npm vagy yarn

### Telepítés

1. **Repository klónozása:**
   ```bash
   git clone <repository-url>
   cd movie-viewer-webapp
   ```

2. **Frontend függőségek telepítése:**
   ```bash
   npm install
   ```

3. **Backend függőségek telepítése:**
   ```bash
   cd server
   npm install
   ```

4. **Környezeti változók beállítása:**
   Hozz létre egy `.env` fájlt a `server/` mappában:
   ```env
   PORT=5001
   DB_SERVER=your_sql_server
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   CORS_ORIGIN=http://localhost:3000
   ```

### Futtatás

1. **Backend indítása (development):**
   ```bash
   cd server
   npm run dev
   ```

2. **Frontend indítása:**
   ```bash
   npm start
   ```

3. **Alkalmazás elérése:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`

## API Endpoints

### Autentikáció
- `POST /api/auth/login` - Bejelentkezés
- `POST /api/auth/register` - Regisztráció

### Filmek
- `GET /api/movies` - Filmek listázása szűrőkkel
- `GET /api/movies/:id` - Film részletei
- `POST /api/movies/import` - Film importálás

### Kedvencek
- `GET /api/favorites/:userId` - Felhasználó kedvencei
- `POST /api/favorites` - Kedvenc hozzáadása
- `DELETE /api/favorites` - Kedvenc törlése

### Ajánlások
- `GET /api/recommendations/:userId` - Személyre szabott ajánlások

## Tesztelés

### Backend tesztek futtatása:
```bash
cd server
npm test                    # Egyszeri futtatás
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage riport
```

### Frontend tesztek futtatása:
```bash
npm test
```

## Production Build

```bash
# Frontend build
npm run build

# Backend build
cd server
npm run build
npm start
```

## Fejlesztői Megjegyzések

- Az alkalmazás proxy-t használ a frontend és backend közötti kommunikációhoz development módban
- Sequelize ORM automatikusan szinkronizálja az adatbázis sémát
- Material-UI témák és komponensek biztosítják a konzisztens dizájnt
- TypeScript strict mode használata a típusbiztonságért

## Licensz

Ez a projekt privát használatra készült.
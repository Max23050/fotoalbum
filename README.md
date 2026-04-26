# Fotoalbum

Full-stack web application for creating personal photo albums with authentication, nested album structure, image uploads, and public sharing links.

## Features

- User registration and login with JWT authentication
- Tree-based album structure with nested subalbums
- Photo upload to albums
- Photo rename and delete actions
- Album delete with recursive cleanup of subalbums and photos
- Public album access via shareable link
- React frontend and Express + MongoDB backend

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: Node.js, Express, Mongoose, Multer
- Database: MongoDB
- Auth: JWT

## Project Structure

```text
fotoalbum/
├── frontend/   # React application
├── backend/    # Express API + MongoDB models/routes
└── README.md
```

## Environment Variables

### Backend

Create `/backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017/fotoalbum
JWT_SECRET=your_secret_key
```

### Frontend

Create `/frontend/.env` if you want to override the default API URL:

```env
REACT_APP_API_URL=http://localhost:4000
```

If `REACT_APP_API_URL` is not set, the frontend uses `http://localhost:4000` by default.

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 2. Start backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:4000`.

### 3. Start frontend

```bash
cd frontend
npm start
```

Frontend usually runs on `http://localhost:3000`.

## Main Routes

### Frontend

- `/login` - login page
- `/register` - registration page
- `/tree` - album tree view
- `/albums/:id` - album detail page
- `/public/:id` - public album page

### Backend API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/albums`
- `GET /api/albums/tree`
- `POST /api/albums`
- `DELETE /api/albums/:id`
- `POST /api/photos`
- `GET /api/photos/:albumId`
- `PUT /api/photos/:id`
- `DELETE /api/photos/:id`

## Notes

- Uploaded images are stored in `/backend/uploads`
- `node_modules`, `.env`, and uploaded files should not be committed
- MongoDB must be running before starting the backend

## Author

Maksym Taran

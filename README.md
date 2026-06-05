#  FILMERA Backend API 🎬

Movie matching platform where friends swipe movies together and get matches in real time.

## Live Demo

🔗 https://filmera.us/

## Backend API

🔗 https://filmera-backend.onrender.com

This repository contains the backend API responsible for:

- user authentication and authorization
- room management
- swipe system foundation
- movie data integration through TMDB API
- MongoDB database management

The backend is built with Node.js, Express, MongoDB Atlas, and JWT authentication.

🚀 Features

🔐 Authentication & Authorization

- User registration
- User login
- JWT authentication
- Protected routes with auth middleware
- Bearer Token authorization
- Password hashing with bcrypt
- 7-day JWT expiration

Authentication Endpoints:
POST /signup
POST /signin
POST /forgot-password
POST /reset-password

👤 User Management

User Endpoints:
GET /users/me
GET /users/:userId
PATCH /users/me

Validation

Request validation implemented with celebrate + Joi:

- email validation
- password validation
- name validation
- separate schemas for signup and signin

⸻

🎬 Room System

Users can create movie rooms and invite others to join shared movie sessions.

Features

- Create rooms
- Join rooms
- Store participants
- Save room filters
- Save selected movies
- Room status management

Room Endpoints:
POST /room
POST /room/:roomCode/join
GET /room/:roomCode/movies

🍿 Swipe System Foundation

Swipe functionality structure added for future movie matching logic.

Features

- Swipe tracking
- Movie filtering
- Disliked movie filtering
- Available movie retrieval per room

🎥 TMDB API Integration

Movie data is fetched securely through the backend using TMDB API.

The frontend does not communicate directly with TMDB.

Features

- Movie discovery route
- Genre filtering
- Year filtering
- Sorting support
- Formatted movie responses

Movies Endpoint:
GET /movies

🗄️ Database

MongoDB Atlas is used as the primary database with Mongoose ODM.

Collections

- users
- rooms
- swipes

🛠️ Middleware & Utilities

- Express JSON middleware
- Global auth middleware
- Centralized error handling
- CORS configuration
- dotenv environment support

🧰 Tech Stack

Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

Authentication & Security

- JWT
- bcrypt

Validation

- celebrate
- Joi

Utilities

- dotenv
- CORS

Password Reset Email

SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
SMTP_FROM
FRONTEND_URL

External API

- TMDB API

Deployment

- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas

🧪 API Testing

The API was tested using Postman.

Tested Features

- user signup/login
- protected routes
- room creation
- room join flow
- TMDB movie retrieval
- Bearer token authorization

🔒 Security Notes

- TMDB token is stored securely in environment variables
- JWT authentication protects private routes
- Passwords are hashed before storage
- Frontend consumes backend movie routes instead of exposing TMDB credentials

📌 Future Improvements

- Real-time room updates
- Movie match detection
- Socket.IO integration
- Multi-user swipe synchronization
- Match history
- Recommendation system

👩‍💻 Author

Gisela Lucena

- GitHub: https://github.com/gisela-lucena
- LinkedIn: https://linkedin.com/in/giselaelia

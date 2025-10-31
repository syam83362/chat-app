# Real-Time Chat Application

A modern, full-stack real-time chat application built with **FastAPI**, **WebSockets**, **PostgreSQL**, and **React**. This project demonstrates real-time communication, user authentication, and modern web development practices.

## 🚀 Features

### Backend (FastAPI)
- **Real-time WebSocket communication** for instant messaging
- **JWT-based authentication** with secure user management
- **PostgreSQL database** with SQLAlchemy ORM
- **RESTful API** for user and room management
- **Room-based chat system** with public/private rooms
- **Message persistence** and history
- **User presence tracking** (online/offline status)
- **Typing indicators** for enhanced UX
- **CORS support** for frontend integration

### Frontend (React)
- **Modern React 18** with hooks and context
- **Real-time WebSocket integration** for instant messaging
- **Responsive design** with styled-components
- **User authentication** (login/register)
- **Room management** (create, join, leave rooms)
- **Live typing indicators** and user presence
- **Message history** with timestamps
- **Clean, intuitive UI** with professional styling

### Infrastructure
- **Docker containerization** for easy deployment
- **PostgreSQL database** with persistent storage
- **Redis support** for caching and session management
- **Production-ready configuration**

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **WebSockets** - Real-time bidirectional communication
- **SQLAlchemy** - Python SQL toolkit and ORM
- **PostgreSQL** - Robust, open-source relational database
- **JWT** - JSON Web Tokens for authentication
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI server for FastAPI

### Frontend
- **React 18** - JavaScript library for building user interfaces
- **React Router** - Declarative routing for React
- **Styled Components** - CSS-in-JS styling solution
- **Axios** - HTTP client for API requests
- **React Icons** - Popular icons as React components

### DevOps
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container Docker applications
- **PostgreSQL** - Database container
- **Redis** - In-memory data structure store

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Docker & Docker Compose** (recommended)
- **PostgreSQL** (if not using Docker)

## 🚀 Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-time-chat-app
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🛠️ Manual Setup

### Backend Setup

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb chat_app
   
   # Update DATABASE_URL in .env
   DATABASE_URL=postgresql://username:password@localhost:5432/chat_app
   ```

5. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Room Endpoints

- `GET /rooms/` - Get user's rooms
- `POST /rooms/` - Create new room
- `GET /rooms/{room_id}` - Get room details
- `POST /rooms/{room_id}/join` - Join room
- `DELETE /rooms/{room_id}/leave` - Leave room

### Message Endpoints

- `GET /messages/room/{room_id}` - Get room messages
- `POST /messages/` - Send message

### WebSocket Endpoint

- `WS /ws/{room_id}?token={jwt_token}` - Real-time chat connection

## 🏗️ Project Structure

```
real-time-chat-app/
├── app/                          # Backend application
│   ├── __init__.py
│   ├── main.py                   # FastAPI application
│   ├── config.py                 # Configuration settings
│   ├── database.py               # Database configuration
│   ├── models.py                 # SQLAlchemy models
│   ├── schemas.py                # Pydantic schemas
│   ├── auth.py                   # Authentication utilities
│   ├── websocket_manager.py      # WebSocket connection manager
│   └── routers/                  # API route handlers
│       ├── __init__.py
│       ├── auth.py               # Authentication routes
│       ├── rooms.py              # Room management routes
│       └── messages.py           # Message routes
├── frontend/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Chat.js
│   │   │   ├── ChatRoom.js
│   │   │   ├── Sidebar.js
│   │   │   └── CreateRoomModal.js
│   │   ├── contexts/             # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── ChatContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── docker-compose.yml            # Docker Compose configuration
├── Dockerfile                    # Docker configuration
├── requirements.txt              # Python dependencies
├── env.example                   # Environment variables template
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/chat_app
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
```

### Database Schema

The application uses the following main entities:

- **Users**: User accounts with authentication
- **Rooms**: Chat rooms (public/private)
- **Messages**: Chat messages with timestamps
- **RoomMemberships**: User-room relationships

## 🚀 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Use production database** (not SQLite)
3. **Set secure SECRET_KEY**
4. **Configure CORS** for your domain
5. **Use HTTPS** for WebSocket connections

### Docker Production

```bash
# Build production image
docker build -t chat-app .

# Run with production settings
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e SECRET_KEY=your-secret-key \
  chat-app
```

## 🧪 Testing

### Backend Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance Considerations

- **Database indexing** on frequently queried fields
- **WebSocket connection pooling** for multiple users
- **Message pagination** for large chat histories
- **Redis caching** for frequently accessed data
- **CDN** for static frontend assets

## 🔒 Security Features

- **JWT token authentication** with expiration
- **Password hashing** using bcrypt
- **CORS protection** for API endpoints
- **Input validation** using Pydantic
- **SQL injection prevention** with SQLAlchemy ORM
- **WebSocket authentication** via JWT tokens

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** team for the excellent web framework
- **React** team for the powerful UI library
- **PostgreSQL** community for the robust database
- **Docker** team for containerization platform

## 📞 Support

If you have any questions or need help with the application, please:

1. Check the [API documentation](http://localhost:8000/docs)
2. Review the [Issues](https://github.com/your-repo/issues) page
3. Create a new issue with detailed information

---

**Built with ❤️ for modern web development**

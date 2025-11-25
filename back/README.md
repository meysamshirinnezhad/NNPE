# NPPE API - Go Backend

A comprehensive REST API for the NPPE (National Professional Practice Examination) exam preparation platform built with Go, Gin, PostgreSQL, and Redis.

## 🏗️ Architecture

### Tech Stack
- **Language**: Go 1.21+
- **Web Framework**: Gin
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **ORM**: GORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

### Project Structure
```
back/
├── cmd/
│   └── api/              # Main application entry point
├── internal/
│   ├── handlers/         # HTTP request handlers
│   └── models/           # Database models
├── pkg/
│   ├── database/         # Database connections
│   ├── jwt/              # JWT authentication
│   └── middleware/       # HTTP middlewares
├── config/               # Configuration management
├── migrations/           # SQL migrations (if needed)
├── .env.example          # Example environment variables
├── docker-compose.yml    # Docker compose configuration
├── Dockerfile            # Docker build configuration
└── go.mod                # Go module dependencies
```

## 🚀 Getting Started

### Prerequisites
- Go 1.21 or higher
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
```bash
cd back
```

2. **Install dependencies**
```bash
go mod download
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run with Docker Compose (Recommended)**
```bash
docker-compose up -d
```

This will start:
- API server on `http://localhost:8080`
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Adminer (database UI) on `http://localhost:8081`

5. **Or run locally**
```bash
# Make sure PostgreSQL and Redis are running
go run cmd/api/main.go
```

### Database Setup

The application will automatically:
- Create database tables (auto-migration)
- Set up indexes for performance
- Enable PostgreSQL extensions

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `GET /api/v1/auth/verify/:token` - Verify email
- `GET /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/google/callback` - Google OAuth callback

### User Management
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `DELETE /api/v1/users/me` - Delete account
- `POST /api/v1/users/me/avatar` - Upload avatar
- `GET /api/v1/users/me/bookmarks` - Get bookmarked questions
- `GET /api/v1/users/me/practice-tests` - Get test history
- `GET /api/v1/users/me/study-path` - Get study path
- `GET /api/v1/users/me/dashboard` - Get dashboard statistics
- `GET /api/v1/users/me/analytics` - Get performance analytics
- `GET /api/v1/users/me/weaknesses` - Get weakness report

### Questions
- `GET /api/v1/questions` - List questions (with filters)
- `GET /api/v1/questions/:id` - Get single question
- `POST /api/v1/questions/:id/answer` - Submit answer
- `POST /api/v1/questions/:id/bookmark` - Bookmark question
- `DELETE /api/v1/questions/:id/bookmark` - Remove bookmark

### Topics
- `GET /api/v1/topics` - List all topics
- `GET /api/v1/topics/:id` - Get single topic

### Practice Tests
- `POST /api/v1/practice-tests` - Start new test
- `GET /api/v1/practice-tests/:id` - Get test details
- `POST /api/v1/practice-tests/:id/questions/:position/answer` - Submit answer
- `POST /api/v1/practice-tests/:id/complete` - Complete test
- `GET /api/v1/practice-tests/:id/review` - Review test results

### Subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `GET /api/v1/subscriptions/current` - Get current subscription
- `DELETE /api/v1/subscriptions/current` - Cancel subscription

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/users/me/notification-settings` - Update settings

### Admin Endpoints (Requires admin role)
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/statistics` - Platform statistics
- `POST /api/v1/admin/questions` - Create question
- `PUT /api/v1/admin/questions/:id` - Update question
- `DELETE /api/v1/admin/questions/:id` - Delete question

### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe webhook handler

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token expiration:
- Access Token: 1 hour
- Refresh Token: 7 days

## 📊 Database Models

### Core Models
- **User** - User accounts and profiles
- **UserStats** - User statistics and progress
- **Topic** - Exam topics
- **SubTopic** - Topic subdivisions
- **Question** - Question bank
- **QuestionOption** - Multiple choice options
- **UserAnswer** - User's submitted answers
- **PracticeTest** - Practice test sessions
- **PracticeTestQuestion** - Questions in tests
- **Subscription** - User subscriptions
- **Payment** - Payment records
- **StudyPath** - Study paths
- **Module** - Learning modules
- **UserModuleProgress** - Module completion tracking
- **Notification** - User notifications
- **ForumPost** - Community forum posts
- **StudyGroup** - Study groups

## 🧪 Testing

```bash
# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/handlers
```

## 🔧 Configuration

Key environment variables:

```env
# Server
PORT=8080
APP_ENV=development

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/nppe

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Frontend
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

# External Services (optional)
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG....
AWS_ACCESS_KEY_ID=...
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Access database
docker-compose exec db psql -U nppe -d nppe
```

## 📝 Development

### Code Structure Guidelines
- **handlers/** - HTTP request handlers, input validation
- **models/** - Database models and relationships
- **pkg/** - Reusable packages and utilities
- **config/** - Configuration management

### Adding New Endpoints
1. Define model in `internal/models/`
2. Create handler in `internal/handlers/`
3. Add route in `cmd/api/main.go`
4. Update Swagger documentation

### Database Migrations
The application uses GORM's auto-migration feature. Models are automatically migrated on startup.

## 🚨 Error Handling

The API returns errors in JSON format:
```json
{
  "error": "Error message here"
}
```

Common status codes:
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

## 📈 Performance

- Database connection pooling configured
- Redis caching for frequent queries
- Indexed database columns for fast lookups
- JWT tokens stored in Redis for quick validation

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS middleware
- Rate limiting (TODO)
- Input validation
- SQL injection prevention (parameterized queries)

## 📚 Additional Resources

- [Go Documentation](https://go.dev/doc/)
- [Gin Framework](https://gin-gonic.com/)
- [GORM](https://gorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software for NPPE Pro.

## 👥 Support

For support, email support@nppepro.com or create an issue in the repository.
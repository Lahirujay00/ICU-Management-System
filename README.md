# ICU Management System

A comprehensive ICU management system with separate backend and frontend applications.

## Project Structure

```
icu-management-system/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration files
│   │   └── app.js          # Main application file
│   ├── package.json
│   ├── env.example
│   └── .env
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utility functions
│   │   └── styles/         # CSS files
│   ├── public/             # Static assets
│   ├── package.json
│   ├── env.example
│   └── .env.local
├── env.example              # Root environment variables
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/icu_management
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://icu-management-system.vercel.app/api
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Features

- Patient Management
- Staff Management
- Equipment Management
- Real-time Monitoring
- Authentication & Authorization
- Responsive Dashboard

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- NextAuth.js
- Recharts for data visualization
- Framer Motion for animations

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run test        # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm start          # Start production server
npm run lint       # Run linting
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create new staff member
- `GET /api/staff/:id` - Get staff by ID
- `PUT /api/staff/:id` - Update staff member

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Add new equipment
- `GET /api/equipment/:id` - Get equipment by ID
- `PUT /api/equipment/:id` - Update equipment

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/alerts` - Get alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License



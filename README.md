# Library Room Booking System

A full-stack library room booking system with queue-based slot booking, admin approval workflow, and real-time status tracking.

## Features

- **Queue-based Booking**: Multiple users can request the same time slot, forming a queue
- **Admin Dashboard**: Separate admin interface for managing bookings
- **Status Workflow**: Slots transition from `available` → `pending` → `confirmed`
- **Duplicate Prevention**: System prevents users from booking the same slot twice
- **No Authentication Required**: Simple, accessible booking system
- **Real-time Updates**: Live status updates for all bookings

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Project Structure

```
libraryBookingSystem/
├── Server.js                 # Main server entry point
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── config/
│   └── database.js        # Database connection configuration
├── database/
│   ├── librarybookingsystem.db    # SQLite database file
│   └── librarybookingsystem.sql   # Database schema
├── routes/
│   ├── admin.js           # Admin operations (confirm/cancel)
│   ├── bookings.js        # Booking CRUD operations
│   ├── rooms.js          # Room management
│   ├── users.js          # User management
│   └── testdb.js         # Database test routes
└── public/
    ├── LibraryBookingSystem.html    # User-facing booking interface
    └── LibraryBookingAdmin.html     # Admin dashboard interface
```

## API Endpoints

### User Booking Endpoints
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update a booking
- `DELETE /api/bookings/:id` - Cancel a booking

### Admin Endpoints
- `GET /api/admin/bookings` - Get all bookings for admin review
- `PUT /api/admin/bookings/:id/confirm` - Confirm a pending booking
- `PUT /api/admin/bookings/:id/cancel` - Cancel a booking

### Room Management
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id/slots` - Get available time slots for a room

### System Endpoints
- `GET /api/health` - Health check
- `GET /api/test` - Simple test endpoint
- `GET /api/testdb` - Database connectivity test

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd libraryBookingSystem
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy .env file and update if needed
   # Default configuration is in .env file
   ```

4. **Initialize the database**
   ```bash
   # The SQLite database will be automatically created
   # Database file: database/librarybookingsystem.db
   ```

### Running the Application

1. **Start the server**
   ```bash
   # Development mode with auto-restart
   npx nodemon Server.js

   # Or run directly
   node Server.js
   ```

2. **Access the application**
   - User Interface: http://localhost:5000
   - Admin Interface: http://localhost:5000/admin
   - API Base URL: http://localhost:5000/api

### Development

For development with auto-restart:
```bash
npm run dev
```

## Configuration

### Environment Variables (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=librarybookingsystem

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### Database Configuration

The application uses SQLite with the following setup:
- **Database File**: `./database/librarybookingsystem.db`
- **Foreign Keys**: Enabled
- **Schema**: See `database/librarybookingsystem.sql`

## Booking Flow

1. **User Interface** (`/` or `/index.html`)
   - Users browse available rooms and time slots
   - Submit booking requests (status: pending)
   - View their booking history
   - Cancel pending bookings

2. **Admin Interface** (`/admin`)
   - View all pending bookings in queue
   - Confirm or cancel bookings
   - Manage room availability
   - View booking analytics

3. **Status Workflow**
   - `available`: Slot is open for booking
   - `pending`: User requested, awaiting admin approval
   - `confirmed`: Admin approved, slot is reserved

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Request body parsing and validation
- **Error Handling**: Centralized error handling middleware

## CORS Configuration

The server allows requests from:
- http://localhost:3000
- http://localhost:5500
- http://127.0.0.1:5500

Update CORS settings in `Server.js` for production deployment.

## Troubleshooting

### Database Connection Issues
- Ensure the `database/` directory exists
- Check SQLite file permissions
- Verify database schema is initialized

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3000
```

### CORS Errors
- Verify CORS origin settings in `Server.js`
- Ensure frontend is served from allowed origin

## Future Enhancements

- User authentication system
- Email notifications for booking status
- Recurring bookings
- Calendar integration
- Mobile responsive design
- Real-time updates with WebSockets

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

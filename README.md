# Advanced Real-Time Wallet System

A comprehensive wallet system built with React (frontend) and Laravel (backend) featuring real-time updates, multiple wallets, scheduled transfers, and advanced admin controls.

## 🚀 Features

### Core Features
- ✅ User Registration & Login with JWT Authentication
- ✅ Main Wallet with Multiple Sub-Wallets Support
- ✅ Real-time Balance Updates via WebSocket
- ✅ Transfer between Main ↔ Sub Wallets
- ✅ Deposit via Razorpay Integration
- ✅ Withdrawal to Bank Accounts
- ✅ Complete Transaction History
- ✅ Transaction Export to CSV

### Advanced Features
- 🔥 Wallet Freeze/Unfreeze Functionality
- 🔥 Admin Dashboard with User Management
- 🔥 Wallet Limits (Daily, Monthly, Per-Transaction)
- 🔥 Scheduled Transfers (Daily, Weekly, Monthly, Yearly, Once)
- 🔥 Razorpay Webhook Verification
- 🔥 Wallet Analytics with Charts
- 🔥 Real-time Notifications

## 🛠️ Technology Stack

### Frontend
- React 19.2.0
- React Router DOM
- Bootstrap 5
- Bootstrap Icons
- Socket.io Client
- Axios
- React Toastify
- Chart.js
- Date-fns

### Backend
- Laravel 12.0
- PHP 8.2+
- SQLite Database
- Laravel Sanctum (Authentication)
- Razorpay (Payment Gateway)
- Pusher (WebSocket/Real-time)

## 📋 Prerequisites

- Node.js 18+ 
- PHP 8.2+
- Composer
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd wallet_system
```

### 2. Backend Setup

```bash
cd backend_wallet

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed database with test users
php artisan db:seed --class=AdminSeeder

# Start Laravel server
php artisan serve --host=0.0.0.0 --port=8000
```

### 3. Frontend Setup

```bash
cd frontend_wallet

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000

### 5. Test Accounts

After running the seeder, you can use these accounts:

**Admin Account:**
- Email: `admin@wallet.com`
- Password: `password`

**User Account:**
- Email: `user@wallet.com`
- Password: `password`

## ⚙️ Configuration

### Razorpay Setup

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay dashboard
3. Update your `.env` file:

```env
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Pusher Setup (for WebSocket)

1. Create a free account at [https://pusher.com](https://pusher.com)
2. Create a new app and get your credentials
3. Update your `.env` file:

```env
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_key
PUSHER_APP_SECRET=your_pusher_secret
PUSHER_APP_CLUSTER=mt1
```

## 📁 Project Structure

```
wallet_system/
├── backend_wallet/          # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Events/
│   │   └── Console/Commands/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
└── frontend_wallet/         # React Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Wallet/
    │   │   ├── Transaction/
    │   │   ├── Transfer/
    │   │   ├── Deposit/
    │   │   ├── Withdraw/
    │   │   ├── Scheduled/
    │   │   └── Analytics/
    │   └── App.jsx
    └── package.json
```

## 🔧 Available Commands

### Backend Commands

```bash
# Execute scheduled transfers
php artisan scheduled:execute

# Clear cache
php artisan cache:clear

# Clear config cache
php artisan config:clear

# View routes
php artisan route:list
```

### Frontend Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## 📊 API Endpoints

### Authentication
- `POST /api/register` - User Registration
- `POST /api/login` - User Login
- `POST /api/logout` - User Logout
- `GET /api/profile` - Get User Profile

### Wallets
- `GET /api/wallets` - Get User Wallets
- `POST /api/wallets` - Create New Wallet
- `POST /api/wallets/{id}/freeze` - Freeze/Unfreeze Wallet

### Transactions
- `GET /api/transactions` - Get Transaction History
- `POST /api/transactions` - Create Transaction
- `GET /api/transactions/export` - Export to CSV

### Transfers
- `POST /api/transfer` - Transfer Funds

### Deposits
- `POST /api/deposit/create-order` - Create Razorpay Order
- `POST /api/deposit/verify` - Verify Payment

### Withdrawals
- `POST /api/withdraw` - Withdraw Funds

### Scheduled Transfers
- `GET /api/scheduled-transfers` - Get Scheduled Transfers
- `POST /api/scheduled-transfers` - Create Scheduled Transfer
- `PUT /api/scheduled-transfers/{id}` - Update Scheduled Transfer
- `DELETE /api/scheduled-transfers/{id}` - Delete Scheduled Transfer

### Admin Routes
- `GET /api/admin/users` - Get All Users
- `GET /api/admin/wallets` - Get All Wallets
- `GET /api/admin/transactions` - Get All Transactions
- `POST /api/admin/wallets/{id}/freeze` - Admin Freeze Wallet

## 🔔 Real-time Features

The system uses WebSocket connections to provide real-time updates:

- **Balance Updates**: Instant balance updates when transactions occur
- **New Transactions**: Real-time transaction notifications
- **Admin Actions**: Live updates when admin performs actions

## 📈 Analytics Dashboard

The analytics dashboard provides:

- Transaction type breakdown (Pie Chart)
- Last 7 days activity (Bar Chart)
- Wallet balance distribution (Bar Chart)
- Monthly trends (Line Chart)
- Detailed statistics and summaries

## 🛡️ Security Features

- JWT Authentication with Laravel Sanctum
- Role-based access control (User/Admin)
- Wallet freeze functionality
- Transaction limits and validation
- Razorpay webhook signature verification
- Input validation and sanitization

## 🔄 Scheduled Transfers

Support for automated transfers with:

- **Frequency Options**: Daily, Weekly, Monthly, Yearly, Once
- **Flexible Scheduling**: Set specific date and time
- **Auto-execution**: Command to process due transfers
- **Management**: Activate/deactivate, edit, delete scheduled transfers

## 📝 Notes

- The system uses SQLite for development but can be easily configured for MySQL/PostgreSQL
- WebSocket implementation uses Pusher for real-time features
- Razorpay integration supports Indian payment methods
- All transactions are logged with complete audit trail
- Admin can manage all users and wallets from the admin dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed description
4. Include error logs and screenshots if applicable

---

**Happy Coding! 🚀**

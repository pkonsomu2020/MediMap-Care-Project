# 🏥 MediMap Care - Find Healthcare Near You

> **Making healthcare accessible and efficient for everyone in Kenya and beyond.**

MediMap Care is a comprehensive healthcare platform that connects patients with verified medical facilities through location-based services, instant appointment booking, and transparent reviews. Built with modern web technologies and designed for the Kenyan healthcare ecosystem.

## 🎯 **Project Overview**

### **Mission Statement**
To revolutionize healthcare access by providing a seamless digital platform that connects patients with quality healthcare providers, eliminating barriers of distance, time, and information.

### **Problem We Solve**
- **Limited Healthcare Access**: Difficulty finding nearby, affordable clinics
- **Manual Booking Processes**: Time-consuming appointment scheduling
- **Lack of Transparency**: Limited visibility into clinic quality and availability
- **Geographic Barriers**: Healthcare deserts in rural and underserved areas

### **Our Solution**
A comprehensive digital health platform featuring:
- 🗺️ **Interactive Maps** with real-time clinic locations using Google Maps
- 📅 **Instant Appointment Booking** with confirmation notifications
- ⭐ **Verified Reviews** and ratings system
- 🔍 **Advanced Search** by specialty, location, and availability
- 📱 **Mobile-First Design** for accessibility anywhere

## ✨ **Key Features**

### **🗺️ Location-Based Discovery**
- **Real-time Geolocation**: Automatic detection of user location
- **Interactive Maps**: Google Maps integration with custom styling
- **Radius Search**: Find clinics within specified distance
- **Kenya Coverage**: Comprehensive coverage of major cities and towns

### **📅 Appointment Management**
- **Instant Booking**: Real-time availability checking
- **Multiple Appointment Types**: In-person and video consultations
- **Smart Scheduling**: Conflict detection and rescheduling
- **Notification System**: Email and SMS confirmations

### **⭐ Review & Rating System**
- **Verified Reviews**: Authentic patient feedback
- **Star Ratings**: 5-star rating system
- **Specialty Reviews**: Detailed feedback by medical specialty
- **Community Validation**: Peer-reviewed clinic information

### **🔍 Advanced Search & Filtering**
- **Specialty Search**: General Practice, Pediatrics, Cardiology, etc.
- **Availability Filters**: Open now, Today, This week
- **Distance Controls**: Customizable search radius
- **Price Range**: Consultation fee filtering

### **👤 User Management**
- **Dual Registration**: Patients and Clinics
- **Profile Management**: Comprehensive user profiles
- **Medical History**: Secure health information storage
- **Emergency Contacts**: Safety and accessibility features

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **@vis.gl/react-google-maps** - Google Maps React integration

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe backend development
- **Supabase** - PostgreSQL database and backend services
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Google Maps Services** - Places API integration

### **Mapping & Location**
- **Google Maps JavaScript API** - Interactive mapping
- **Google Places API** - Clinic data and search
- **HTML5 Geolocation** - User location detection
- **Google Maps URL Scheme** - Navigation integration

### **State Management**
- **TanStack Query** - Server state management
- **React Context** - Global state management
- **React Hook Form** - Form state and validation
- **Zod** - Schema validation

### **Development Tools**
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - Cross-browser compatibility
- **Concurrently** - Run multiple processes simultaneously

## 🏗️ **Project Structure**

```
medimap-care/
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── dashboard/ # Dashboard-specific components
│   │   │   ├── landing/   # Landing page components
│   │   │   ├── map/       # Map-related components
│   │   │   └── ui/        # Base UI components
│   │   ├── pages/         # Application pages
│   │   │   ├── dashboard/ # Dashboard pages
│   │   │   ├── Landing.tsx # Homepage
│   │   │   ├── Login.tsx   # Authentication
│   │   │   └── Signup.tsx  # User registration
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── config/        # Configuration files
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── backend/               # Express TypeScript backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic services
│   │   ├── config/        # Configuration (Supabase, env)
│   │   ├── middleware/    # Express middleware
│   │   ├── lib/           # Utility functions
│   │   └── app.ts         # Main application setup
│   ├── migrations/        # Database migrations
│   ├── seeding_scripts/   # Data seeding scripts
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
├── docs/                  # Documentation
│   ├── GAPS/              # Known gaps and risks
│   └── ...
├── shared/                # Shared types and interfaces
├── package.json           # Root workspace configuration
└── README.md              # Project documentation
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account and project
- Google Cloud Platform account with Maps API enabled
- Modern web browser with geolocation support

### **Installation**

```bash
# Clone the repository
git clone https://github.com/your-username/medimap-care.git

# Navigate to project directory
cd medimap-care

# Install all dependencies (frontend, backend, root)
npm install

# Set up environment variables (see Environment Setup below)

# Start both frontend and backend in development
npm run dev

# Or run them separately:
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

### **Environment Setup**

#### **Backend (.env)**
Create `backend/.env` file:
```env
NODE_ENV=development
PORT=8001
CORS_ORIGIN=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# SMS (optional)
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

#### **Frontend (.env)**
Create `frontend/.env` file:
```env
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_GOOGLE_MAPS_MAP_ID=your-map-id
VITE_API_BASE_URL=http://localhost:8001/api
```

### **Supabase Setup**

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your project URL and keys** from the project settings
3. **Run database migrations** (if any) in the Supabase SQL editor
4. **Set up authentication** (optional, for user management)

### **Google Maps Setup**

1. **Create a Google Cloud Project** at [console.cloud.google.com](https://console.cloud.google.com)
2. **Enable the following APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
3. **Create an API key** and restrict it to your domain
4. **Add the API key** to both backend and frontend .env files

### **Development Commands**

```bash
# Root level commands (run both services)
npm run dev              # Start frontend and backend concurrently
npm run build            # Build both frontend and backend
npm run start            # Start both in production mode
npm run lint             # Lint both projects

# Frontend commands
npm run dev:frontend     # Start frontend only (port 3000)
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run preview

# Backend commands
npm run dev:backend      # Start backend only (port 8001)
cd backend && npm run dev
cd backend && npm run build
cd backend && npm run test
```

## 🌍 **Kenya Healthcare Integration**

### **Geographic Coverage**
- **Primary Cities**: Nairobi, Mombasa, Kisumu, Nakuru, Eldoret
- **Rural Areas**: Major towns and healthcare facilities
- **Transportation**: Matatu routes and accessibility considerations
- **Languages**: English and Swahili support

### **Healthcare Ecosystem**
- **Public Hospitals**: Government health facilities
- **Private Clinics**: Licensed private healthcare providers
- **Specialized Care**: Cardiology, Pediatrics, Maternity
- **Emergency Services**: 24/7 emergency care facilities

## 📱 **Mobile-First Design**

### **Responsive Features**
- **Touch-Optimized**: Mobile-friendly interactions
- **Offline Support**: Basic functionality without internet
- **Progressive Web App**: Installable on mobile devices
- **Accessibility**: Screen reader and keyboard navigation

## 🔒 **Privacy & Security**

### **Data Protection**
- **Location Privacy**: Clear consent and data handling
- **Medical Data**: HIPAA-compliant information storage
- **Secure Communication**: HTTPS for all data transmission
- **User Consent**: Transparent data collection practices

## 🎨 **Design System**

### **Brand Identity**
- **Primary Color**: Medical Teal (#10B981)
- **Secondary Color**: Healthcare Green (#059669)
- **Accent Color**: Warm Coral (#F59E0B)
- **Typography**: Inter font family for readability

### **Visual Elements**
- **Custom Logo**: Medical cross with location pin
- **Gradient Themes**: Healthcare-focused color schemes
- **Smooth Animations**: Professional micro-interactions
- **Dark Mode**: Consistent theming across modes

## 🚀 **Deployment**

### **Production Deployment**
- **Vercel**: Frontend hosting and deployment
- **Netlify**: Alternative hosting platform
- **GitHub Pages**: Static site hosting
- **Custom Domain**: Professional domain integration

### **Environment Variables**
```env
VITE_APP_NAME=MediMap Care
VITE_APP_URL=https://medimapcare.com
VITE_GOOGLE_MAPS_API_KEY=your-production-api-key
VITE_GOOGLE_MAPS_MAP_ID=your-production-map-id
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 🤝 **Contributing**

We welcome contributions from the community! Please see our contributing guidelines for:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Contact & Support**

- **Website**: [medimapcare.com](https://medimapcare.com)
- **Email**: contact@medimapcare.com
- **Phone**: +254 700 000 000
- **Support**: Available 24/7 for healthcare emergencies

## 🙏 **Acknowledgments**

- **Google Maps Platform** for mapping and location services
- **Supabase** for database and backend services
- **Kenya Health Information System** for healthcare data
- **React** and **Vite** communities for excellent tooling

---

**Built with ❤️ for better healthcare access in Kenya and beyond.**

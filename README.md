# 🛒 Ecommerce Project

A full-featured **MERN e-commerce platform** with a customer storefront and a complete **admin dashboard**. It's built with **React 18, Redux Toolkit and Tailwind CSS** on the front end and **Node.js, Express and MongoDB (Mongoose)** on the back end, and it's ready to deploy on **Vercel**.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

---

## ✨ Features

### 🛍️ Storefront
- Home page with a hero slider, category grid, deals, new arrivals and promo banners
- Shop page with filters, infinite scroll and quick view
- **Simple and variable products** (attributes such as size and color, each variation with its own price and stock)
- Brands, categories, sub-categories and product labels
- **Cart**, mini-cart, **wishlist** and **product compare**
- Checkout with **coupon codes**
- **Order tracking** and downloadable **PDF invoices**
- Product **reviews and star ratings**
- About, Contact, FAQ, Help Center and Blog pages
- Mobile-friendly layout with a bottom navigation bar

### 👤 Customer Account
- Register, log in, **forgot password and reset password by email**
- Profile: personal info, saved addresses, orders, returns, reviews, wishlist and change password

### 🧑‍💼 Admin Dashboard
- Dashboard overview
- **Product management**: create, edit, view and delete products, with **CSV import/export**, SEO, shipping, inventory and video fields
- Categories, sub-categories, brands, attributes and product labels
- **Order management**: filters, stats, order details, create and edit orders, invoices
- **Coupon management**
- **Media library** with image uploads (Cloudinary)
- User management and roles (`customer`, `vendor`, `moderator`, `admin`)
- Review moderation, analytics and settings
- Homepage section builder and page settings

### 🔒 Backend
- Versioned REST API (`/api/v1`)
- **JWT authentication** with access and refresh tokens, plus password hashing with bcrypt
- Role-based route protection
- Email service with Nodemailer
- Input sanitization, request logging and central error handling

## 🛠 Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite, Redux Toolkit, React Router, Tailwind CSS, Axios, Embla Carousel, Lucide Icons, React Toastify, html2pdf.js |
| Backend  | Node.js, Express, Mongoose, JWT, bcryptjs, Multer, Cloudinary, Nodemailer, sanitize-html |
| Database | MongoDB |
| Tooling  | ESLint, Prettier, Nodemon, Concurrently |
| Deploy   | Vercel (frontend and backend) |

## 📁 Project Structure

```
Ecommerce-Project/
├── backend/
│   ├── api/                  # Vercel serverless entry
│   └── src/
│       ├── config/           # Database connection
│       ├── controllers/      # Route handlers
│       ├── middleware/       # Auth, error handler, logger
│       ├── models/           # Mongoose models
│       ├── routes/           # API routes (/api/v1/...)
│       ├── services/         # Auth, coupon, email services
│       ├── utils/            # JWT, stock, counter helpers
│       ├── validators/
│       └── server.js
├── frontend/
│   └── src/
│       ├── components/       # UI components (storefront and admin)
│       ├── pages/            # Route pages
│       ├── layouts/          # Admin layout
│       ├── routes/           # Public, protected and admin routes
│       ├── services/         # API clients
│       ├── store/            # Redux slices (auth, cart, wishlist, compare, reviews)
│       ├── context/ hooks/ utils/
│       └── main.jsx
└── package.json              # Root scripts (run both apps together)
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 20** (see `frontend/.nvmrc`)
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- *(Optional)* A Cloudinary account for image uploads and SMTP credentials for email

### 1. Clone and install
```bash
git clone https://github.com/SharifulSoft/Ecommerce-Project.git
cd Ecommerce-Project

npm install                      # root (concurrently)
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment variables

Create **`backend/.env`**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=your_database_name
FRONTEND_URL=http://localhost:5173

JWT_SECRET=your_jwt_secret
JWT_EXPIRY=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_USER=
EMAIL_PASSWORD=
```

Create **`frontend/.env`** (see `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=E-Commerce Store
VITE_APP_VERSION=1.0.0
```

### 3. Run the app
```bash
npm run dev            # starts backend and frontend together
```
- Frontend: **http://localhost:5173**
- API: **http://localhost:5000/api/v1**

### Useful scripts (from the project root)

| Command                 | Description                               |
|-------------------------|-------------------------------------------|
| `npm run dev`           | Run backend and frontend together         |
| `npm run dev:backend`   | Run the backend only (nodemon)            |
| `npm run dev:frontend`  | Run the frontend only (Vite)              |
| `npm run build`         | Build the frontend and lint the backend   |
| `npm run lint`          | Lint both apps                            |
| `npm run format`        | Format both apps with Prettier            |
| `npm start`             | Start the backend in production mode      |

## 📡 API Overview

All routes are prefixed with **`/api/v1`**:

| Resource        | Route              |
|-----------------|--------------------|
| Auth            | `/auth`            |
| Users           | `/users`           |
| Products        | `/products`        |
| Categories      | `/categories`      |
| Sub-categories  | `/sub-categories`  |
| Brands          | `/brands`          |
| Product labels  | `/product-labels`  |
| Attributes      | `/attributes`      |
| Variations      | `/variations`      |
| Media           | `/media`           |
| Cart            | `/cart`            |
| Checkout        | `/checkout`        |
| Orders          | `/orders`          |
| Coupons         | `/coupons`         |
| Reviews         | `/reviews`         |
| Home sections   | `/home-sections`   |
| Page settings   | `/page-settings`   |

## ☁️ Deployment

Both `frontend/` and `backend/` include a `vercel.json`, so each one can be deployed as its own Vercel project. Set the same environment variables in each Vercel project's settings, and point `VITE_API_URL` to your deployed backend URL.

## 👤 Author

**SharifulSoft**: [github.com/SharifulSoft](https://github.com/SharifulSoft)

⭐ If you find this project useful, please give it a star!

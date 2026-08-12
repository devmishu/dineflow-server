
---

````markdown
# Dineflow Server

This is a production-ready, scalable, and modular backend API built for the EJP-13 project. It uses a modern tech stack to ensure high performance and type safety.

## 🚀 Tech Stack

- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT, bcrypt
- **Middleware:** CORS, dotenv
````
```markdown
## 📂 Project Structure

server/
├── prisma/             # Prisma schema & migrations
├── src/
│   ├── routes/         # API Route definitions
│   ├── services/       # Business logic (User, Category, Product, etc.)
│   ├── lib/            # Utility functions & Database client
│   ├── app.ts          # Express configuration
│   └── server.ts       # Server entry point
├── .env                # Environment variables
├── package.json
└── tsconfig.json
```

## 🔐 API Documentation

### Base URL: `https://dineflow-server-inky.vercel.app/api`

### 1. Authentication

| Method | Endpoint    | Description              |
| ------ | ----------- | ------------------------ |
| POST   | `/register` | Register a new user      |
| POST   | `/login`    | User login (returns JWT) |

### 2. Category API

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| POST   | `/categories`     | Create a new category     |
| GET    | `/categories`     | Get all categories        |
| GET    | `/categories/:id` | Get single category by ID |
| PATCH  | `/categories/:id` | Update category details   |
| DELETE | `/categories/:id` | Soft delete category      |

### 3. Product API

| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| POST   | `/products`     | Create a new product     |
| GET    | `/products`     | Get all products         |
| GET    | `/products/:id` | Get single product by ID |
| PATCH  | `/products/:id` | Update product details   |
| DELETE | `/products/:id` | Soft delete product      |

### 4. Review API

| Method | Endpoint       | Description             |
| ------ | -------------- | ----------------------- |
| POST   | `/reviews`     | Create a new review     |
| GET    | `/reviews`     | Get all reviews         |
| GET    | `/reviews/:id` | Get single review by ID |

### 5. Order API

| Method | Endpoint      | Description            |
| ------ | ------------- | ---------------------- |
| POST   | `/orders`     | Create a new order     |
| GET    | `/orders`     | Get all orders         |
| GET    | `/orders/:id` | Get single order by ID |
| PATCH  | `/orders/:id` | Update order status    |
| DELETE | `/orders/:id` | Soft delete order      |

---

## 🏗 Database Design

The database is designed with **Prisma ORM** using PostgreSQL. Key features include:

- **Enums:** `UserRole`, `UserStatus`, `ProductStatus`, `OrderStatus`
- **Soft Delete:** Enabled via `isDeleted` boolean field across all models.
- **Indexing:** Optimized with `@@index` for high-frequency search fields.
- **Timestamps:** Automatic `createdAt` and `updatedAt` tracking.

## 📝 API Response Format

All APIs follow a consistent structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

```

## 🛠 Setup Instructions

1. **Clone the repository:**

```bash
git clone <your-repo-url>

```

2. **Install dependencies:**

```bash
npm install

```

3. **Setup environment variables:**
   Create a `.env` file and add your `DATABASE_URL` and `JWT_SECRET`.
4. **Push Prisma schema:**

```bash
npx prisma db push

```

5. **Run the server:**

```bash
npm run dev

```



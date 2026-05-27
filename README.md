# Lreturns

Lreturns is an e-commerce storefront and returns-management dashboard. Customers can
register, browse and search products, maintain a persistent cart, and place orders.
Administrators can manage products, inspect active shopping carts, process orders,
manage customer accounts, and monitor returns.

## Main Features

- Customer registration and login with password hashing and JWT authentication.
- Role-based API access for customer, staff, and administrator actions.
- Live product search and category filtering in the storefront.
- MongoDB-backed product catalogue CRUD operations.
- Persistent customer carts and checkout order creation.
- Administrative active cart viewing and order status management.
- Returns dashboard, reporting views, responsive layouts, and light/dark themes.

## Technology Stack

| Area       | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, TanStack Router/Start, Vite, Tailwind CSS   |
| State/UI   | Zustand, Radix UI components, Lucide icons, Recharts              |
| Backend    | Node.js, Express                                                  |
| Database   | MongoDB with Mongoose                                             |
| Security   | bcryptjs password hashing, JSON Web Tokens, role-based middleware |
| Validation | Zod on authentication forms and server-side request validation    |

## Database Entities And CRUD

| Entity         | Database Operations                                          | Interface                                              |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| Products       | Create, read, update, delete                                 | Admin Products; customer Shop reads/searches catalogue |
| Shopping carts | Create/update, read, delete after checkout                   | Customer cart; admin Active Carts                      |
| Orders         | Create, read, update status/note, delete                     | Customer Checkout; admin Orders                        |
| Users          | Create through registration, read/update by authorised users | Login/Register; admin Customers                        |

Product searches filter the rendered list immediately while the catalogue itself is
loaded from MongoDB through the Express API.

## Local Setup

### Prerequisites

- Node.js 20 or later
- npm
- A local MongoDB server or a MongoDB Atlas connection string

### Installation

```bash
npm install
cp .env.example .env
```

Configure `.env` with your database URI and a private JWT secret:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/lreturns
MONGODB_DB_NAME=lreturns
JWT_SECRET=replace-with-your-own-long-random-secret
API_PORT=4000
VITE_API_URL=http://localhost:4000
CLIENT_ORIGIN=http://localhost:8080
```

The `.env` file is ignored by Git and must not be committed.

### Seed Products

```bash
npm run seed:products
```

This safely inserts or updates the five starter catalogue products using SKU as the
identifier. Additional catalogue records are preserved.

### Run The Application

Use separate terminals:

```bash
npm run dev:api
```

```bash
npm run dev
```

Open [http://localhost:8080/](http://localhost:8080/).

### Administrator Testing

New registrations are deliberately created as customers. To demonstrate administrator
features locally, register an account, change its `role` field from `customer` to
`admin` in the MongoDB `users` collection, sign out, and sign in again. The new JWT
will then contain the administrator role.

## API Overview

| Method And Route                | Purpose                         | Access                                    |
| ------------------------------- | ------------------------------- | ----------------------------------------- |
| `POST /api/auth/register`       | Register customer and issue JWT | Public                                    |
| `POST /api/auth/login`          | Verify password and issue JWT   | Public                                    |
| `GET /api/products`             | List/search products            | Public                                    |
| `POST/PUT/DELETE /api/products` | Manage catalogue                | Admin/staff                               |
| `GET /api/carts`                | View saved carts                | Customer own cart; admin/staff all carts  |
| `PUT/DELETE /api/carts/:email`  | Save/remove a customer cart     | Customer own cart; admin/staff            |
| `POST /api/orders`              | Place an order                  | Authenticated customer                    |
| `GET/PATCH/DELETE /api/orders`  | Manage orders                   | Admin/staff                               |
| `GET/PATCH /api/users`          | View/manage users               | Admin/staff; users may update own profile |

Protected requests use:

```http
Authorization: Bearer <jwt>
```

## Project Structure

```text
database/                 Seed/export artefacts and database documentation
server/
  middleware/             JWT authentication and role checks
  models/                 Mongoose schemas for users, products, carts and orders
  routes/                 Express API endpoints
src/
  components/             Reusable layout, common and UI components
  lib/                    Shared API and utility helpers
  routes/                 Customer storefront and administrator dashboard pages
  stores/                 Zustand state and API integration
  styles.css              Global styling and theme tokens
```

## Database Export

The repository includes [database/products.seed.json](database/products.seed.json) as
the catalogue data export/seed artefact. Collection details and import instructions are
provided in [database/README.md](database/README.md). User password hashes and JWT
secrets are intentionally not included in exported submission data.

## Workload Allocation

| Group Member                                 | Primary Contribution                                                                                                                                                                         | Main Files                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leah (student ID: 25628367)     | MongoDB integration for products, carts and orders; product API/frontend integration; admin cart/order workflow; JWT/RBAC completion and security hardening; database seed and documentation | `server/db.mjs`, `server/middleware/auth.mjs`, `server/models/Product.mjs`, `server/models/Cart.mjs`, `server/models/Order.mjs`, `server/routes/products.mjs`, `server/routes/carts.mjs`, `server/routes/orders.mjs`, `src/stores/product-store.ts`, `src/stores/cart-store.ts`, `src/stores/order-store.ts`, `src/routes/_app/products.tsx`, `src/routes/_app/carts.tsx`, `src/routes/_app/orders.tsx`, `src/routes/store/*`, `database/*` |
| Thailong (student ID: 25150653) | Initial application/dashboard and customer interface; user/authentication foundation and password hashing; customer theme toggle and interface refinements                                   | `server/models/User.mjs`, initial `server/routes/auth.mjs` and `server/routes/users.mjs`, `src/stores/auth-store.ts`, `src/stores/user-store.ts`, `src/routes/login.tsx`, `src/routes/register.tsx`, `src/routes/_app/dashboard.tsx`, `src/routes/store.tsx`, `src/routes/store/index.tsx`, UI/layout components                                                                                                                            |

Some shared files were updated by both members as features were integrated and
secured. Git commit history records each contribution and its later integration.

## Verification

```bash
npm run lint
npm run build
```

Functional verification should include registering and logging in, browsing and
searching products, admin product CRUD, saving a cart, viewing it as an administrator,
placing an order, confirming stock reduction, and processing that order in the admin
dashboard.

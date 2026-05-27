# Database Data And Collections

The application uses a MongoDB database named `lreturns`.

## Included Data Export

`products.seed.json` contains starter product data for the catalogue. It is a
submission-safe JSON export because it does not contain credentials, JWT secrets, or
customer information.

To populate or refresh the starter products using the application model:

```bash
npm run seed:products
```

The seed operation upserts by `sku`, so it does not delete additional products.

## Collections

| Collection | Purpose                             | Key Fields                                                                           |
| ---------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| `products` | Product catalogue and inventory     | `name`, `sku`, `category`, `price`, `stock`, `description`, `createdAt`, `updatedAt` |
| `users`    | Registered accounts and roles       | `name`, `email`, `role`, `passwordHash`                                              |
| `carts`    | Active carts persisted per customer | `customerName`, `customerEmail`, `items`                                             |
| `orders`   | Completed customer checkouts        | `orderNumber`, `customerEmail`, `items`, `status`, `total`, `address`                |

The `users` collection is created through registration and is not exported because it
contains password hashes. Secrets belong only in local environment variables.

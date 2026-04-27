# Setup and Run Instructions (using Bun)

Follow these steps to initialize the database and start the development server.

## 1. Install Dependencies
Ensure you have Bun installed, then run:
```bash
bun install
```

## 2. Database Setup (Prisma & SQLite)
Initialize the SQLite database and generate the Prisma client.
```bash
# Push the schema to the database
bunx prisma db push

# Generate the Prisma client
bunx prisma generate
```

## 3. Run the Service
Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

---
**Note:** If you encounter SSL/Certificate issues during Prisma generation on a corporate network, use:
`$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; bunx prisma generate` (PowerShell)
or
`NODE_TLS_REJECT_UNAUTHORIZED=0 bunx prisma generate` (Bash)

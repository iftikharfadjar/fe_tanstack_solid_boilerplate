# Prisma v7 Upgrade Steps

## Problem
Error: `Environment variable not found: DATABASE_URL`

## Solution

### 1. Create `.env` file
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-key-change-in-production"
```

### 2. Update package.json
- `@prisma/client`: `5` → `^7.8.0`
- `prisma`: `5` → `^7.8.0`

### 3. Install new dependencies
```bash
bun add @prisma/adapter-better-sqlite3 better-sqlite3
```

### 4. Update schema.prisma
Remove `url` from datasource block:
```prisma
datasource db {
  provider = "sqlite"
}
```

### 5. Create prisma.config.ts
Required in Prisma v7:
```typescript
import { defineConfig } from 'prisma/config';
import path from 'node:path';

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
});
```

### 6. Update prisma.ts
Use adapter instead of direct client:
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

export const prisma = new PrismaClient({ adapter });
```

### 7. Run commands
```bash
bun install
bunx prisma generate
bunx prisma db push
```

## Notes
- Prisma v7 requires an explicit adapter to be passed to `PrismaClient`
- `url` is no longer allowed in schema.prisma datasource block
- `prisma.config.ts` is now required for migrations
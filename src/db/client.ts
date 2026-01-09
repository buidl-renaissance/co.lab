// Re-export Drizzle db for backwards compatibility
// This allows existing code to continue using `import client from './client'`

import { db } from './drizzle';

export default db;

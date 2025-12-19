// Re-export Drizzle db for backwards compatibility
// This allows existing code to continue using `import client from './client'`
// while we migrate to Drizzle

import { db } from './drizzle';

// For backwards compatibility, export as default
// Note: This is a Drizzle instance, not Knex, but we'll migrate usage gradually
export default db;

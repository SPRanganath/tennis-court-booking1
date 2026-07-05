import { pool } from './db.js';
import { courts } from './seedData.js';

async function seed() {
  for (const court of courts) {
    await pool.query(
      `INSERT INTO courts (id, name, location, surface, indoor, number_of_courts, price_per_hour, open_hour, close_hour)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         location = EXCLUDED.location,
         surface = EXCLUDED.surface,
         indoor = EXCLUDED.indoor,
         number_of_courts = EXCLUDED.number_of_courts,
         price_per_hour = EXCLUDED.price_per_hour,
         open_hour = EXCLUDED.open_hour,
         close_hour = EXCLUDED.close_hour`,
      [
        court.id,
        court.name,
        court.location,
        court.surface,
        court.indoor,
        court.numberOfCourts,
        court.pricePerHour,
        court.openHour,
        court.closeHour,
      ]
    );
  }
  console.log(`Seeded ${courts.length} courts.`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

import { db } from './db.js';
import { 
  MOCK_PRODUCTS, 
  MOCK_ARTISANS, 
  MOCK_ORDERS, 
  MOCK_ENQUIRIES, 
  MOCK_CRAFTS 
} from '../../src/data/mockData.js';

export function seedMarketplaceData() {
  try {
    const now = new Date().toISOString();

    // 1. Seed Products if empty
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
    if (productCount && productCount.count === 0) {
      const insertProduct = db.prepare(`
        INSERT INTO products (
          id, title, craft_id, craft_name, artisan_id, artisan_name, artisan_location,
          price, availability, status, stock_count, ready_made, lead_time_days,
          image, gallery, materials, dimensions, weight, description,
          gi_certified, gi_tag, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of MOCK_PRODUCTS) {
        insertProduct.run(
          p.id,
          p.title,
          p.craftId || 'craft',
          p.craftName || '',
          p.artisanId || 'artisan',
          p.artisanName || '',
          p.artisanLocation || '',
          p.price || 0,
          p.availability || 'In Stock',
          p.status || 'Published',
          p.stockCount || 1,
          p.readyMade ? 1 : 0,
          p.leadTimeDays || 3,
          p.image || '',
          JSON.stringify(p.gallery || [p.image]),
          JSON.stringify(p.materials || []),
          p.dimensions || '',
          p.weight || '',
          p.description || '',
          p.giCertified ? 1 : 0,
          p.giTag || '',
          JSON.stringify(p.tags || []),
          now,
          now
        );
      }
      console.log(`[Database Seed] Seeded ${MOCK_PRODUCTS.length} authentic artisan products.`);
    }

    // 2. Seed Artisans if empty
    const artisanCount = db.prepare('SELECT COUNT(*) as count FROM artisans').get();
    if (artisanCount && artisanCount.count === 0) {
      const insertArtisan = db.prepare(`
        INSERT INTO artisans (
          id, user_id, name, title, craft, location, experience_years,
          avatar, bio, verified, badge, rating, reviews_count,
          active_products_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const a of MOCK_ARTISANS) {
        insertArtisan.run(
          a.id,
          a.id === 'dulari-devi' ? 'ARH-000101' : `ARH-${Math.floor(100000 + Math.random() * 900000)}`,
          a.name,
          a.title || 'Master Artisan',
          a.craft || '',
          a.location || '',
          a.experienceYears || 10,
          a.avatar || '',
          a.bio || '',
          a.verified ? 1 : 0,
          a.badge || '',
          a.rating || 4.9,
          a.reviewsCount || 50,
          a.activeProductsCount || 1,
          now
        );
      }
      console.log(`[Database Seed] Seeded ${MOCK_ARTISANS.length} master artisans.`);
    }

    // 3. Seed Orders if empty
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    if (orderCount && orderCount.count === 0) {
      const insertOrder = db.prepare(`
        INSERT INTO orders (
          id, order_number, customer_id, customer_name, customer_email,
          customer_phone, customer_city, shipping_address, items,
          total_amount, status, payment_mode, tracking_code, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const o of MOCK_ORDERS) {
        insertOrder.run(
          o.id,
          o.id,
          o.customerName === 'Aditi Narang' ? 'ARH-000202' : 'ARH-000999',
          o.customerName,
          o.customerEmail,
          o.customerPhone || '+91 98450 22002',
          o.customerCity || 'Bengaluru, Karnataka',
          o.shippingAddress || `${o.customerCity || 'Bengaluru'}, India`,
          JSON.stringify([{
            productTitle: o.productTitle,
            artisanId: o.artisanId,
            price: o.amount,
            quantity: 1
          }]),
          o.amount,
          o.status || 'Confirmed',
          o.paymentMode || 'UPI (Verified Payment)',
          o.trackingCode || 'AAROH-EXP-5592',
          o.notes || '',
          o.date || now,
          now
        );
      }
      console.log(`[Database Seed] Seeded ${MOCK_ORDERS.length} sample orders.`);
    }

    // 4. Seed Enquiries if empty
    const enqCount = db.prepare('SELECT COUNT(*) as count FROM enquiries').get();
    if (enqCount && enqCount.count === 0) {
      const insertEnq = db.prepare(`
        INSERT INTO enquiries (
          id, product_id, product_title, artisan_id, customer_name,
          customer_phone, customer_email, quantity, purpose,
          preferred_contact, message, status, artisan_response,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const e of MOCK_ENQUIRIES) {
        insertEnq.run(
          e.id,
          e.productId || 'prod-1',
          e.productTitle,
          e.artisanId,
          e.customerName,
          e.customerPhone || '',
          e.customerEmail,
          e.quantity || 1,
          e.purpose || '',
          e.preferredContact || 'WhatsApp',
          e.message || '',
          e.status || 'New Enquiry',
          e.response || '',
          e.date || now,
          now
        );
      }
      console.log(`[Database Seed] Seeded ${MOCK_ENQUIRIES.length} sample enquiries.`);
    }

    // 5. Seed Cultural Heritage Crafts if empty
    const craftCount = db.prepare('SELECT COUNT(*) as count FROM cultural_heritage').get();
    if (craftCount && craftCount.count === 0) {
      const insertCraft = db.prepare(`
        INSERT INTO cultural_heritage (
          id, name, category, region, gi_certified, gi_tag,
          materials, motifs, description, reviewer, citations,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const c of MOCK_CRAFTS) {
        insertCraft.run(
          c.id,
          c.name,
          c.category,
          c.region,
          c.giCertified ? 1 : 0,
          c.giTag || '',
          JSON.stringify(c.materials || []),
          JSON.stringify(c.motifs || []),
          c.description || '',
          c.reviewer || '',
          JSON.stringify(c.citations || []),
          now
        );
      }
      console.log(`[Database Seed] Seeded ${MOCK_CRAFTS.length} cultural heritage craft traditions.`);
    }
  } catch (err) {
    console.warn('[Database Seed Warning]', err.message);
  }
}

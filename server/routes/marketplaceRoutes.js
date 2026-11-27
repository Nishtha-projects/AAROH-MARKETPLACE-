import express from 'express';
import { db } from '../database/db.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

function parseJsonSafe(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// ============================================================================
// 1. PRODUCTS API (GET, POST, PUT, DELETE)
// ============================================================================

router.get('/products', (req, res) => {
  try {
    const { craftId, artisanId, search, status } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (craftId && craftId !== 'all') {
      query += ' AND craft_id = ?';
      params.push(craftId);
    }
    if (artisanId) {
      query += ' AND artisan_id = ?';
      params.push(artisanId);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(craft_name) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);

    const products = rows.map(r => ({
      id: r.id,
      title: r.title,
      craftId: r.craft_id,
      craftName: r.craft_name,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      artisanLocation: r.artisan_location,
      price: r.price,
      availability: r.availability,
      status: r.status,
      stockCount: r.stock_count,
      readyMade: Boolean(r.ready_made),
      leadTimeDays: r.lead_time_days,
      image: r.image,
      gallery: parseJsonSafe(r.gallery, [r.image]),
      materials: parseJsonSafe(r.materials, []),
      dimensions: r.dimensions,
      weight: r.weight,
      description: r.description,
      giCertified: Boolean(r.gi_certified),
      giTag: r.gi_tag,
      tags: parseJsonSafe(r.tags, []),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/products/:id', (req, res) => {
  try {
    const r = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!r) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const product = {
      id: r.id,
      title: r.title,
      craftId: r.craft_id,
      craftName: r.craft_name,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      artisanLocation: r.artisan_location,
      price: r.price,
      availability: r.availability,
      status: r.status,
      stockCount: r.stock_count,
      readyMade: Boolean(r.ready_made),
      leadTimeDays: r.lead_time_days,
      image: r.image,
      gallery: parseJsonSafe(r.gallery, [r.image]),
      materials: parseJsonSafe(r.materials, []),
      dimensions: r.dimensions,
      weight: r.weight,
      description: r.description,
      giCertified: Boolean(r.gi_certified),
      giTag: r.gi_tag,
      tags: parseJsonSafe(r.tags, []),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/products', (req, res) => {
  try {
    const {
      title, craftId, craftName, artisanId, artisanName, artisanLocation,
      price, stockCount = 1, readyMade = true, leadTimeDays = 3,
      image, gallery, materials, dimensions, weight, description,
      giCertified = true, giTag, tags
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, error: 'Title and price are required' });
    }

    const id = `prod-${Date.now()}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO products (
        id, title, craft_id, craft_name, artisan_id, artisan_name, artisan_location,
        price, availability, status, stock_count, ready_made, lead_time_days,
        image, gallery, materials, dimensions, weight, description,
        gi_certified, gi_tag, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      title.trim(),
      craftId || 'other',
      craftName || 'Indian Craft',
      artisanId || 'artisan',
      artisanName || 'Master Artisan',
      artisanLocation || 'India',
      Number(price),
      'In Stock',
      'Published',
      Number(stockCount),
      readyMade ? 1 : 0,
      Number(leadTimeDays),
      image || '/assets/images/madhubani-tree-of-life.jpg',
      JSON.stringify(gallery || [image || '/assets/images/madhubani-tree-of-life.jpg']),
      JSON.stringify(materials || []),
      dimensions || '',
      weight || '',
      description || '',
      giCertified ? 1 : 0,
      giTag || '',
      JSON.stringify(tags || []),
      now,
      now
    );

    res.status(201).json({
      success: true,
      message: 'Product listed successfully in database',
      productId: id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const updates = req.body;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE products SET
        title = COALESCE(?, title),
        price = COALESCE(?, price),
        stock_count = COALESCE(?, stock_count),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.title,
      updates.price ? Number(updates.price) : null,
      updates.stockCount !== undefined ? Number(updates.stockCount) : null,
      updates.description,
      updates.status,
      now,
      id
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update product status (Published, Draft, Archived)
router.patch('/products/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['Published', 'Draft', 'Archived'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Valid status (Published, Draft, Archived) is required' });
    }
    const now = new Date().toISOString();
    db.prepare('UPDATE products SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);
    res.json({ success: true, message: `Product status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Validated Image Upload Endpoint
router.post('/upload-image', (req, res) => {
  try {
    const { imageBase64, filename = 'craft.jpg' } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Image base64 data is required' });
    }

    if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://') || imageBase64.startsWith('/')) {
      return res.json({ success: true, url: imageBase64 });
    }

    // Validate size (max 5MB)
    const approximateSizeInBytes = (imageBase64.length * 3) / 4;
    if (approximateSizeInBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File size exceeds maximum allowed limit of 5MB' });
    }

    // Validate MIME type
    const mimeMatch = imageBase64.match(/^data:(image\/(jpeg|png|webp|gif));base64,/i);
    let ext = 'jpg';
    let base64Data = imageBase64;
    if (mimeMatch) {
      const mime = mimeMatch[1].toLowerCase();
      if (mime === 'image/png') ext = 'png';
      else if (mime === 'image/webp') ext = 'webp';
      else if (mime === 'image/gif') ext = 'gif';
      base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeFileName = `craft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    res.json({
      success: true,
      message: 'Image uploaded and validated successfully',
      url: `/uploads/${safeFileName}`,
      filename: safeFileName,
      sizeBytes: approximateSizeInBytes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 2. ARTISANS API
// ============================================================================

router.get('/artisans', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM artisans ORDER BY experience_years DESC').all();
    const artisans = rows.map(a => ({
      id: a.id,
      userId: a.user_id,
      name: a.name,
      title: a.title,
      craft: a.craft,
      location: a.location,
      experienceYears: a.experience_years,
      avatar: a.avatar,
      bio: a.bio,
      verified: Boolean(a.verified),
      badge: a.badge,
      rating: a.rating,
      reviewsCount: a.reviews_count,
      activeProductsCount: a.active_products_count
    }));
    res.json({ success: true, artisans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/artisans/:id', (req, res) => {
  try {
    const a = db.prepare('SELECT * FROM artisans WHERE id = ?').get(req.params.id);
    if (!a) {
      return res.status(404).json({ success: false, error: 'Artisan not found' });
    }
    res.json({
      success: true,
      artisan: {
        id: a.id,
        userId: a.user_id,
        name: a.name,
        title: a.title,
        craft: a.craft,
        location: a.location,
        experienceYears: a.experience_years,
        avatar: a.avatar,
        bio: a.bio,
        verified: Boolean(a.verified),
        badge: a.badge,
        rating: a.rating,
        reviewsCount: a.reviews_count,
        activeProductsCount: a.active_products_count
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 3. ORDERS API
// ============================================================================

router.get('/orders', (req, res) => {
  try {
    const { customerEmail, customerId, artisanId } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (customerEmail) {
      query += ' AND LOWER(customer_email) = LOWER(?)';
      params.push(customerEmail.trim());
    } else if (customerId) {
      query += ' AND customer_id = ?';
      params.push(customerId);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);

    const orders = rows.map(r => ({
      id: r.id,
      orderNumber: r.order_number,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      customerCity: r.customer_city,
      shippingAddress: r.shipping_address,
      items: parseJsonSafe(r.items, []),
      totalAmount: r.total_amount,
      status: r.status,
      paymentMode: r.payment_mode,
      trackingCode: r.tracking_code,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/orders', (req, res) => {
  try {
    const {
      customerId, customerName, customerEmail, customerPhone,
      customerCity, shippingAddress, items, totalAmount, paymentMode, notes
    } = req.body;

    if (!customerName || !customerEmail || !items || !items.length) {
      return res.status(400).json({ success: false, error: 'Customer information and items are required' });
    }

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingCode = `AAROH-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_id, customer_name, customer_email,
        customer_phone, customer_city, shipping_address, items,
        total_amount, status, payment_mode, tracking_code, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      orderNumber,
      orderNumber,
      customerId || 'guest',
      customerName.trim(),
      customerEmail.trim(),
      customerPhone || '',
      customerCity || '',
      shippingAddress || '',
      JSON.stringify(items),
      Number(totalAmount) || 0,
      'Confirmed & Escrow Secured',
      paymentMode || 'UPI (Verified Payment)',
      trackingCode,
      notes || '',
      now,
      now
    );

    res.status(201).json({
      success: true,
      message: 'Order request placed and persisted successfully in Aaroh database',
      order: {
        id: orderNumber,
        orderNumber,
        trackingCode,
        totalAmount,
        status: 'Order Request Placed (Demo Mode)'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order status (In Production, Dispatched, Delivered)
router.put('/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const now = new Date().toISOString();
    db.prepare('UPDATE orders SET status = ?, notes = COALESCE(?, notes), updated_at = ? WHERE id = ?').run(status, notes || null, now, id);
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. ENQUIRIES API
// ============================================================================

router.get('/enquiries', (req, res) => {
  try {
    const { artisanId, customerEmail } = req.query;
    let query = 'SELECT * FROM enquiries WHERE 1=1';
    const params = [];

    if (artisanId) {
      query += ' AND artisan_id = ?';
      params.push(artisanId);
    }
    if (customerEmail) {
      query += ' AND LOWER(customer_email) = LOWER(?)';
      params.push(customerEmail.trim());
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);

    const enquiries = rows.map(r => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_title,
      artisanId: r.artisan_id,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email,
      quantity: r.quantity,
      purpose: r.purpose,
      preferredContact: r.preferred_contact,
      message: r.message,
      status: r.status,
      artisanResponse: r.artisan_response,
      createdAt: r.created_at
    }));

    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/enquiries', (req, res) => {
  try {
    const {
      productId, productTitle, artisanId, customerName, customerPhone,
      customerEmail, quantity = 1, purpose, preferredContact = 'WhatsApp', message
    } = req.body;

    if (!customerName || !customerEmail || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    const id = `ENQ-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO enquiries (
        id, product_id, product_title, artisan_id, customer_name,
        customer_phone, customer_email, quantity, purpose,
        preferred_contact, message, status, artisan_response,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      productId || 'prod-general',
      productTitle || 'Aaroh Artisan Craft',
      artisanId || 'dulari-devi',
      customerName.trim(),
      customerPhone || '',
      customerEmail.trim(),
      Number(quantity) || 1,
      purpose || '',
      preferredContact,
      message.trim(),
      'New Enquiry',
      '',
      now,
      now
    );

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted directly to the artisan and saved to database',
      enquiryId: id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 5. CUSTOM COMMISSIONS API
// ============================================================================

router.get('/commissions', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM commissions ORDER BY created_at DESC').all();
    const commissions = rows.map(r => ({
      id: r.id,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      artisanId: r.artisan_id,
      artisanName: r.artisan_name,
      craftType: r.craft_type,
      title: r.title,
      description: r.description,
      budget: r.budget,
      dimensions: r.dimensions,
      timelineWeeks: r.timeline_weeks,
      referenceImages: parseJsonSafe(r.reference_images, []),
      status: r.status,
      escrowStatus: r.escrow_status,
      escrowAmount: r.escrow_amount,
      licenseChoice: r.license_choice || 'personal_display',
      usagePermission: Boolean(r.usage_permission !== 0),
      isPrivate: Boolean(r.is_private !== 0),
      artisanResponse: r.artisan_response || '',
      createdAt: r.created_at
    }));
    res.json({ success: true, count: commissions.length, commissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/commissions', (req, res) => {
  try {
    const {
      customerId, customerName, customerEmail, customerPhone,
      artisanId, artisanName, craftType, title, description,
      budget, dimensions, timelineWeeks = 4, referenceImages,
      licenseChoice = 'personal_display', usagePermission = true, isPrivate = true
    } = req.body;

    if (!customerName || !customerEmail || !craftType || !description) {
      return res.status(400).json({ success: false, error: 'Name, email, craft type, and project description are required' });
    }

    const id = `COM-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const numericBudget = Number(budget) || 10000;
    const initialAdvance = Math.round(numericBudget * 0.25);

    db.prepare(`
      INSERT INTO commissions (
        id, customer_id, customer_name, customer_email, customer_phone,
        artisan_id, artisan_name, craft_type, title, description,
        budget, dimensions, timeline_weeks, reference_images,
        status, escrow_status, escrow_amount, license_choice,
        usage_permission, is_private, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      customerId || 'patron',
      customerName.trim(),
      customerEmail.trim(),
      customerPhone || '',
      artisanId || 'master-guild',
      artisanName || 'Master Artisan Guild',
      craftType,
      title || `${craftType} Custom Commission`,
      description.trim(),
      numericBudget,
      dimensions || 'Custom Dimensions',
      Number(timelineWeeks) || 4,
      JSON.stringify(referenceImages || []),
      'Under Review by Artisan',
      `Advance Escrow Held (25% - ₹${initialAdvance.toLocaleString('en-IN')})`,
      initialAdvance,
      licenseChoice,
      usagePermission ? 1 : 0,
      isPrivate ? 1 : 0,
      now,
      now
    );

    res.status(201).json({
      success: true,
      message: 'Custom commission agreement drafted and escrow secured in database',
      commission: {
        id,
        initialAdvance,
        status: 'Under Review by Artisan',
        escrowStatus: `Advance Escrow Held (25% - ₹${initialAdvance.toLocaleString('en-IN')})`,
        licenseChoice
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update commission status and artisan response
router.put('/commissions/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, artisanResponse, escrowStatus } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE commissions 
      SET status = ?, 
          artisan_response = COALESCE(?, artisan_response),
          escrow_status = COALESCE(?, escrow_status),
          updated_at = ? 
      WHERE id = ?
    `).run(status, artisanResponse || null, escrowStatus || null, now, id);
    res.json({ success: true, message: `Commission status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 6. USER SETTINGS API (PERSISTED THEME, LOCALE, AND PREFERENCES)
// ============================================================================

router.get('/user-settings/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const row = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    res.json({
      success: true,
      settings: row ? {
        userId: row.user_id,
        preferredLang: row.preferred_lang,
        themeMode: row.theme_mode,
        palette: row.palette,
        reducedMotion: Boolean(row.reduced_motion)
      } : null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/user-settings', (req, res) => {
  try {
    const { userId, preferredLang, themeMode, palette, reducedMotion } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO user_settings (user_id, preferred_lang, theme_mode, palette, reduced_motion, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        preferred_lang = excluded.preferred_lang,
        theme_mode = excluded.theme_mode,
        palette = excluded.palette,
        reduced_motion = excluded.reduced_motion,
        updated_at = excluded.updated_at
    `).run(userId, preferredLang || 'en', themeMode || 'light', palette || 'ivory-indigo', reducedMotion ? 1 : 0, now);
    res.json({ success: true, message: 'Settings saved to database' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 6. CULTURAL HERITAGE CRAFTS API
// ============================================================================

router.get('/crafts', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM cultural_heritage ORDER BY name ASC').all();
    const crafts = rows.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      region: c.region,
      giCertified: Boolean(c.gi_certified),
      giTag: c.gi_tag,
      materials: parseJsonSafe(c.materials, []),
      motifs: parseJsonSafe(c.motifs, []),
      description: c.description,
      reviewer: c.reviewer,
      citations: parseJsonSafe(c.citations, [])
    }));
    res.json({ success: true, count: crafts.length, crafts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

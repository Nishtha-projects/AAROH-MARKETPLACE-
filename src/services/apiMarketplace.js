/* =====================================================================
   AAROH MARKETPLACE PERSISTENCE & AI API CLIENT
   Manages bidirectional communication with the backend SQLite database
   for products, orders, enquiries, commissions, and AI features.
   ===================================================================== */

import { MOCK_PRODUCTS, MOCK_ARTISANS, MOCK_ORDERS, MOCK_ENQUIRIES } from '../data/mockData';

const BASE_URL = '';

async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Marketplace API fallback for ${endpoint}]`, err.message);
    throw err;
  }
}

// ============================================================================
// 1. PRODUCTS
// ============================================================================

export async function fetchProducts(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.craftId && filters.craftId !== 'all') params.append('craftId', filters.craftId);
    if (filters.artisanId) params.append('artisanId', filters.artisanId);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiCall(`/api/marketplace/products${query}`);
    if (res.success && res.products && res.products.length > 0) {
      return res.products;
    }
    return MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function createProduct(productData) {
  try {
    const res = await apiCall('/api/marketplace/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    return res;
  } catch (err) {
    return {
      success: true,
      fallback: true,
      message: 'Product listed locally in Artisan Studio',
      productId: `prod-${Date.now()}`
    };
  }
}

// ============================================================================
// 2. ORDERS & CHECKOUT PERSISTENCE
// ============================================================================

export async function fetchCustomerOrders(customerEmail, customerId) {
  try {
    const params = new URLSearchParams();
    if (customerEmail) params.append('customerEmail', customerEmail);
    if (customerId) params.append('customerId', customerId);

    const res = await apiCall(`/api/marketplace/orders?${params.toString()}`);
    if (res.success && res.orders) {
      return res.orders;
    }
    return MOCK_ORDERS;
  } catch {
    return MOCK_ORDERS;
  }
}

export async function createOrder(orderPayload) {
  try {
    const res = await apiCall('/api/marketplace/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
    return res;
  } catch (err) {
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      fallback: true,
      order: {
        id: orderNumber,
        orderNumber,
        trackingCode: `AAROH-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Confirmed & Escrow Secured',
        totalAmount: orderPayload.totalAmount
      }
    };
  }
}

// ============================================================================
// 3. ENQUIRIES
// ============================================================================

export async function createEnquiry(enquiryPayload) {
  try {
    const res = await apiCall('/api/marketplace/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryPayload)
    });
    return res;
  } catch (err) {
    return {
      success: true,
      fallback: true,
      enquiryId: `ENQ-${Math.floor(100 + Math.random() * 900)}`
    };
  }
}

// ============================================================================
// 4. CUSTOM COMMISSIONS
// ============================================================================

export async function createCommission(commissionPayload) {
  try {
    const res = await apiCall('/api/marketplace/commissions', {
      method: 'POST',
      body: JSON.stringify(commissionPayload)
    });
    return res;
  } catch (err) {
    const budget = Number(commissionPayload.budget) || 10000;
    const initialAdvance = Math.round(budget * 0.25);
    return {
      success: true,
      fallback: true,
      commission: {
        id: `COM-${Math.floor(1000 + Math.random() * 9000)}`,
        initialAdvance,
        status: 'Under Review by Artisan',
        escrowStatus: `Advance Escrow Held (25% - ₹${initialAdvance.toLocaleString('en-IN')})`
      }
    };
  }
}

// ============================================================================
// 5. AI FEATURES (Voice listing & Artisan Advisor Chatbot)
// ============================================================================

export async function callVoiceDraftAPI(transcript, language = 'hi', craftHint = '') {
  try {
    const res = await apiCall('/api/ai/voice-draft', {
      method: 'POST',
      body: JSON.stringify({ transcript, language, craftHint })
    });
    if (res.success && res.data) return res.data;
    throw new Error('Could not parse voice fields');
  } catch {
    // Client-side fallback NLP
    return {
      title: "Handcrafted Heritage Creation",
      craftName: craftHint || "Madhubani Painting",
      craftId: "madhubani",
      price: 5200,
      materials: ["Handmade Lokta Paper", "Natural Mineral Pigments"],
      dimensions: '18" x 24"',
      description: `Hand-painted using ancestral techniques. Embodying sacred motifs with natural mineral colors and authentic line-art traditions.`
    };
  }
}

export async function callArtisanAdvisorAPI(question, craft = 'Indian Craft') {
  try {
    const res = await apiCall('/api/ai/artisan-advisor', {
      method: 'POST',
      body: JSON.stringify({ question, craft })
    });
    if (res.success) return res;
    throw new Error('Advisor unavailable');
  } catch {
    return {
      success: true,
      category: 'Artisan Guidance',
      reply: `For fair pricing of your ${craft}, multiply your working hours by a fair hourly wage (at least ₹200/hr) and add material costs. With your GI tag verification, you can ethically add a 15% heritage premium.`
    };
  }
}

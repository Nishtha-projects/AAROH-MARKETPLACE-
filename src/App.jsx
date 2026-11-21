import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OpeningCoverSection } from './components/OpeningCoverSection';
import { AarohVisionSection } from './components/AarohVisionSection';
import { ExploreAarohSection } from './components/ExploreAarohSection';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { JourneyScrollDock } from './components/JourneyScrollDock';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { EnquiryModal } from './components/EnquiryModal';
import { CustomCommissionModal } from './components/CustomCommissionModal';
import { ArtisanDashboard } from './components/ArtisanDashboard';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { PaintingDatasetModal } from './components/PaintingDatasetModal';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SecurityModal } from './components/SecurityModal';
import { Footer } from './components/Footer';

import { MOCK_PRODUCTS, MOCK_ARTISANS, MOCK_ORDERS, MOCK_ENQUIRIES } from './data/mockData';
import { 
  subscribeToAuthService, 
  verifyActiveSession, 
  logoutUser, 
  getStoredUser 
} from './services/apiAuth';
import i18n, { applyLanguageSettings } from './i18n';

export function App() {
  // Theme and Locale State
  const [lang, setLang] = useState(() => localStorage.getItem('aaroh_lang') || 'en');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('aaroh_theme_mode') || 'light');
  const [palette, setPalette] = useState(() => localStorage.getItem('aaroh_palette') || 'ivory-indigo');
  // Default to standard rich motion mode so animations are immediately visible
  const [reducedMotion, setReducedMotion] = useState(false);

  // Application Data State
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [enquiries, setEnquiries] = useState(MOCK_ENQUIRIES);
  const [cartItems, setCartItems] = useState([
    { ...MOCK_PRODUCTS[0], quantity: 1 }
  ]);

  // Auth & User State
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Modal Visibility States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [isArtisanDashOpen, setIsArtisanDashOpen] = useState(false);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isRecognitionOpen, setIsRecognitionOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Active item contexts
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);
  const [activeEnquiryProduct, setActiveEnquiryProduct] = useState(null);
  const [activeCommissionProduct, setActiveCommissionProduct] = useState(null);
  const [selectedCraftFilter, setSelectedCraftFilter] = useState(null);
  const [activeSection, setActiveSection] = useState('crafts');

  // Page View routing: 'marketplace' | 'login' | 'admin'
  const determineView = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.startsWith('/admin') || hash === '#admin' || hash.startsWith('#/admin')) {
      return 'admin';
    }
    if (hash === '#login' || hash.startsWith('#/login') || path === '/login') {
      return 'login';
    }
    return 'marketplace';
  };

  const [currentView, setCurrentView] = useState(determineView);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentView(determineView());
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Restore authenticated session from backend / persistent token
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#auth-success')) {
        const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
        const params = new URLSearchParams(queryPart);
        const token = params.get('token');
        const role = params.get('role');

        if (token) {
          try {
            localStorage.setItem('aaroh_jwt_token', token);
          } catch {}
        }

        // Clean hash from browser URL without reloading
        window.history.replaceState(null, '', window.location.pathname);
        const verifiedUser = await verifyActiveSession();

        if (verifiedUser?.role === 'admin' || role === 'admin') {
          handleOpenAdmin();
        } else {
          handleReturnToHome();
        }
        return;
      }
      verifyActiveSession();
    };

    const unsubscribe = subscribeToAuthService((user) => {
      setCurrentUser(user);
    });

    handleAuthCallback();

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleOpenAuth = () => {
    window.location.hash = '#login';
    setCurrentView('login');
  };

  const handleOpenAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setCurrentView('admin');
  };

  const handleReturnToHome = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.location.hash = '';
    setCurrentView('marketplace');
  };

  // Update HTML data attributes on theme/palette/motion change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme-mode', themeMode);
    localStorage.setItem('aaroh_theme_mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
    localStorage.setItem('aaroh_palette', palette);
  }, [palette]);

  useEffect(() => {
    document.documentElement.setAttribute('data-reduced-motion', reducedMotion.toString());
    localStorage.setItem('aaroh_reduced_motion', reducedMotion.toString());
  }, [reducedMotion]);

  useEffect(() => {
    applyLanguageSettings(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aaroh_lang', lang);
    }
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  useEffect(() => {
    const handleLanguageChanged = (newLng) => {
      if (newLng && newLng !== lang) {
        setLang(newLng);
      }
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [lang]);



  // Shopping Cart Handlers
  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      const addQty = product.quantity || 1;
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + addQty } : item
        );
      }
      return [...prevItems, { ...product, quantity: addQty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId, newQty) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Order Handlers
  const handleOrderCompleted = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  // Enquiry Handlers
  const handleEnquirySubmitted = (newEnquiry) => {
    setEnquiries((prev) => [newEnquiry, ...prev]);
  };

  // Commission Handlers
  const handleCommissionSubmitted = (commission) => {
    // Also log as an enquiry on artisan dashboard
    const commissionAsEnquiry = {
      id: commission.id,
      date: commission.date,
      customerName: "Aditi Narang (Commissioner)",
      customerPhone: "+91 98450 12345",
      customerEmail: "aditi.n@example.com",
      productTitle: commission.title,
      artisanId: "dulari-devi",
      quantity: 1,
      purpose: `Custom Commission (${commission.commissionType})`,
      preferredContact: "WhatsApp",
      status: commission.status,
      message: `${commission.description} [Budget: ₹${commission.budget}, Rights Model: ${commission.rightsModel}]`
    };
    setEnquiries((prev) => [commissionAsEnquiry, ...prev]);
  };

  // Artisan New Product Handler
  const handleAddNewProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  // Product Selection
  const handleOpenProduct = (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setActiveDetailProduct(prod);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (userProfile) => {
    setCurrentUser(userProfile);
    window.location.hash = '';
    setCurrentView('marketplace');
    if (userProfile.role === 'artisan') {
      setIsArtisanDashOpen(true);
      setIsCustomerOrdersOpen(false);
    } else {
      setIsCustomerOrdersOpen(true);
      setIsArtisanDashOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Sign out notice:", err);
    }
    setCurrentUser(null);
    setIsCustomerOrdersOpen(false);
    setIsArtisanDashOpen(false);
    setIsSecurityOpen(false);
  };

  const handleOpenArtisanDash = () => {
    if (!currentUser) {
      handleOpenAuth();
      return;
    }
    setIsArtisanDashOpen(true);
  };

  const handleOpenCustomerOrders = () => {
    if (!currentUser) {
      handleOpenAuth();
      return;
    }
    setIsCustomerOrdersOpen(true);
  };

  const handleSellWithAaroh = () => {
    if (currentUser?.role === 'artisan') {
      setIsArtisanDashOpen(true);
    } else if (currentUser) {
      // Customer wishing to open artisan dashboard
      setIsArtisanDashOpen(true);
    } else {
      handleOpenAuth();
    }
  };

  // If current view is admin, render full dedicated Admin Dashboard
  if (currentView === 'admin') {
    return (
      <AdminDashboard
        lang={lang}
        setLang={setLang}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        onReturnToHome={handleReturnToHome}
        onOpenAuth={handleOpenAuth}
      />
    );
  }

  // If current view is login, render full dedicated original Login Page
  if (currentView === 'login') {
    return (
      <div className="aaroh-app-wrapper" data-palette={palette} data-theme-mode={themeMode} data-reduced-motion={reducedMotion.toString()}>
        <LoginPage
          lang={lang}
          setLang={setLang}
          onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          onLoginSuccess={handleLoginSuccess}
          onReturnToHome={handleReturnToHome}
        />
        {/* 23-Language Selector Modal */}
        <LanguageSelectorModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
          currentLang={lang}
          onSelectLanguage={(newLang) => setLang(newLang)}
        />
      </div>
    );
  }

  return (
    <div className="aaroh-app-wrapper">
      {/* Floating Cultural Journey Tracker for Animated Section Transitions */}
      <JourneyScrollDock />

      {/* 1. OPENING COVER: Full-screen textile cover, line-art logo, "Scroll to explore" */}
      <OpeningCoverSection
        lang={lang}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenArtisanDash={handleOpenArtisanDash}
        onOpenCustomerOrders={handleOpenCustomerOrders}
        onScrollToVision={() => {
          document.getElementById('vision-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Sticky Header: Persistent navigation across the unfolding experience */}
      <Header
        lang={lang}
        setLang={setLang}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        palette={palette}
        setPalette={setPalette}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={handleOpenAdmin}
        onOpenArtisanDash={handleOpenArtisanDash}
        onOpenCustomerOrders={handleOpenCustomerOrders}
        onOpenRecognition={() => setIsRecognitionOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main>
        {/* 2. AAROH'S VISION: Plain warm ivory/parchment background, editorial storytelling, Dulari Devi portrait */}
        <AarohVisionSection
          lang={lang}
          onScrollToExplore={() => {
            document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. EXPLORE AAROH: Progressive craft marketplace, category pills, selected products on calm backgrounds, living oral archives */}
        <ExploreAarohSection
          lang={lang}
          products={products}
          onOpenProduct={handleOpenProduct}
          onAddToCart={handleAddToCart}
          onOpenAuth={handleOpenAuth}
          onOpenArtisanDash={handleSellWithAaroh}
          currentUser={currentUser}
          onOpenCommission={(prod) => {
            setActiveCommissionProduct(prod);
            setIsCommissionOpen(true);
          }}
        />

        {/* Custom Artwork & Commission Banner */}
        <section id="commissions-section" className="section-spacing bg-motif-pattern">
          <div className="container">
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(28px, 6vw, 64px)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-strong)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center'
            }}>
              <div>
                <span className="craft-seal-badge" style={{ marginBottom: '14px' }}>
                  Custom Commissions & Rights
                </span>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '16px' }}>
                  Commission Custom Heritage Artworks
                </h2>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                  Have an ancestral heirloom, sacred family motif, or architectural requirement? Collaborate directly with recognized master artisans under transparent copyright and fair wage agreements.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setActiveCommissionProduct(null);
                      setIsCommissionOpen(true);
                    }}
                    style={{ padding: '14px 28px', fontSize: '1rem' }}
                  >
                    Start a Custom Commission
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setIsRecognitionOpen(true)}
                    style={{ padding: '14px 24px', fontSize: '1rem' }}
                  >
                    Inspect Cultural Recognition Tool
                  </button>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                border: '1px solid var(--border-subtle)'
              }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-indigo)', marginBottom: '12px' }}>
                  How Aaroh Protects Artisans & Creators
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
                  <li style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-olive)', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Verified Image Rights:</strong> Customers verify copyright permission before submitting reference images.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-olive)', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Transparent Royalties:</strong> 85% goes to crafting artisan, 10% to original motif rights holder, 5% sustainable platform fee.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-olive)', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Mutual Agreement:</strong> Both sides agree on price, delivery time, and usage rights before payment escrow.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Modals & Drawers */}
      {/* Product Detail Modal */}
      {activeDetailProduct && (
        <ProductDetailModal
          lang={lang}
          product={activeDetailProduct}
          onClose={() => setActiveDetailProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenEnquiry={(product) => {
            setActiveEnquiryProduct(product);
            setIsEnquiryOpen(true);
          }}
          onOpenCommission={(product) => {
            setActiveCommissionProduct(product);
            setIsCommissionOpen(true);
          }}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        lang={lang}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        lang={lang}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Enquiry Modal */}
      <EnquiryModal
        lang={lang}
        isOpen={isEnquiryOpen}
        onClose={() => {
          setIsEnquiryOpen(false);
          setActiveEnquiryProduct(null);
        }}
        product={activeEnquiryProduct}
        onEnquirySubmitted={handleEnquirySubmitted}
      />

      {/* Custom Commission Modal */}
      <CustomCommissionModal
        lang={lang}
        isOpen={isCommissionOpen}
        onClose={() => {
          setIsCommissionOpen(false);
          setActiveCommissionProduct(null);
        }}
        product={activeCommissionProduct}
        onCommissionSubmitted={handleCommissionSubmitted}
      />

      {/* Role-Protected Artisan Dashboard */}
      <ArtisanDashboard
        lang={lang}
        isOpen={isArtisanDashOpen}
        onClose={() => setIsArtisanDashOpen(false)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        artisan={MOCK_ARTISANS[0]}
        products={products}
        orders={orders}
        enquiries={enquiries}
        onAddNewProduct={handleAddNewProduct}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onOpenRecognition={() => {
          setIsArtisanDashOpen(false);
          setIsRecognitionOpen(true);
        }}
      />

      {/* Role-Protected Customer Orders Modal */}
      <CustomerOrdersModal
        lang={lang}
        isOpen={isCustomerOrdersOpen}
        onClose={() => setIsCustomerOrdersOpen(false)}
        orders={orders}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
      />

      {/* Account Security Sanctuary Modal */}
      <SecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        currentUser={currentUser}
        onLogoutSuccess={handleSignOut}
      />

      {/* Painting Dataset & Recognition Modal */}
      <PaintingDatasetModal
        isOpen={isRecognitionOpen}
        onClose={() => setIsRecognitionOpen(false)}
      />

      {/* 23-Language Selector Modal (Native Scripts + English labels + Search) */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLang={lang}
        onSelectLanguage={(newLang) => setLang(newLang)}
      />

      {/* Global Footer */}
      <Footer
        lang={lang}
        onOpenRecognition={() => setIsRecognitionOpen(true)}
      />
    </div>
  );
}

export default App;

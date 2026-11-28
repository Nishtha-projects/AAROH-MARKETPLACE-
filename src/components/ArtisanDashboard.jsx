import { 
  createProduct, 
  callArtisanAdvisorAPI,
  uploadCraftImage,
  updateProductStatus,
  deleteProduct,
  updateOrderStatus
} from '../services/apiMarketplace';
import { calculateArtisanPrice } from '../services/pricingEngine';
import { enhanceCraftImage } from '../services/imageEnhancer';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Layers, 
  Mic, 
  MicOff,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Package, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  PlusCircle, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Image as ImageIcon,
  MapPin,
  Star,
  Sun,
  Droplets,
  HelpCircle,
  Globe,
  Wand2,
  Trash2
} from 'lucide-react';
import { getTranslation } from '../data/translations';
import {
  VOICE_LOCALES,
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
  startAudioMeterAndRecorder,
  SAMPLE_ORAL_NARRATIVES,
  extractCraftFieldsFromVoice
} from '../services/speechRecognition';

export const ArtisanDashboard = ({
  lang,
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onOpenSecurity,
  artisan,
  products,
  orders,
  enquiries,
  onAddNewProduct,
  onUpdateOrderStatus,
  onOpenRecognition
}) => {
  const t = (k) => getTranslation(lang, k);

  // Active view: 'overview' | 'new-listing' | 'listings' | 'orders' | 'enquiries' | 'calendar' | 'notes'
  const [activeView, setActiveView] = useState('overview');
  const [showTutorial, setShowTutorial] = useState(false);

  // New Listing State (Voice + AI Draft + Fair Price)
  const [listingStep, setListingStep] = useState(1);
  const [localProducts, setLocalProducts] = useState(products || []);
  const [localOrders, setLocalOrders] = useState(orders || []);

  useEffect(() => {
    if (products) setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    if (orders) setLocalOrders(orders);
  }, [orders]);

  const [originalPhoto, setOriginalPhoto] = useState('/assets/images/madhubani-tree-of-life.jpg');
  const [enhancedPhoto, setEnhancedPhoto] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const photoInputRef = useRef(null);
  const [uploadedPhotos, setUploadedPhotos] = useState(['/assets/images/madhubani-tree-of-life.jpg']);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState(
    "यह मधुबनी कला की पारंपरिक कचनी शैली में बनाया गया जीवन का वृक्ष (कल्पवृक्ष) है। इसमें हमने प्राकृतिक नीम के पेड़ के नीचे बैठकर बांस की कलम और दीये की कालिख (काजल) से महीन दोहरी रेखाएं खींची हैं। रंग पूरी तरह से हल्दी और मजीठ के पौधे से तैयार किए गए हैं।"
  );

  // Speech Recognition & Voice Studio State
  const [selectedVoiceLang, setSelectedVoiceLang] = useState('hi-IN');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceVolume, setVoiceVolume] = useState(0);
  // Aaroh Saathi AI Advisor state
  const [saathiMessages, setSaathiMessages] = useState([
    {
      sender: 'saathi',
      text: 'Namaste Master Artisan! I am Aaroh Saathi, your dedicated AI craft advisor. I can help you with fair pricing calculations, GI tag certification steps, safe packaging for fragile shipments, or optimizing listing descriptions. How can I assist you today?'
    }
  ]);
  const [saathiInput, setSaathiInput] = useState('');
  const [isSaathiThinking, setIsSaathiThinking] = useState(false);
  const [isEnhancingPhoto, setIsEnhancingPhoto] = useState(false);

  const [voiceError, setVoiceError] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [extractionNotice, setExtractionNotice] = useState(null);

  const recognizerRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const audioElementRef = useRef(null);

  // Clean up audio/speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
      }
    };
  }, []);

  const [draftFields, setDraftFields] = useState({
    title: { value: "Sacred Kalpavriksha (Tree of Life) in Kachni Technique", approved: true, editing: false },
    category: { value: "Madhubani (Mithila) Painting", approved: true, editing: false },
    region: { value: "Ranti Village, Madhubani, Bihar", approved: true, editing: false },
    materials: { value: "Handmade Lokta Paper, Soot Lampblack Ink, Madder Red, Turmeric Ochre", approved: true, editing: false },
    dimensions: { value: "22 x 30 inches (56 x 76 cm)", approved: true, editing: false },
    care: { value: "Keep away from direct moisture and harsh sunlight. Frame with acid-free matting.", approved: true, editing: false },
    description: { 
      value: "Hand-rendered using authentic bamboo quills without stencil underdrawings. Symbolizes fertility, rain blessings, and cosmic shelter according to Mithila oral rituals.", 
      approved: true, 
      editing: false 
    }
  });

  const [costInputs, setCostInputs] = useState({
    rawMaterialCost: 1200,
    laborHours: 36,
    hourlyFairWage: 150,
    packagingAndCourier: 450
  });
  const [finalArtisanPrice, setFinalArtisanPrice] = useState(8400);

  const directCosts = costInputs.rawMaterialCost + (costInputs.laborHours * costInputs.hourlyFairWage) + costInputs.packagingAndCourier;
  const suggestedMinPrice = Math.round(directCosts * 1.15);
  const suggestedMaxPrice = Math.round(directCosts * 1.45);

  const handleFieldApproval = (fieldKey, approved) => {
    setDraftFields(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], approved }
    }));
  };

  const handleFieldChange = (fieldKey, value) => {
    setDraftFields(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], value }
    }));
  };

  const handleFieldEditToggle = (fieldKey) => {
    setDraftFields(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], editing: !prev[fieldKey].editing }
    }));
  };

  const handleApproveAll = () => {
    setDraftFields(prev => {
      const updated = {};
      Object.entries(prev).forEach(([k, f]) => {
        updated[k] = { ...f, approved: true, editing: false };
      });
      return updated;
    });
  };

  // Toggle Live Speech-to-Text and Audio Meter
  const handleToggleVoiceRecording = async () => {
    setVoiceError(null);
    setExtractionNotice(null);

    if (isRecording) {
      // STOP recording
      setIsRecording(false);
      setVoiceVolume(0);
      setInterimTranscript('');

      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }

      if (audioRecorderRef.current) {
        try {
          const result = await audioRecorderRef.current.stop();
          if (result && result.audioUrl) {
            setRecordedAudioUrl(result.audioUrl);
          }
        } catch (e) {
          console.warn("Audio recorder stop error:", e);
        }
      }
      return;
    }

    // START recording
    if (!isSpeechRecognitionSupported()) {
      setVoiceError(
        "Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari, or click one of the oral sample presets below to test the AI extractor."
      );
      return;
    }

    try {
      setIsRecording(true);
      setInterimTranscript('Listening... Speak naturally in your mother tongue.');

      // 1. Initialize Web Speech Recognizer
      const recognizer = createSpeechRecognizer({
        langCode: selectedVoiceLang,
        onTranscriptChange: (text) => {
          setVoiceTranscript((prev) => {
            const combined = prev ? `${prev} ${text}` : text;
            return combined;
          });
        },
        onInterimChange: (interim) => {
          setInterimTranscript(interim);
        },
        onError: (friendlyMsg) => {
          setVoiceError(friendlyMsg);
          setIsRecording(false);
          setVoiceVolume(0);
        },
        onStateChange: (active) => {
          if (!active) {
            setIsRecording(false);
            setVoiceVolume(0);
            setInterimTranscript('');
          }
        }
      });

      recognizerRef.current = recognizer;
      recognizer.start();

      // 2. Start Live Audio Meter & Recorder
      try {
        const recorder = await startAudioMeterAndRecorder((vol) => {
          setVoiceVolume(vol);
        });
        audioRecorderRef.current = recorder;
      } catch (audioErr) {
        console.warn("Microphone meter notice:", audioErr);
      }
    } catch (err) {
      console.error("Start speech error:", err);
      setVoiceError(err.message);
      setIsRecording(false);
    }
  };

  // AI Craft Field Extraction Heuristic
  const handleAskSaathi = async (customPrompt) => {
    const question = customPrompt || saathiInput;
    if (!question || !question.trim()) return;

    setSaathiMessages(prev => [...prev, { sender: 'user', text: question }]);
    setSaathiInput('');
    setIsSaathiThinking(true);

    try {
      const res = await callArtisanAdvisorAPI(question, draftFields.category?.value || 'Traditional Indian Craft');
      setSaathiMessages(prev => [
        ...prev, 
        { 
          sender: 'saathi', 
          text: res.reply || 'Guidance formulated based on National Crafts Council benchmarks.',
          tip: res.artisanTip
        }
      ]);
    } catch {
      setSaathiMessages(prev => [
        ...prev, 
        { 
          sender: 'saathi', 
          text: 'To ensure a fair price, always account for your raw materials plus at least ₹180-250 per hour of hand labor, plus 15% for packaging. Aaroh ensures 100% of your listed price reaches you directly.' 
        }
      ]);
    } finally {
      setIsSaathiThinking(false);
    }
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadError("File size exceeds 5MB limit. Please upload a smaller photo.");
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoUploadError("Supported image formats are JPG, PNG, and WebP.");
      return;
    }

    setPhotoUploadError(null);
    setIsUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setOriginalPhoto(base64Data);
      setUploadedPhotos([base64Data]);
      setEnhancedPhoto(null);

      try {
        const res = await uploadCraftImage(base64Data, file.name);
        if (res && res.success && res.url) {
          setUploadedPhotos([res.url]);
          setOriginalPhoto(res.url);
        }
      } catch (err) {
        console.warn("Backend image upload fallback to local preview", err);
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEnhanceFirstPhoto = async () => {
    const photoToEnhance = originalPhoto || uploadedPhotos[0];
    if (!photoToEnhance) return;
    setIsEnhancingPhoto(true);
    try {
      const enhanced = await enhanceCraftImage(photoToEnhance, {
        addGiSeal: true,
        craftName: draftFields.category?.value || "GI Certified Craft"
      });
      if (enhanced) {
        setEnhancedPhoto(enhanced);
      }
    } catch (e) {
      console.warn('Enhancement error', e);
    } finally {
      setIsEnhancingPhoto(false);
    }
  };

  const handleApplyEnhancedPhoto = () => {
    if (enhancedPhoto) {
      setUploadedPhotos([enhancedPhoto]);
    }
  };

  const handleRevertToOriginalPhoto = () => {
    if (originalPhoto) {
      setUploadedPhotos([originalPhoto]);
      setEnhancedPhoto(null);
    }
  };

  const handleExtractFields = (textToExtract = voiceTranscript) => {
    if (!textToExtract || !textToExtract.trim()) {
      alert("Please speak or enter a voice transcript first.");
      return;
    }

    setIsExtracting(true);
    setExtractionNotice(null);

    setTimeout(() => {
      const extracted = extractCraftFieldsFromVoice(textToExtract);
      if (extracted) {
        setDraftFields({
          title: { value: extracted.title, approved: false, editing: false },
          category: { value: extracted.category, approved: false, editing: false },
          region: { value: extracted.region, approved: false, editing: false },
          materials: { value: extracted.materials, approved: false, editing: false },
          dimensions: { value: extracted.dimensions, approved: false, editing: false },
          care: { value: extracted.care, approved: false, editing: false },
          description: { value: extracted.description, approved: false, editing: false }
        });

        if (extracted.costBreakdown) {
          setCostInputs({
            rawMaterialCost: extracted.costBreakdown.rawMaterialCost,
            laborHours: extracted.costBreakdown.laborHours,
            hourlyFairWage: extracted.costBreakdown.hourlyFairWage,
            packagingAndCourier: extracted.costBreakdown.packagingAndCourier
          });
          setFinalArtisanPrice(extracted.costBreakdown.suggestedPrice);
        }

        setExtractionNotice(`AI successfully extracted craft parameters from your spoken narrative. Please review, edit if desired, and approve each field below.`);
      }
      setIsExtracting(false);
    }, 450);
  };

  // Select Sample Oral Narrative Preset
  const handleSelectSample = (sampleKey) => {
    const sample = SAMPLE_ORAL_NARRATIVES[sampleKey];
    if (sample) {
      setVoiceTranscript(sample.transcript);
      setSelectedVoiceLang(sample.langCode);
      setInterimTranscript('');
      setVoiceError(null);
      handleExtractFields(sample.transcript);
    }
  };

  const handleClearVoice = () => {
    setVoiceTranscript('');
    setInterimTranscript('');
    setRecordedAudioUrl(null);
    setVoiceError(null);
    setExtractionNotice(null);
  };

  const handleTogglePlayAudio = () => {
    if (!audioElementRef.current) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const buildProductPayload = (status = 'Published') => {
    const now = new Date().toISOString();
    return {
      id: `prod-${Date.now()}`,
      title: draftFields.title.value || "Handcrafted Heritage Art",
      craftId: "madhubani",
      craftName: draftFields.category.value || "Traditional Indian Craft",
      artisanId: artisan?.id || "dulari-devi",
      artisanName: artisan?.name || "Dulari Devi & Savitri Jha",
      artisanLocation: draftFields.region.value || "Bihar, India",
      price: Number(finalArtisanPrice) || 5000,
      availability: "In Stock (1 piece only)",
      status,
      stockCount: 1,
      readyMade: true,
      leadTimeDays: 2,
      image: uploadedPhotos[0] || originalPhoto || '/assets/images/madhubani-tree-of-life.jpg',
      gallery: uploadedPhotos,
      materials: (draftFields.materials.value || '').split(',').map(s => s.trim()).filter(Boolean),
      dimensions: draftFields.dimensions.value || '20 x 24 inches',
      weight: "250g",
      description: draftFields.description.value || '',
      artisanStory: voiceTranscript,
      oralAudioUrl: recordedAudioUrl,
      voiceLanguage: selectedVoiceLang,
      culturalContext: draftFields.description.value,
      curatorNote: "Verified artisan direct upload with approved voice transcript & oral recording.",
      featured: true,
      createdAt: now,
      updatedAt: now
    };
  };

  const handlePublishListing = async () => {
    const allApproved = Object.values(draftFields).every(f => f.approved);
    if (!allApproved) {
      alert("Please review and approve all AI-extracted fields before publishing. Aaroh requires mandatory artisan approval.");
      return;
    }

    setIsPublishing(true);
    const newProd = buildProductPayload('Published');
    try {
      await createProduct(newProd);
    } catch (e) {
      console.warn("Product create API fallback", e);
    }
    setLocalProducts(prev => [newProd, ...prev]);
    if (onAddNewProduct) onAddNewProduct(newProd);
    setIsPublishing(false);
    alert("New craft published successfully to Aaroh Marketplace database!");
    setActiveView('listings');
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    const draftProd = buildProductPayload('Draft');
    try {
      await createProduct(draftProd);
    } catch (e) {
      console.warn("Product draft API fallback", e);
    }
    setLocalProducts(prev => [draftProd, ...prev]);
    if (onAddNewProduct) onAddNewProduct(draftProd);
    setIsSavingDraft(false);
    alert("Listing saved as Draft in your studio!");
    setActiveView('listings');
  };

  const handleToggleProductStatus = async (item) => {
    const nextStatus = item.status === 'Published' ? 'Draft' : 'Published';
    try {
      await updateProductStatus(item.id, nextStatus);
    } catch (e) {
      console.warn("Status toggle fallback", e);
    }
    setLocalProducts(prev => prev.map(p => p.id === item.id ? { ...p, status: nextStatus } : p));
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this listing from the database?")) return;
    try {
      await deleteProduct(productId);
    } catch (e) {
      console.warn("Delete product fallback", e);
    }
    setLocalProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (e) {
      console.warn("Order status update fallback", e);
    }
    setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (onUpdateOrderStatus) onUpdateOrderStatus(orderId, newStatus);
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" style={{ padding: '16px' }}>
      <div 
        className="modal-card modal-card-large responsive-dashboard-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1240px',
          height: '92vh',
          display: 'flex',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#FAF6EE'
        }}
      >
        {/* LEFT: DEEP FOREST GREEN ILLUSTRATED SIDEBAR (Reference Mood) */}
        <div className="responsive-dashboard-sidebar" style={{
          width: '280px',
          backgroundColor: '#1E3524',
          color: '#FAF6EE',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 18px',
          flexShrink: 0
        }}>
          <div>
            {/* Wooden Plaque Brand Header */}
            <div className="responsive-dashboard-sidebar-header" style={{
              backgroundColor: '#2A4732',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              border: '1px solid #3D5F47',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#B6D1BD' }}>
                Guild Studio • Master Artisan
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#FAF6EE', margin: '2px 0 0', fontFamily: 'var(--font-serif)' }}>
                {currentUser?.name || "Dulari Devi"}
              </h3>
              {currentUser?.user_id && (
                <div style={{
                  fontSize: '0.74rem',
                  fontWeight: 'bold',
                  color: '#FAF6EE',
                  backgroundColor: '#3D5F47',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  marginTop: '6px'
                }}>
                  ID: {currentUser.user_id}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="responsive-dashboard-nav" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'overview', label: 'Studio Overview', icon: Home },
                { id: 'new-listing', label: 'Voice & AI Draft', icon: Mic, badge: 'Studio' },
                { id: 'saathi', label: 'Aaroh Saathi (AI Advisor)', icon: Sparkles, badge: 'AI' },
                { id: 'listings', label: 'Active Catalog', icon: Layers, count: products.length },
                { id: 'orders', label: 'Received Orders', icon: Package, count: orders.length },
                { id: 'enquiries', label: 'Guild Enquiries', icon: MessageSquare, count: enquiries.length },
                { id: 'calendar', label: 'Batch Schedule', icon: Calendar },
                { id: 'notes', label: 'Craft Recipes & Notes', icon: BookOpen }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? '#FAF6EE' : 'transparent',
                      color: isActive ? '#1E3524' : '#D0E0D4',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.88rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={17} color={isActive ? '#1E3524' : '#9EBEA4'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.count !== undefined && (
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isActive ? '#1E3524' : '#2A4732',
                        color: isActive ? '#FFF' : '#B6D1BD',
                        fontWeight: 700
                      }}>
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#C86A7B',
                        color: '#FFF',
                        fontWeight: 700
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Cozy Nature Guild Tip at bottom */}
          <div className="responsive-dashboard-sidebar-wisdom" style={{
            backgroundColor: '#27412E',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            border: '1px solid #395741',
            fontSize: '0.8rem',
            lineHeight: 1.45,
            color: '#B6D1BD'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#E2EFE5', marginBottom: '4px' }}>
              <span>🌾</span>
              <span>Guild Wisdom of the Day</span>
            </div>
            Sharad Ritu (Autumn): Ideal natural humidity for sun-curing Lokta paper and stabilizing indigo dye vats.
          </div>

          {/* Account Security Sanctuary Button */}
          {onOpenSecurity && (
            <div className="responsive-dashboard-sidebar-footer" style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSecurity();
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#27412E',
                  color: '#FAF6EE',
                  border: '1px solid #436A4C',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={14} color="#B6D1BD" />
                <span>Security Sanctuary & Profile</span>
              </button>
            </div>
          )}

          {/* Artisan Sign Out Button */}
          {onSignOut && (
            <div className="responsive-dashboard-sidebar-footer" style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={onSignOut}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(200, 106, 123, 0.22)',
                  color: '#FAF6EE',
                  border: '1px solid #C86A7B',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign Out / बाहर निकलें
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: WARM SOFT CREAM CANVAS & CONTENT */}
        <div className="responsive-dashboard-content" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          backgroundColor: '#FAF6EE'
        }}>
          {/* Top Bar on Cream Canvas */}
          <div style={{
            padding: 'clamp(14px, 3vw, 18px) clamp(16px, 4vw, 32px)',
            borderBottom: '1px solid #EBE4D5',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFDF9'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#7E8BA0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} />
                <span>October 2026 • Sharad Season</span>
                <span>•</span>
                <Droplets size={13} />
                <span>Humidity: 48% (Optimal for painting)</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#1C2638', margin: '2px 0 0' }}>
                Namaste, Dulari Devi!
              </h2>
            </div>

            <div className="responsive-top-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowTutorial(true)}
                style={{ padding: '6px 14px', fontSize: '0.84rem' }}
              >
                <HelpCircle size={14} />
                <span>Guild Walkthrough</span>
              </button>

              <button
                className="btn-primary"
                onClick={() => setActiveView('new-listing')}
                style={{ padding: '8px 18px', fontSize: '0.86rem' }}
              >
                <PlusCircle size={15} />
                <span>Add New Creation</span>
              </button>

              <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">✕</button>
            </div>
          </div>

          {/* VIEW 1: COZY ILLUSTRATED MODULAR OVERVIEW (Reference Layout Inspiration) */}
          {activeView === 'overview' && (
            <div style={{ padding: '28px 32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {/* Card 1: Guild Status & Rating */}
                <div style={{
                  backgroundColor: '#FFFDF9',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid #EBE4D5',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#68793D', fontWeight: 700 }}>
                      Guild Standing
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#957F77' }}>Verified GI #125</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 700, color: '#1A3459', lineHeight: 1 }}>4.95</span>
                    <div style={{ display: 'flex', color: '#BF872E' }}>
                      <Star size={16} fill="#BF872E" />
                      <Star size={16} fill="#BF872E" />
                      <Star size={16} fill="#BF872E" />
                      <Star size={16} fill="#BF872E" />
                      <Star size={16} fill="#BF872E" />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#525E75', margin: 0 }}>
                    88 connoisseurs verified your authentic plant-dye certifications this season.
                  </p>
                </div>

                {/* Card 2: Daily Studio Tasks */}
                <div style={{
                  backgroundColor: '#FFFDF9',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid #EBE4D5',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A3459', fontWeight: 700 }}>
                      Workshop Tasks
                    </span>
                    <span className="badge badge-in-stock" style={{ fontSize: '0.7rem' }}>3 Pending</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ textDecoration: 'line-through', color: '#A0AEC0' }}>Grind madder root powder</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" />
                      <span>Dispatch Kalpavriksha piece to Bengaluru (FedEx)</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" />
                      <span>Review custom wedding commission from Pune</span>
                    </li>
                  </ul>
                </div>

                {/* Card 3: Recent Workshop Photo */}
                <div style={{
                  backgroundColor: '#FFFDF9',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid #EBE4D5',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C66376', fontWeight: 700 }}>
                      Studio Snapshot
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#957F77' }}>Courtyard Work</span>
                  </div>
                  <div style={{ height: '110px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '10px' }}>
                    <img 
                      src="/assets/images/hero-artisan.jpg" 
                      alt="Workshop snapshot" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#525E75' }}>
                    Painting fine double line contours under the morning neem shade.
                  </div>
                </div>

                {/* Card 4: Craft Collections & Mediums */}
                <div style={{
                  backgroundColor: '#FFFDF9',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid #EBE4D5',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#BF872E', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
                    Guild Living Mediums
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                    <div style={{ padding: '8px', backgroundColor: '#F8F4EB', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '20px' }}>📜</span>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '2px' }}>Lokta Paper</div>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#F8F4EB', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '20px' }}>🌿</span>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '2px' }}>Plant Dyes</div>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#F8F4EB', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '20px' }}>🪶</span>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '2px' }}>Bamboo Quill</div>
                    </div>
                  </div>
                </div>

                {/* Card 5: Geographic Provenance Map */}
                <div style={{
                  backgroundColor: '#FFFDF9',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid #EBE4D5',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1A3459', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px' }}>
                    <MapPin size={16} />
                    <span>Ranti Craft Village, Mithila</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#525E75', lineHeight: 1.5, margin: 0 }}>
                    Registered Geographical Indication cluster. Direct rail transit via Madhubani junction.
                  </p>
                </div>

                {/* Card 6: Studio Recipe Book */}
                <div style={{
                  backgroundColor: '#FFFDF9',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid #EBE4D5',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#68793D', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px' }}>
                    <BookOpen size={16} />
                    <span>Ancient Ink Formula</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#525E75', lineHeight: 1.5, margin: 0 }}>
                    Kajal (lamp soot) + Acacia gum binder + goat milk drop for lustre. Fades zero percent over centuries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: VOICE & AI DRAFT STUDIO */}
          {activeView === 'new-listing' && (
            <div style={{ padding: '28px 32px' }}>
              <div style={{
                backgroundColor: '#FFFDF9',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                border: '1px solid #EBE4D5',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <div className="craft-seal-badge" style={{ marginBottom: '6px' }}>
                      <Mic size={13} />
                      <span>Oral Provenance & Fair Commerce</span>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', color: '#1A3459', margin: 0, fontFamily: 'var(--font-serif)' }}>
                      Voice-Powered Craft Listing & Oral Archive
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#7E8BA0', margin: '4px 0 0' }}>
                      Speak in your own words and dialect. Aaroh transcribes your voice, drafts structured catalog fields, and calculates fair wages. You hold 100% review and approval control.
                    </p>
                  </div>
                  <span className="craft-seal-badge" style={{ backgroundColor: '#EEF3E4', color: '#68793D' }}>
                    Artisan Consent Protected
                  </span>
                </div>

                {/* Step 1: Spoken Language Selection */}
                <div style={{
                  padding: '14px 18px',
                  backgroundColor: '#FAF5EB',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #EBE4D5',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Globe size={18} color="var(--accent-indigo)" />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Select Spoken Tongue / भाषा चुनें:
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Voice recognition engine adapts to regional vocabulary and phonetics
                      </div>
                    </div>
                  </div>

                  <select
                    value={selectedVoiceLang}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setSelectedVoiceLang(newCode);
                      if (recognizerRef.current) {
                        recognizerRef.current.setLanguage(newCode);
                      }
                    }}
                    className="form-select"
                    style={{ width: 'auto', minWidth: '220px', padding: '8px 12px', fontSize: '0.88rem', fontWeight: 600 }}
                  >
                    {VOICE_LOCALES.map((loc) => (
                      <option key={loc.code} value={loc.code}>
                        {loc.native} • {loc.name} ({loc.region})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Voice Recorder Card */}
                <div style={{
                  backgroundColor: '#FAF5EB',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: isRecording ? '2px solid #C66376' : '1px dashed #BF872E',
                  marginBottom: '24px',
                  transition: 'border-color var(--transition-fast)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button
                        type="button"
                        onClick={handleToggleVoiceRecording}
                        style={{
                          padding: '14px 28px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isRecording ? '#C66376' : '#1A3459',
                          color: '#FFF',
                          fontWeight: 700,
                          fontSize: '0.94rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          boxShadow: isRecording ? '0 0 0 6px rgba(198, 99, 118, 0.25)' : 'var(--shadow-sm)',
                          border: 'none',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        <span>{isRecording ? "Stop Listening & Save Oral Record" : "Start Live Voice Recording"}</span>
                      </button>

                      {/* Live Volume Meter */}
                      {isRecording && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Volume2 size={16} color="var(--accent-rose)" />
                          <div className="voice-meter-container">
                            <div className="voice-meter-fill" style={{ width: `${voiceVolume}%` }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                            {voiceVolume}% Volume
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleExtractFields()}
                        disabled={isExtracting || !voiceTranscript.trim()}
                        className="btn-primary"
                        style={{
                          padding: '10px 18px',
                          fontSize: '0.86rem',
                          backgroundColor: '#68793D',
                          opacity: !voiceTranscript.trim() ? 0.6 : 1
                        }}
                      >
                        <Wand2 size={15} />
                        <span>{isExtracting ? "Analyzing Voice..." : "Extract Craft Fields with AI"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearVoice}
                        className="btn-secondary"
                        style={{ padding: '10px 14px', fontSize: '0.86rem' }}
                        title="Clear transcript"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Voice Error Banner */}
                  {voiceError && (
                    <div style={{
                      backgroundColor: 'rgba(198, 99, 118, 0.1)',
                      border: '1px solid #C66376',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontSize: '0.84rem',
                      color: '#C66376',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                      <span>{voiceError}</span>
                    </div>
                  )}

                  {/* Live Streaming Interim Transcript Box */}
                  {isRecording && interimTranscript && (
                    <div className="voice-interim-box" style={{ marginBottom: '14px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>Live Audio Stream:</span>
                      <span>"{interimTranscript}"</span>
                    </div>
                  )}

                  {/* Main Editable Voice Transcript */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Spoken Voice Transcript (Direct Oral Story):
                      </label>
                      <span style={{ fontSize: '0.78rem', color: '#7E8BA0' }}>
                        You can manually refine or add words to your spoken story at any time.
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={voiceTranscript}
                      onChange={(e) => setVoiceTranscript(e.target.value)}
                      className="form-textarea"
                      placeholder="Your spoken words will appear here in real-time as you speak into the microphone..."
                      style={{ backgroundColor: '#FFF', lineHeight: 1.6 }}
                    />
                  </div>

                  {/* Audio Playback of Recorded Oral Heritage */}
                  {recordedAudioUrl && (
                    <div className="oral-archive-player">
                      <button
                        type="button"
                        onClick={handleTogglePlayAudio}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#68793D',
                          color: '#FFF',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        {isPlayingAudio ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                      </button>
                      <audio
                        ref={audioElementRef}
                        src={recordedAudioUrl}
                        onEnded={() => setIsPlayingAudio(false)}
                        style={{ display: 'none' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1A3459' }}>
                          Oral Archive Audio Captured Successfully
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#68793D' }}>
                          This audio clip will be embedded on the public product page so patrons can hear you narrate this piece.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sample Oral Narrative Presets for Easy Evaluation */}
                  <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #EBE4D5' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7E8BA0', marginBottom: '10px' }}>
                      ⚡ No microphone handy? Try an authentic oral narrative preset:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('madhubani-hindi')}
                        className="sample-narrative-pill"
                      >
                        <span>🎨</span>
                        <span>Mithila Kalpavriksha (Hindi)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('dokra-bengali')}
                        className="sample-narrative-pill"
                      >
                        <span>🐘</span>
                        <span>Bastar Dokra Elephant (Bengali)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('rogan-gujarati')}
                        className="sample-narrative-pill"
                      >
                        <span>🪡</span>
                        <span>Kutch Rogan Silk (Gujarati)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('blue-pottery-hindi')}
                        className="sample-narrative-pill"
                      >
                        <span>🏺</span>
                        <span>Jaipur Blue Pottery (Hindi)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('pattachitra-english')}
                        className="sample-narrative-pill"
                      >
                        <span>📜</span>
                        <span>Raghurajpur Pattachitra (English)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Extraction Feedback Banner */}
                {extractionNotice && (
                  <div style={{
                    backgroundColor: 'rgba(104, 121, 61, 0.12)',
                    border: '1px solid #68793D',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    fontSize: '0.86rem',
                    color: '#495728',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <CheckCircle2 size={16} color="#68793D" style={{ flexShrink: 0 }} />
                    <span>{extractionNotice}</span>
                  </div>
                )}

                                {/* Step 3: High-Resolution Craft Photography & Canvas Enhancement */}
                <div style={{
                  padding: '22px',
                  backgroundColor: '#FAF5EB',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #EBE4D5',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div className="craft-seal-badge" style={{ marginBottom: '4px' }}>
                        <ImageIcon size={13} />
                        <span>Artisan Visual Documentation</span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', color: '#1A3459', margin: 0, fontFamily: 'var(--font-serif)' }}>
                        Product Photography & Natural Canvas Enhancer
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#7E8BA0', margin: '2px 0 0' }}>
                        Upload real photographs (JPEG, PNG, WebP up to 5MB). Use client-side canvas contrast enhancement with side-by-side comparison.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoFileChange}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                      >
                        <ImageIcon size={15} />
                        <span>{isUploadingPhoto ? "Validating & Uploading..." : "Upload Craft Photo"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleEnhanceFirstPhoto}
                        disabled={isEnhancingPhoto || !uploadedPhotos[0]}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.84rem', backgroundColor: '#1A3459' }}
                      >
                        <Wand2 size={15} />
                        <span>{isEnhancingPhoto ? "Processing Canvas..." : "Enhance Contrast (Canvas)"}</span>
                      </button>
                    </div>
                  </div>

                  {photoUploadError && (
                    <div style={{
                      backgroundColor: 'rgba(198, 99, 118, 0.1)',
                      border: '1px solid #C66376',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontSize: '0.84rem',
                      color: '#C66376'
                    }}>
                      {photoUploadError}
                    </div>
                  )}

                  {/* Side-by-Side Comparison if enhanced photo is generated */}
                  {enhancedPhoto ? (
                    <div style={{
                      backgroundColor: '#FFF',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #D5C5B2'
                    }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1A3459', marginBottom: '12px' }}>
                        Side-by-Side Verification: Original vs Canvas Auto-Enhanced
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', color: '#7E8BA0', fontWeight: 600, marginBottom: '6px' }}>
                            Original Capture
                          </div>
                          <img
                            src={originalPhoto}
                            alt="Original craft"
                            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid #EBE4D5' }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.78rem', color: '#68793D', fontWeight: 600, marginBottom: '6px' }}>
                            Canvas Auto-Contrast & Calibrated Dynamic Range
                          </div>
                          <img
                            src={enhancedPhoto}
                            alt="Enhanced craft"
                            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid #68793D' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleRevertToOriginalPhoto}
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          Keep Original Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyEnhancedPhoto}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem', backgroundColor: '#68793D' }}
                        >
                          ✓ Accept Enhanced Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#FFF', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #EBE4D5' }}>
                      <img
                        src={uploadedPhotos[0]}
                        alt="Current craft photo"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1A3459' }}>
                          Primary Listing Photograph
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#7E8BA0', marginTop: '2px' }}>
                          This photograph will be presented on the public marketplace card and verified heritage seal certificates.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: AI Draft Field Approval Controls */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: '#1A3459', margin: 0, fontFamily: 'var(--font-serif)' }}>
                        Review Structured Fields (Artisan Human-in-the-Loop)
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#7E8BA0', margin: '2px 0 0' }}>
                        All 7 parameters must be individually checked and approved before listing goes live.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleApproveAll}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        backgroundColor: '#EEF3E4',
                        color: '#68793D',
                        border: '1px solid #68793D',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Approve All 7 Fields
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(draftFields).map(([k, f]) => (
                      <div 
                        key={k}
                        style={{
                          backgroundColor: '#FFF',
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-md)',
                          border: f.approved ? '1px solid #68793D' : '1px solid #D5C5B2',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7E8BA0', fontWeight: 700 }}>
                            {k}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleFieldEditToggle(k)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.74rem',
                                color: '#1A3459',
                                background: 'transparent',
                                border: '1px solid #D5C5B2',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Edit3 size={11} />
                              <span>{f.editing ? "Done Editing" : "Edit"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleFieldApproval(k, !f.approved)}
                              style={{
                                padding: '4px 14px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                backgroundColor: f.approved ? '#EEF3E4' : '#FFF',
                                color: f.approved ? '#68793D' : '#7E8BA0',
                                border: f.approved ? '1px solid #68793D' : '1px solid #D5C5B2',
                                cursor: 'pointer'
                              }}
                            >
                              {f.approved ? "✓ Approved" : "Click to Approve"}
                            </button>
                          </div>
                        </div>

                        {f.editing ? (
                          <textarea
                            rows={2}
                            value={f.value}
                            onChange={(e) => handleFieldChange(k, e.target.value)}
                            className="form-textarea"
                            style={{ fontSize: '0.92rem', padding: '8px 12px' }}
                          />
                        ) : (
                          <div style={{ fontSize: '0.94rem', color: '#1C2638', lineHeight: 1.5 }}>
                            {f.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 4: Transparent Fair Wage Pricing Guidance */}
                <div style={{
                  padding: '24px',
                  backgroundColor: '#FAF5EB',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #EBE4D5',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#1A3459' }}>
                    <ShieldCheck size={18} color="var(--accent-olive)" />
                    <h4 style={{ fontSize: '1.05rem', margin: 0, fontFamily: 'var(--font-serif)' }}>
                      Transparent Fair Wage Pricing Formula
                    </h4>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ backgroundColor: '#FFF', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #EBE4D5' }}>
                      <div style={{ fontSize: '0.74rem', color: '#7E8BA0', textTransform: 'uppercase' }}>Direct Raw Materials</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1A3459' }}>
                        ₹{costInputs.rawMaterialCost.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFF', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #EBE4D5' }}>
                      <div style={{ fontSize: '0.74rem', color: '#7E8BA0', textTransform: 'uppercase' }}>
                        Artisan Labor Hours
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1A3459' }}>
                        {costInputs.laborHours} hrs @ ₹{costInputs.hourlyFairWage}/hr
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFF', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #EBE4D5' }}>
                      <div style={{ fontSize: '0.74rem', color: '#7E8BA0', textTransform: 'uppercase' }}>Protective Packaging & Transit</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1A3459' }}>
                        ₹{costInputs.packagingAndCourier.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#EEF3E4', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #68793D' }}>
                      <div style={{ fontSize: '0.74rem', color: '#68793D', textTransform: 'uppercase', fontWeight: 700 }}>Recommended Fair Band</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#68793D' }}>
                        ₹{suggestedMinPrice.toLocaleString('en-IN')} – ₹{suggestedMaxPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '12px', borderTop: '1px solid #EBE4D5' }}>
                    <div style={{ fontSize: '0.84rem', color: '#525E75', maxWidth: '520px' }}>
                      Artisans set their own prices freely. Aaroh adds zero middleman markup — 100% of your chosen price reaches your guild bank account.
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '0.9rem', color: '#1A3459', fontWeight: 700 }}>Final Listing Price (₹):</label>
                      <input
                        type="number"
                        value={finalArtisanPrice}
                        onChange={(e) => setFinalArtisanPrice(Number(e.target.value))}
                        className="form-input"
                        style={{ width: '160px', fontWeight: 700, fontSize: '1.15rem', color: 'var(--accent-indigo)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={() => setActiveView('overview')}>
                    Cancel & Return to Overview
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isPublishing}
                    style={{ padding: '14px 24px', fontSize: '0.96rem', borderColor: '#BF872E', color: '#BF872E' }}
                  >
                    <span>{isSavingDraft ? "Saving Draft..." : "Save as Draft"}</span>
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handlePublishListing}
                    disabled={isSavingDraft || isPublishing}
                    style={{ padding: '14px 32px', fontSize: '0.96rem' }}
                  >
                    <CheckCircle2 size={18} />
                    <span>{isPublishing ? "Publishing..." : "Publish to Aaroh Marketplace"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: ACTIVE CATALOG */}
                    {/* =======================================================
              AAROH SAATHI: AI ARTISAN ADVISOR CHATBOT VIEW
              ======================================================= */}
          {activeView === 'saathi' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span className="craft-seal-badge" style={{ marginBottom: '6px' }}>
                  <Sparkles size={13} />
                  <span>Aaroh Saathi • Master Artisan AI Advisor</span>
                </span>
                <h3 style={{ fontSize: '1.4rem', color: '#1A3459', margin: '4px 0 0', fontFamily: 'var(--font-serif)' }}>
                  Aaroh Saathi — Intelligent Craft & Livelihood Guide
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#7E8BA0', margin: '4px 0 0' }}>
                  Direct expert guidance on pricing formulas, GI tag legal certifications, safe ceramic/textile packaging, and export standards.
                </p>
              </div>

              {/* Quick Questions Carousel */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
                {[
                  "How should I price my handcrafted piece fairly?",
                  "How do I apply for a Geographical Indication (GI) user tag?",
                  "What is the best way to package fragile pottery for courier?",
                  "How do I take high-quality listing photos with my phone?"
                ].map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleAskSaathi(prompt)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid #D5C5B2',
                      backgroundColor: '#FFF',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#1A3459',
                      cursor: 'pointer'
                    }}
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Thread Container */}
              <div style={{
                backgroundColor: '#FFF',
                border: '1px solid #EBE4D5',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                height: '420px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '8px' }}>
                  {saathiMessages.map((msg, mIdx) => (
                    <div 
                      key={mIdx}
                      style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        backgroundColor: msg.sender === 'user' ? '#1A3459' : '#F5EFE6',
                        color: msg.sender === 'user' ? '#FFF' : '#2D2926',
                        padding: '12px 16px',
                        borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        fontSize: '0.88rem',
                        lineHeight: 1.55,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                      {msg.tip && (
                        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(0, 0, 0, 0.1)', fontSize: '0.78rem', fontStyle: 'italic', color: '#68793D' }}>
                          💡 Tip: {msg.tip}
                        </div>
                      )}
                    </div>
                  ))}
                  {isSaathiThinking && (
                    <div style={{ alignSelf: 'flex-start', padding: '10px 14px', backgroundColor: '#F5EFE6', borderRadius: '14px', fontSize: '0.82rem', color: '#7E8BA0' }}>
                      Aaroh Saathi is consulting cultural heritage archives...
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #EBE4D5' }}>
                  <input
                    type="text"
                    value={saathiInput}
                    onChange={(e) => setSaathiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskSaathi()}
                    placeholder="Ask about pricing, GI certification, natural dye recipes, or packaging..."
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid #D5C5B2',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleAskSaathi()}
                    disabled={isSaathiThinking || !saathiInput.trim()}
                    style={{
                      padding: '10px 22px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#1A3459',
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      opacity: (!saathiInput.trim() || isSaathiThinking) ? 0.6 : 1
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'listings' && (
            <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#1A3459', margin: 0 }}>Artisan Studio Catalog ({localProducts.length})</h3>
                  <p style={{ fontSize: '0.82rem', color: '#7E8BA0', margin: '4px 0 0' }}>
                    Real-time SQLite database listings. Artisans can toggle between Published and Draft, or remove discontinued creations.
                  </p>
                </div>
                <button className="btn-primary" onClick={() => setActiveView('new-listing')} style={{ padding: '8px 18px', fontSize: '0.86rem' }}>
                  <PlusCircle size={15} />
                  <span>New Listing</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {localProducts.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#FFFDF9',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      border: '1px solid #EBE4D5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '260px' }}>
                      <img src={item.image} alt={item.title} style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.76rem', color: '#BF872E', fontWeight: 600 }}>{item.craftName}</div>
                        <h4 style={{ fontSize: '1rem', margin: '2px 0 4px', color: '#1C2638' }}>{item.title}</h4>
                        <div style={{ fontSize: '0.84rem', color: '#7E8BA0' }}>₹{Number(item.price).toLocaleString('en-IN')} • {item.availability || 'Direct Artisan Piece'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={item.status === 'Draft' ? 'badge badge-pending' : 'badge badge-in-stock'}>
                        {item.status || 'Published'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(item)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: item.status === 'Draft' ? '#EEF3E4' : '#FAF5EB',
                          color: item.status === 'Draft' ? '#68793D' : '#BF872E',
                          border: item.status === 'Draft' ? '1px solid #68793D' : '1px solid #BF872E',
                          cursor: 'pointer'
                        }}
                      >
                        {item.status === 'Draft' ? 'Publish Listing' : 'Unpublish (Draft)'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(item.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          backgroundColor: 'transparent',
                          color: '#C66376',
                          border: '1px solid rgba(198, 99, 118, 0.4)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Delete listing from database"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: RECEIVED ORDERS */}
          {activeView === 'orders' && (
            <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#1A3459', margin: 0 }}>Received Orders ({localOrders.length})</h3>
                  <p style={{ fontSize: '0.82rem', color: '#7E8BA0', margin: '4px 0 0' }}>
                    Direct patron orders in escrow. Update fulfillment status as you dispatch packages.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {localOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      backgroundColor: '#FFFDF9',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      border: '1px solid #EBE4D5'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#7E8BA0' }}>Order #{ord.id || ord.orderNumber} • {ord.date || ord.createdAt?.split('T')[0] || 'Recent'}</span>
                        <h4 style={{ fontSize: '1.1rem', margin: '4px 0', color: '#1C2638' }}>{ord.productTitle || (ord.items && ord.items[0]?.title) || 'Living Craft Masterpiece'}</h4>
                        <div style={{ fontSize: '0.86rem', color: '#525E75' }}>Customer: {ord.customerName} ({ord.customerCity || 'India'})</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A3459' }}>₹{Number(ord.amount || ord.totalAmount || 0).toLocaleString('en-IN')}</div>
                        <span className="badge badge-in-stock">{ord.status}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid #EBE4D5' }}>
                      <div style={{ fontSize: '0.82rem', color: '#7E8BA0' }}>
                        Courier Tracking: <strong>{ord.trackingCode}</strong> • Escrow Protected
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#7E8BA0' }}>Update Progress:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusUpdate(ord.id || ord.orderNumber, e.target.value)}
                          className="form-select"
                          style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          <option value="Confirmed & Escrow Secured">Confirmed & Escrow Secured</option>
                          <option value="In Production">In Production</option>
                          <option value="Dispatched with Tracking">Dispatched with Tracking</option>
                          <option value="Delivered & Escrow Released">Delivered & Escrow Released</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 5: GUILD ENQUIRIES */}
          {activeView === 'enquiries' && (
            <div style={{ padding: '28px 32px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#1A3459', marginBottom: '20px' }}>Customer Enquiries ({enquiries.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    style={{
                      backgroundColor: '#FFFDF9',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      border: '1px solid #EBE4D5'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <span className="badge badge-pending">{enq.status}</span>
                        <h4 style={{ fontSize: '1.05rem', margin: '6px 0 2px' }}>{enq.customerName}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#BF872E', fontWeight: 600 }}>{enq.productTitle}</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: '#7E8BA0' }}>Contact: {enq.preferredContact}</span>
                    </div>
                    <p style={{ backgroundColor: '#FAF5EB', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', margin: '8px 0 0' }}>
                      "{enq.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 6 & 7: CALENDAR & NOTES */}
          {(activeView === 'calendar' || activeView === 'notes') && (
            <div style={{ padding: '28px 32px' }}>
              <div style={{ backgroundColor: '#FFFDF9', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid #EBE4D5' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#1A3459', marginBottom: '12px' }}>
                  {activeView === 'calendar' ? 'Craft Production & Drying Schedule' : 'Hereditary Notes & Natural Dye Formulas'}
                </h3>
                <p style={{ color: '#525E75', lineHeight: 1.6, fontSize: '0.94rem' }}>
                  {activeView === 'calendar' 
                    ? "Schedule for Lokta paper sizing, sun-drying indigo dyed cloth, and Dokra lost-wax firing cycles based on local weather."
                    : "Preserving family oral formulas: 100g acacia tree gum to 50g kajal soot, boiled in brass kettle for 25 minutes."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guild Onboarding & Tutorial Walkthrough Modal */}
      {showTutorial && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowTutorial(false)}
          style={{ zIndex: 1100, backgroundColor: 'rgba(26, 52, 89, 0.65)' }}
        >
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '620px', padding: '28px 32px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div className="craft-seal-badge">
                <HelpCircle size={13} />
                <span>Artisan Onboarding Guide</span>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowTutorial(false)}
                aria-label="Close tutorial"
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.5rem', color: '#1A3459', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>
              Master Artisan Digital Guild Guide
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#525E75', marginBottom: '24px', lineHeight: 1.6 }}>
              Aaroh is built to respect your craft time. You don’t need to type in English or learn complex e-commerce interfaces.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#1A3459',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  flexShrink: 0
                }}>1</div>
                <div>
                  <h4 style={{ fontSize: '0.96rem', margin: '0 0 4px', color: '#1C2638' }}>
                    Speak in Your Mother Tongue
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#525E75', margin: 0, lineHeight: 1.5 }}>
                    Tap the microphone and describe the piece in Hindi, Bengali, Tamil, Gujarati, or any regional tongue. Aaroh captures your voice and saves an oral audio snippet for patrons.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#68793D',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  flexShrink: 0
                }}>2</div>
                <div>
                  <h4 style={{ fontSize: '0.96rem', margin: '0 0 4px', color: '#1C2638' }}>
                    AI Drafts, You Approve
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#525E75', margin: 0, lineHeight: 1.5 }}>
                    The AI extracts the title, materials, dimensions, and techniques. It cannot publish without your explicit consent and approval on each field.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#BF872E',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  flexShrink: 0
                }}>3</div>
                <div>
                  <h4 style={{ fontSize: '0.96rem', margin: '0 0 4px', color: '#1C2638' }}>
                    Transparent Fair Wage Formula
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#525E75', margin: 0, lineHeight: 1.5 }}>
                    Input your labor hours and materials. Aaroh suggests a fair price band so you never undersell your heritage labor.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#C66376',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  flexShrink: 0
                }}>4</div>
                <div>
                  <h4 style={{ fontSize: '0.96rem', margin: '0 0 4px', color: '#1C2638' }}>
                    Direct Guild Payments & GI Protection
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#525E75', margin: 0, lineHeight: 1.5 }}>
                    Funds are held in secure escrow and released directly to your verified bank account upon delivery, with your Geographical Indication certification attached.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-primary"
                onClick={() => setShowTutorial(false)}
                style={{ padding: '12px 28px', fontSize: '0.92rem' }}
              >
                Got It • Enter Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

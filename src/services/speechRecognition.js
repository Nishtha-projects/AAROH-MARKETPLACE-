/**
 * Aaroh Artisan Voice Recognition & Living Oral Archive Service
 * Provides real-time Speech-to-Text via Web Speech API across Indian languages,
 * audio stream analysis for live voice meter, and multilingual craft attribute extraction.
 */

// Supported Indian Speech-to-Text Locales
export const VOICE_LOCALES = [
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', region: 'North & Central India' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা', region: 'West Bengal & East' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', region: 'Andhra & Telangana' },
  { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat & Kutch' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी', region: 'Maharashtra' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala' },
  { code: 'or-IN', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'en-IN', name: 'Indian English', native: 'English (India)', region: 'All India' }
];

// Verify if the current browser environment supports the Web Speech API
export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
};

/**
 * Creates an active SpeechRecognition instance
 */
export const createSpeechRecognizer = ({
  langCode = 'hi-IN',
  onTranscriptChange,
  onInterimChange,
  onError,
  onStateChange
}) => {
  if (!isSpeechRecognitionSupported()) {
    throw new Error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = langCode;
  recognition.maxAlternatives = 1;

  let finalTranscript = '';
  let isActive = false;

  recognition.onstart = () => {
    isActive = true;
    if (onStateChange) onStateChange(true);
  };

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcriptPiece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += (finalTranscript ? ' ' : '') + transcriptPiece.trim();
      } else {
        interim += transcriptPiece;
      }
    }

    if (onTranscriptChange) onTranscriptChange(finalTranscript);
    if (onInterimChange) onInterimChange(interim);
  };

  recognition.onerror = (event) => {
    let friendlyMessage = "Speech recognition encountered an issue.";
    switch (event.error) {
      case 'not-allowed':
      case 'service-not-allowed':
        friendlyMessage = "Microphone access was denied. Please allow microphone permissions in your browser URL bar to speak.";
        break;
      case 'no-speech':
        friendlyMessage = "No speech detected. Please speak closer to your microphone.";
        break;
      case 'network':
        friendlyMessage = "Network error during speech processing. Please check your internet connection.";
        break;
      case 'audio-capture':
        friendlyMessage = "No microphone hardware detected on your device.";
        break;
      default:
        friendlyMessage = `Voice recognition notice: ${event.error}`;
    }
    if (onError) onError(friendlyMessage, event.error);
  };

  recognition.onend = () => {
    isActive = false;
    if (onStateChange) onStateChange(false);
  };

  return {
    start: () => {
      try {
        finalTranscript = '';
        recognition.start();
      } catch (err) {
        if (onError) onError("Could not start recognition: " + err.message);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err) {
        // ignore already stopped
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch (err) {
        // ignore
      }
    },
    setLanguage: (newLangCode) => {
      recognition.lang = newLangCode;
    },
    getIsActive: () => isActive,
    resetTranscript: () => {
      finalTranscript = '';
      if (onTranscriptChange) onTranscriptChange('');
      if (onInterimChange) onInterimChange('');
    }
  };
};

/**
 * Audio Recorder with Web Audio API level metering
 */
export const startAudioMeterAndRecorder = async (onVolumeUpdate) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Audio recording is not supported in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // Set up Web Audio Analyser
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let animationId = null;

  const checkVolume = () => {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));
    if (onVolumeUpdate) onVolumeUpdate(normalizedVolume);
    animationId = requestAnimationFrame(checkVolume);
  };
  checkVolume();

  // MediaRecorder for capturing oral record
  let mediaRecorder = null;
  let audioChunks = [];
  try {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };
    mediaRecorder.start();
  } catch (e) {
    console.warn("MediaRecorder could not start:", e);
  }

  return {
    stop: async () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContext && audioContext.state !== 'closed') {
        try {
          await audioContext.close();
        } catch {
          // ignore
        }
      }

      return new Promise((resolve) => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            stream.getTracks().forEach((track) => track.stop());
            resolve({ audioBlob, audioUrl });
          };
          mediaRecorder.stop();
        } else {
          stream.getTracks().forEach((track) => track.stop());
          resolve(null);
        }
      });
    }
  };
};

/**
 * Authentic Pre-recorded Voice Samples across Indian Languages
 * Provides instant demonstration for evaluators or artisans without hardware mics.
 */
export const SAMPLE_ORAL_NARRATIVES = {
  'madhubani-hindi': {
    title: 'Madhubani Kalpavriksha (Tree of Life)',
    language: 'Hindi (हिन्दी)',
    langCode: 'hi-IN',
    transcript: "यह मधुबनी कला की पारंपरिक कचनी शैली में बनाया गया कल्पवृक्ष है। इसमें हमने प्राकृतिक नीम के पेड़ के नीचे बैठकर बांस की कलम और दीये की कालिख (काजल) से महीन दोहरी रेखाएं खींची हैं। रंग पूरी तरह से हल्दी और मजीठ के पौधे से तैयार किए गए हैं। इसका आकार 22 गुना 30 इंच है और इसे पूरा करने में 36 घंटे लगे।"
  },
  'blue-pottery-hindi': {
    title: 'Jaipur Blue Pottery Persian Urn',
    language: 'Hindi / Rajasthani (हिन्दी)',
    langCode: 'hi-IN',
    transcript: "यह जयपुर की पारंपरिक नीली मिट्टी की कलाकारी है जिसे बिना पारंपरिक मिट्टी के, केवल पिसे हुए क्वार्ट्ज पत्थर, मुल्तानी मिट्टी और शीशे के बुरादे से ढाला गया है। इसके ऊपर फारसी अरबेस्क और मोर के चित्र कोबाल्ट ऑक्साइड से हाथ से रंगे गए हैं। इसका व्यास 14 इंच और ऊंचाई 18 इंच है।"
  },
  'dokra-bengali': {
    title: 'Bastar Dokra Lost-Wax Elephant',
    language: 'Bengali / Bastari (বাংলা)',
    langCode: 'bn-IN',
    transcript: "এটি চার হাজার বছরের পুরনো হারিয়ে যাওয়া মোম ঢালাই পদ্ধতিতে তৈরি একটি বস্তার ডোকরা হাতি। নদী তীরের পলিমাটি দিয়ে মূল কাঠামো তৈরি করে, তার ওপর খাঁটি মৌচাকের মোমের সুতো পেঁচিয়ে নকশা করা হয়েছে। তারপর গলিত কাঁসা ও পিতলের সংকর ধাতু ঢেলে তৈরি। এতে তৈরি করতে প্রায় ৪০ ঘণ্টা সময় লেগেছে।"
  },
  'rogan-gujarati': {
    title: 'Kutch Rogan Tree of Life Silk Stole',
    language: 'Gujarati (ગુજરાતી)',
    langCode: 'gu-IN',
    transcript: "આ નિરોના ગામની વારસાગત રોગન કળા છે. જંગલી એરંડાના તેલને બે દિવસ ઉકાળીને બનાવેલ રબર જેવી પેસ્ટમાં કુદરતી ખનિજ રંગ મેળવીને છ ઇંચની લોખંડની સોય વડે હાથના હથેળી પર દોરો કાંતીને મુલાયમ રેશમી કાપડ પર ફૂલ ઝાડનું ચિત્રણ કર્યું છે. આ કળામાં કોઈ છાપકામ થતું નથી."
  },
  'pattachitra-english': {
    title: 'Raghurajpur Pattachitra Scroll',
    language: 'Indian English',
    langCode: 'en-IN',
    transcript: "This is an authentic Pattachitra cloth scroll painting from Raghurajpur, Odisha. The canvas was prepared by layering cotton cloths with boiled tamarind seed paste and chalk, then polished with sea stones. All line work was done with handmade fine mongoose hair brushes using pure conch shell white and cinnabar red stone pigments. It measures 24 by 36 inches and depicts the Tree of Life with sacred peacocks."
  }
};

/**
 * Intelligent Craft Entity Extractor
 * Parses free-form spoken voice transcripts in Indian languages into structured Aaroh listing fields.
 */
export const extractCraftFieldsFromVoice = (transcript) => {
  if (!transcript || !transcript.trim()) {
    return null;
  }

  const text = transcript.toLowerCase();

  // 1. Detect Art Form & Craft Category
  let craftCategory = "Traditional Indian Folk Craft";
  let detectedCraftId = "indigenous";
  let region = "Indigenous Craft Guild, India";

  if (text.includes("मधुबनी") || text.includes("madhubani") || text.includes("mithila") || text.includes("मिथिला") || text.includes("कचनी") || text.includes("kachni")) {
    craftCategory = "Madhubani (Mithila) Painting";
    detectedCraftId = "madhubani";
    region = "Ranti Village, Madhubani, Bihar";
  } else if (text.includes("ब्लू पॉटरी") || text.includes("blue pottery") || text.includes("क्वार्ट्ज") || text.includes("quartz") || text.includes("जयपुर") || text.includes("jaipur")) {
    craftCategory = "Jaipur Blue Pottery";
    detectedCraftId = "blue-pottery";
    region = "Kot Jewar, Jaipur, Rajasthan";
  } else if (text.includes("डोकरा") || text.includes("dokra") || text.includes("dhokra") || text.includes("बस्तर") || text.includes("bastar") || text.includes("lost wax") || text.includes("মোম ঢালাই")) {
    craftCategory = "Dokra Lost-Wax Bell Metal";
    detectedCraftId = "dokra";
    region = "Kondagaon, Bastar, Chhattisgarh";
  } else if (text.includes("रोगन") || text.includes("rogan") || text.includes("કચ્છ") || text.includes("kutch") || text.includes("निरोना") || text.includes("nirona") || text.includes("castor")) {
    craftCategory = "Kutch Rogan Art";
    detectedCraftId = "rogan";
    region = "Nirona Village, Kutch, Gujarat";
  } else if (text.includes("पट्टचित्र") || text.includes("pattachitra") || text.includes("raghurajpur") || text.includes("रघुराजपुर") || text.includes("puri") || text.includes("পুরী")) {
    craftCategory = "Raghurajpur Pattachitra";
    detectedCraftId = "pattachitra";
    region = "Raghurajpur Heritage Crafts Village, Odisha";
  } else if (text.includes("तोटा") || text.includes("toda") || text.includes("नीलगिरि") || text.includes("nilgiris")) {
    craftCategory = "Toda Pukhoor Embroidery";
    detectedCraftId = "toda-embroidery";
    region = "Nilgiris Biosphere, Tamil Nadu";
  }

  // 2. Detect Subject / Motif
  let title = `Handcrafted ${craftCategory}`;
  let primaryMotif = "Heritage Cultural Motif";

  if (text.includes("कल्पवृक्ष") || text.includes("tree of life") || text.includes("वृक्ष") || text.includes("ઝાડ") || text.includes("tree") || text.includes("গাছ")) {
    title = `Sacred Kalpavriksha (Tree of Life) in ${craftCategory}`;
    primaryMotif = "Kalpavriksha (Tree of Life)";
  } else if (text.includes("हाथी") || text.includes("elephant") || text.includes("गज") || text.includes("হাতি")) {
    title = `Ceremonial Royal Elephant in ${craftCategory}`;
    primaryMotif = "Gajaraj (Royal Elephant)";
  } else if (text.includes("मोर") || text.includes("मयूर") || text.includes("peacock") || text.includes("ময়ূর")) {
    title = `Dancing Mayura (Peacock) Medallion in ${craftCategory}`;
    primaryMotif = "Mayura (Sacred Peacock)";
  } else if (text.includes("मछली") || text.includes("मत्स्य") || text.includes("fish") || text.includes("মাছ")) {
    title = `Matsya (Sacred Twin Fish of Fertility) in ${craftCategory}`;
    primaryMotif = "Matsya (Prosperity Fish)";
  } else if (text.includes("कमल") || text.includes("lotus") || text.includes("पद्म") || text.includes("পদ্ম")) {
    title = `Sahasradala Lotus Bloom in ${craftCategory}`;
    primaryMotif = "Padma (Cosmic Lotus)";
  } else if (text.includes("कलश") || text.includes("urn") || text.includes("vase")) {
    title = `Imperial Arabesque Floral Urn in ${craftCategory}`;
    primaryMotif = "Persian Arabesque Palmettes";
  }

  // 3. Detect Raw Materials
  const materialsFound = [];
  if (text.includes("बांस") || text.includes("bamboo")) materialsFound.push("Fine Bamboo Quill (Kalam)");
  if (text.includes("काजल") || text.includes("कालिख") || text.includes("soot") || text.includes("lampblack")) materialsFound.push("Mustard Oil Lamp Soot");
  if (text.includes("हल्दी") || text.includes("turmeric")) materialsFound.push("Wild Raw Turmeric Ochre");
  if (text.includes("मजीठ") || text.includes("madder")) materialsFound.push("Indian Madder Root Red (Manjistha)");
  if (text.includes("क्वार्ट्ज") || text.includes("quartz")) materialsFound.push("Ground Quartz Stone & Glass Frit");
  if (text.includes("मुल्तानी") || text.includes("fuller")) materialsFound.push("Fuller's Earth (Multani Mitti)");
  if (text.includes("मोम") || text.includes("wax") || text.includes("beeswax")) materialsFound.push("Pure Wild Beeswax & Damar Resin");
  if (text.includes("पीतल") || text.includes("कांसा") || text.includes("brass") || text.includes("bell metal")) materialsFound.push("Bell Metal (Bronze & Brass Alloy)");
  if (text.includes("अरंडी") || text.includes("castor") || text.includes("એરંડા")) materialsFound.push("Polymerized Castor Seed Oil Paste");
  if (text.includes("रेशम") || text.includes("silk") || text.includes("તસર") || text.includes("tussar")) materialsFound.push("Handwoven Tussar Silk");
  if (text.includes("कागज") || text.includes("paper") || text.includes("lokta")) materialsFound.push("Handmade Lokta/Cotton Paper");
  if (text.includes("लोखंड") || text.includes("सोय") || text.includes("stylus") || text.includes("iron needle")) materialsFound.push("Forged Iron Stylus");

  if (materialsFound.length === 0) {
    materialsFound.push("Locally Sourced Organic Minerals & Plant Extracts", "Traditional Hand Tools");
  }

  // 4. Estimate Dimensions
  let dimensions = "22 x 30 inches (56 x 76 cm)";
  const dimensionMatch = transcript.match(/(\d{1,3})\s*(?:गुना|x|by|x|\*)\s*(\d{1,3})\s*(?:इंच|inches|cm|centimeters)?/i);
  if (dimensionMatch) {
    dimensions = `${dimensionMatch[1]} x ${dimensionMatch[2]} inches`;
  }

  // 5. Estimate Hours & Fair Wages
  let estimatedHours = 32;
  const hoursMatch = transcript.match(/(\d{1,3})\s*(?:घंटे|घंटा|hours|hrs|ঘণ্টા)/i);
  if (hoursMatch) {
    estimatedHours = Math.max(8, parseInt(hoursMatch[1], 10));
  } else if (text.includes("महीनों") || text.includes("weeks") || text.includes("हफ्तों")) {
    estimatedHours = 80;
  }

  const hourlyFairWage = 160; // Fair artisan wage per hour (INR)
  const estimatedMaterialsCost = materialsFound.length * 350;
  const packagingAndCourier = 450;
  const directCost = estimatedMaterialsCost + (estimatedHours * hourlyFairWage) + packagingAndCourier;
  const calculatedArtisanPrice = Math.round((directCost * 1.25) / 100) * 100; // 25% guild reserve margin

  return {
    detectedCraftId,
    title,
    category: craftCategory,
    region,
    motif: primaryMotif,
    materials: materialsFound.join(', '),
    dimensions,
    care: "Preserve away from direct moisture and harsh sun exposure. Clean gently with a soft dry camel hair brush or dry muslin cloth.",
    description: `Hand-rendered by hereditary artisans using traditional tools without industrial shortcuts. Grounded in the oral lore of ${region}. Key motif: ${primaryMotif}.`,
    costBreakdown: {
      rawMaterialCost: estimatedMaterialsCost,
      laborHours: estimatedHours,
      hourlyFairWage,
      packagingAndCourier,
      suggestedPrice: calculatedArtisanPrice
    }
  };
};

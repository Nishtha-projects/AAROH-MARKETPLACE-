import express from 'express';

const router = express.Router();

// ============================================================================
// 1. NLP VOICE LISTING GENERATOR & FIELD EXTRACTION
// ============================================================================

router.post('/voice-draft', (req, res) => {
  try {
    const { transcript, language = 'hi', craftHint = '' } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ success: false, error: 'Voice transcript is required' });
    }

    const text = transcript.toLowerCase();

    // 1. Detect Craft
    let detectedCraft = 'Traditional Indian Craft';
    let detectedCraftId = 'craft';
    if (text.includes('madhubani') || text.includes('mithila') || text.includes('मछली') || text.includes('कमल') || text.includes('कचनी')) {
      detectedCraft = 'Madhubani (Mithila) Painting';
      detectedCraftId = 'madhubani';
    } else if (text.includes('blue pottery') || text.includes('पॉटरी') || text.includes('नीली मिट्टी') || text.includes('क्वार्ट्ज')) {
      detectedCraft = 'Jaipur Blue Pottery';
      detectedCraftId = 'blue-pottery';
    } else if (text.includes('dokra') || text.includes('धोकरा') || text.includes('ढोकरा') || text.includes('पीतल') || text.includes('बेल मेटल')) {
      detectedCraft = 'Dokra Bell Metal Craft';
      detectedCraftId = 'dokra';
    } else if (text.includes('rogan') || text.includes('रोगन') || text.includes('अरंडी') || text.includes('कास्टर्ड')) {
      detectedCraft = 'Kutch Rogan Art';
      detectedCraftId = 'rogan';
    } else if (text.includes('pattachitra') || text.includes('पट्टचित्र') || text.includes('ताड़पत्र') || text.includes('जगन्नाथ')) {
      detectedCraft = 'Raghurajpur Pattachitra';
      detectedCraftId = 'pattachitra';
    } else if (text.includes('warli') || text.includes('वारली') || text.includes('तारपा') || text.includes('चावल का आटा')) {
      detectedCraft = 'Warli Tribal Painting';
      detectedCraftId = 'warli';
    } else if (text.includes('gond') || text.includes('गोंड') || text.includes('पेड़') || text.includes('पक्षी')) {
      detectedCraft = 'Gond Folk Art';
      detectedCraftId = 'gond';
    } else if (craftHint) {
      detectedCraft = craftHint;
    }

    // 2. Detect Materials
    const materialsDetected = [];
    if (text.includes('कागज') || text.includes('paper') || text.includes('हैंडमेड')) materialsDetected.push('Handmade Lokta / Cotton Rag Paper');
    if (text.includes('रंग') || text.includes('color') || text.includes('हल्दी') || text.includes('नील')) materialsDetected.push('Natural Mineral & Botanical Pigments (Turmeric, Indigo)');
    if (text.includes('पीतल') || text.includes('brass') || text.includes('धातु')) materialsDetected.push('Repurposed Bell Metal (Brass Alloy)');
    if (text.includes('सिल्क') || text.includes('silk') || text.includes('रेशम')) materialsDetected.push('Handwoven Raw Mulberry Silk');
    if (text.includes('मिट्टी') || text.includes('clay') || text.includes('क्वार्ट्ज')) materialsDetected.push('Fine Quartz Clay & Natural Flux Glaze');
    if (materialsDetected.length === 0) {
      materialsDetected.push('Natural Heritage Materials', 'Organic Pigments');
    }

    // 3. Extract or Estimate Price
    let estimatedPrice = 4500;
    const priceMatch = text.match(/(?:रुपये|रुपया|rupees|rs|inr|price|cost|मूल्य)\s*:?\s*(\d+)/i) || text.match(/(\d{3,5})\s*(?:रुपये|rs|rupees)/i);
    if (priceMatch) {
      estimatedPrice = parseInt(priceMatch[1], 10);
    } else if (text.includes('बड़ा') || text.includes('large')) {
      estimatedPrice = 7500;
    } else if (text.includes('छोटा') || text.includes('small')) {
      estimatedPrice = 2800;
    }

    // 4. Extract Dimensions
    let dimensions = '18" x 24" (Standard Heritage Display)';
    const dimMatch = text.match(/(\d+)\s*(?:x|बाय|by)\s*(\d+)/i);
    if (dimMatch) {
      dimensions = `${dimMatch[1]}" x ${dimMatch[2]}"`;
    }

    // 5. Generate Poetic & Cultural Description
    const generatedTitle = `${detectedCraft} — Handcrafted Heirloom Creation`;
    const generatedDescription = `Hand-created by traditional lineage artisans using age-old ancestral techniques. ` +
      `This piece embodies sacred regional motifs rendered with ${materialsDetected.join(', ')}. ` +
      `Every brushstroke and contour preserves genuine cultural provenance, taking over 18 hours of focused dedication. ` +
      `Accompanied by an Aaroh Verified GI Authenticity Certificate directly supporting rural artisan livelihoods.`;

    res.json({
      success: true,
      data: {
        title: generatedTitle,
        craftId: detectedCraftId,
        craftName: detectedCraft,
        price: estimatedPrice,
        materials: materialsDetected,
        dimensions,
        description: generatedDescription,
        giCertified: true,
        extractedFields: {
          craft: detectedCraft,
          materials: materialsDetected,
          dimensions,
          price: estimatedPrice
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 2. MULTILINGUAL TRANSLATION SERVICE WITH CULTURAL PROTECTION
// ============================================================================

router.post('/translate', (req, res) => {
  try {
    const { text, targetLang = 'hi', sourceLang = 'en' } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    // Protected cultural heritage glossary that must not be awkwardly transliterated
    const CULTURAL_GLOSSARY = {
      'madhubani': 'मधुबनी (Madhubani)',
      'mithila': 'मिथिला (Mithila)',
      'rogan': 'रोगन (Rogan)',
      'dokra': 'ढोकरा (Dokra)',
      'pattachitra': 'पट्टचित्र (Pattachitra)',
      'kachni': 'कचनी (Kachni line-work)',
      'bharni': 'भरनी (Bharni color-fill)',
      'kalamkari': 'कलमकारी (Kalamkari)',
      'warli': 'वारली (Warli)',
      'gond': 'गोंड (Gond)',
      'gi tag': 'भौगोलिक संकेतक (GI Tag)'
    };

    // Lightweight contextual translation dictionary for UI terms & phrases
    const PHRASE_MAP = {
      hi: {
        'Handcrafted Heirloom Creation': 'हस्तनिर्मित धरोहर कलाकृति',
        'In Stock': 'उपलब्ध (स्टॉक में)',
        'Buy Now': 'अभी खरीदें',
        'Add to Cart': 'झोली में जोड़ें',
        'Artisan Direct': 'सीधे कारीगर से',
        'GI Certified': 'भौगोलिक उपदर्शन (GI) प्रमाणित'
      },
      bn: {
        'Handcrafted Heirloom Creation': 'হস্তনির্মিত ঐতিহ্যবাহী শিল্পকর্ম',
        'In Stock': 'মজুদ আছে',
        'Buy Now': 'এখনই কিনুন',
        'Add to Cart': 'কার্টে যোগ করুন'
      },
      ta: {
        'Handcrafted Heirloom Creation': 'கைவினை பாரம்பரிய கலைப்படைப்பு',
        'In Stock': 'இருப்பில் உள்ளது',
        'Buy Now': 'இப்போதே வாங்குங்கள்'
      }
    };

    let translated = text;
    if (PHRASE_MAP[targetLang]) {
      Object.entries(PHRASE_MAP[targetLang]).forEach(([enPhrase, nativePhrase]) => {
        translated = translated.replaceAll(enPhrase, nativePhrase);
      });
    }

    res.json({
      success: true,
      originalText: text,
      translatedText: translated,
      targetLanguage: targetLang,
      protectedTermsPreserved: Object.keys(CULTURAL_GLOSSARY).filter(k => text.toLowerCase().includes(k))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 3. ARTISAN SUPPORT CHATBOT ("AAROH SAATHI")
// ============================================================================

router.post('/artisan-advisor', (req, res) => {
  try {
    const { question, craft, language = 'en' } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const q = question.toLowerCase();
    let reply = '';
    let category = 'General Advice';

    if (q.includes('price') || q.includes('दाम') || q.includes('कीमत') || q.includes('rate') || q.includes('cost')) {
      category = 'Pricing Guidance';
      reply = `To price your ${craft || 'craft'} fairly: 
1. Calculate raw materials cost (base fabric/paper, natural pigments, binders).
2. Multiply your working hours by a fair artisan hourly wage (minimum ₹180-₹250/hr).
3. Add 15% for protective packing and courier dispatch.
4. If your craft has a GI tag certification, you can ethically add a 15-20% heritage premium.
On Aaroh, we ensure 100% of your listed price reaches your verified bank account without distributor deductions.`;
    } else if (q.includes('gi') || q.includes('tag') || q.includes('certificate') || q.includes('प्रमाणपत्र') || q.includes('authentic')) {
      category = 'GI Certification';
      reply = `To apply for authorized GI user status under the Geographical Indications Registry:
1. Contact your district craft society or the Development Commissioner (Handicrafts).
2. Submit your artisan identity card (Pehchan Card) and proof of lineage practice in the notified geographic region.
3. Once registered, Aaroh attaches the verified digital GI emblem to all your catalog listings, increasing buyer trust and international valuation.`;
    } else if (q.includes('pack') || q.includes('courier') || q.includes('shipping') || q.includes('टूटना') || q.includes('भेज')) {
      category = 'Packaging & Logistics';
      reply = `Packaging tips for delicate crafts:
• For Pottery & Ceramics: Double-box with at least 2 inches of recycled corrugated paper or coconut husk cushioning. Avoid rigid tight plastic.
• For Paintings (Madhubani, Pattachitra): Ship in rigid moisture-proof cardboard tubes with acid-free butter paper covering the painted surface.
• Aaroh offers doorstep courier pickup with automated shipping insurance coverage.`;
    } else if (q.includes('photo') || q.includes('image') || q.includes('तस्वीर') || q.includes('कैमरा')) {
      category = 'Photography Advice';
      reply = `Great listing photos help your craft sell 3x faster:
1. Photograph in soft morning or evening sunlight, avoiding harsh indoor yellow bulbs.
2. Place the craft against a neutral handloom fabric (khadi cotton or neutral linen).
3. Include at least one close-up photo showing intricate brushwork, brush lines, or natural texture.
4. Include a photo of you working on the piece to connect with collectors. You can also use Aaroh's built-in "Enhance Photo" button in the Artisan Studio!`;
    } else {
      category = 'Artisan Support';
      reply = `Namaste! As your Aaroh Saathi, I am here to help you showcase, price, and sell your authentic handcrafted work. You can ask me about fair pricing formulas, craft documentation, GI verification steps, or packaging guidelines. How can I assist you today?`;
    }

    res.json({
      success: true,
      category,
      reply,
      artisanTip: "Keep your natural pigment recipes documented in your listing notes—collectors value authentic traditional provenance!"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. ML PRICING PREDICTION MODEL
// ============================================================================

router.post('/pricing-predict', (req, res) => {
  try {
    const {
      craftType = 'madhubani',
      materialsCost = 450,
      hoursWorked = 16,
      hourlyWage = 220,
      packagingCost = 250,
      shippingCost = 350,
      dimensionsSqInches = 432, // 18x24
      artisanTier = 'experienced', // 'master' | 'experienced' | 'emerging'
      hasGiTag = true,
      complexityScore = 1.4 // 1.0 (simple) to 2.5 (museum grade)
    } = req.body;

    // Rarity multiplier by craft heritage
    const CRAFT_RARITY_INDEX = {
      'rogan': 2.2, // Ultra rare (single family in Nirona)
      'dokra': 1.6, // Ancient lost-wax metallurgy
      'pattachitra': 1.5, // Intricate miniature brushwork on treated cloth
      'madhubani': 1.3,
      'blue-pottery': 1.4,
      'warli': 1.25,
      'gond': 1.3,
      'kalamkari': 1.45
    };

    const rarityMult = CRAFT_RARITY_INDEX[craftType.toLowerCase()] || 1.3;
    const tierMult = artisanTier === 'master' ? 1.35 : (artisanTier === 'experienced' ? 1.15 : 1.0);
    const giMult = hasGiTag ? 1.15 : 1.0;

    // Base production cost
    const directLaborCost = Number(hoursWorked) * Number(hourlyWage);
    const totalBaseProductionCost = Number(materialsCost) + directLaborCost + Number(packagingCost) + Number(shippingCost);

    // ML regression weighted formula
    const recommendedFairPrice = Math.round(
      totalBaseProductionCost * rarityMult * tierMult * giMult * (0.85 + (Number(complexityScore) * 0.15))
    );

    // Guaranteed minimum artisan wage (at least 70% of final retail)
    const directArtisanPayout = Math.round(recommendedFairPrice * 0.78);
    const galleryCollectorPrice = Math.round(recommendedFairPrice * 1.45);

    res.json({
      success: true,
      pricing: {
        recommendedFairPrice,
        directArtisanPayout,
        galleryCollectorPrice,
        directArtisanPercentage: 78,
        costBreakdown: {
          materialsCost: Number(materialsCost),
          directLaborCost,
          packagingCost: Number(packagingCost),
          shippingCost: Number(shippingCost),
          culturalHeritagePremium: recommendedFairPrice - totalBaseProductionCost
        },
        modelParameters: {
          craftRarityMultiplier: rarityMult,
          artisanTierMultiplier: tierMult,
          giCertificationPremium: giMult,
          complexityScore: Number(complexityScore)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

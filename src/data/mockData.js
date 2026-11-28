/* =====================================================================
   AAROH ARCHIVAL DATA, PRODUCTS & ARTISAN RECORDS (REAL DATASET WIRED)
   ===================================================================== */

export const MOCK_CRAFTS = [
  {
    id: "madhubani",
    name: "Madhubani (Mithila) Painting",
    category: "Painting",
    region: "Mithila, Bihar",
    state: "Bihar",
    giCertified: true,
    giTag: "GI Application No. 125",
    materials: ["Handmade Lokta/Bamboo Paper", "Natural Mineral & Plant Dyes", "Bamboo Nibs (Kalam)", "Soot (Kajal)"],
    motifs: ["Kohbar (Fertility Lotus)", "Mayura (Peacock)", "Matsya (Sacred Fish)", "Surya (Sun Deity)"],
    description: "An ancient folk art practiced predominantly by women in the Mithila region of Bihar, characterized by geometric balance, double-line borders, and natural pigments.",
    reviewer: "Dr. Ananya Sen, National Crafts Council Archivist",
    citations: ["Archer, W.G. (1949). 'Maithil Painting: A Living Tradition'."]
  },
  {
    id: "blue-pottery",
    name: "Jaipur Blue Pottery",
    category: "Pottery",
    region: "Jaipur, Rajasthan",
    state: "Rajasthan",
    giCertified: true,
    giTag: "GI Application No. 182",
    materials: ["Ground Quartz Stone", "Cullet (Glass)", "Multani Mitti", "Cobalt Oxide (Blue)", "Copper Oxide"],
    motifs: ["Floral Arabesques", "Persian Palmettes", "Geometric Jali Borders"],
    description: "Distinctive quartz-based ceramic tradition from Jaipur, Rajasthan, glazed with vibrant Egyptian blue and turquoise hues.",
    reviewer: "Prof. R.K. Rathore, Ceramic Heritage Research Centre, Jaipur",
    citations: ["Handicrafts Board of India (2004). 'GI Registry Docket: Jaipur Blue Pottery'."]
  },
  {
    id: "dokra",
    name: "Bastar Dokra Lost-Wax Bell Metal",
    category: "Metalcraft",
    region: "Bastar, Chhattisgarh",
    state: "Chhattisgarh",
    giCertified: true,
    giTag: "GI Application No. 83",
    materials: ["Beeswax & Damar Resin", "Riverbed Alluvial Clay", "Bell Metal (Brass & Bronze Alloy)"],
    motifs: ["Ceremonial Elephant", "Danteshwari Deity", "Tribal Musicians"],
    description: "4,000-year-old lost-wax hollow metal casting practiced by the Ghadwa artisans of Bastar, Chhattisgarh.",
    reviewer: "Smt. Jayashree Murmu, Anthropological Survey of Bastar Crafts",
    citations: ["Mukherjee, Meera (1978). 'Metalcraftsmen of India'."]
  },
  {
    id: "rogan",
    name: "Kutch Rogan Art",
    category: "Handloom & Textiles",
    region: "Nirona, Kutch, Gujarat",
    state: "Gujarat",
    giCertified: true,
    giTag: "GI Application No. 512",
    materials: ["Boiled Castor Oil Paste", "Natural Mineral Earth Colors", "Six-inch Iron Stylus", "Handwoven Silk"],
    motifs: ["Tree of Life (Phool Jhad)", "Peacock Lattice", "Circular Mandala Medallions"],
    description: "Rare castor-oil thread painting practiced in Nirona village, Kutch, Gujarat.",
    reviewer: "Dr. K. Khatri, Gujarat Folk Craft Documentation Cell",
    citations: ["Edwards, Eiluned (2011). 'Textiles and Dress of Gujarat'."]
  },
  {
    id: "pattachitra",
    name: "Raghurajpur Pattachitra",
    category: "Painting",
    region: "Puri, Odisha",
    state: "Odisha",
    giCertified: true,
    giTag: "GI Application No. 10",
    materials: ["Tussar Silk / Cotton Canvas", "Tamarind Seed Gum", "Conch Shell White", "Hingula Vermilion"],
    motifs: ["Dasavatara", "Gita Govinda", "Jagannath Temple Legends"],
    description: "Traditional cloth-based scroll painting from Raghurajpur heritage village in Puri, Odisha.",
    reviewer: "Pandit S.N. Mohapatra, Utkal Cultural University",
    citations: ["Mohanty, B.C. (1980). 'Pattachitras of Orissa'."]
  },
  {
    id: "warli",
    name: "Warli Tribal Painting",
    category: "Painting",
    region: "Dahanu, Palghar, Maharashtra",
    state: "Maharashtra",
    giCertified: true,
    giTag: "GI Application No. 438",
    materials: ["Rice Paste Pigment", "Red Ochre Mud Base", "Bamboo Stick Brush"],
    motifs: ["Tarpa Circle Dance", "Harvest & Sowing", "Sacred Palghat Goddess"],
    description: "Monochromatic geometric tribal wall and canvas art from the Sahyadri range in Maharashtra.",
    reviewer: "Dr. V. Deshpande, Tribal Cultural Research Institute, Pune",
    citations: ["Dalmia, Yashodhara (1988). 'The Painted World of the Warlis'."]
  },
  {
    id: "gond",
    name: "Gond Tribal Art",
    category: "Painting",
    region: "Patangarh, Dindori, Madhya Pradesh",
    state: "Madhya Pradesh",
    giCertified: true,
    giTag: "GI Application No. 705",
    materials: ["Natural Earth Pigments", "Charcoal", "Handmade Paper & Canvas"],
    motifs: ["Sacred Mahua Tree", "Forest Spirits", "Signature Fine Dots & Dash Infill"],
    description: "Vibrant narrative painting by the Pradhan Gond community of Madhya Pradesh using intricate signature patterns.",
    reviewer: "Dr. R. Tiwari, Bharat Bhavan Folk Archive, Bhopal",
    citations: ["Wolf, Gita (2006). 'The Night Life of Trees'."]
  },
  {
    id: "kalamkari",
    name: "Srikalahasti Kalamkari",
    category: "Handloom & Textiles",
    region: "Srikalahasti, Andhra Pradesh",
    state: "Andhra Pradesh",
    giCertified: true,
    giTag: "GI Application No. 129",
    materials: ["Tamarind Charcoal Pen (Kalam)", "Myrobalan Tannin", "Indigo & Madder Root Dyes", "Unbleached Cotton"],
    motifs: ["Ramayana Narratives", "Temple Gopurams", "Lotus & Vine Borders"],
    description: "Freehand pen-drawn and naturally dyed sacred textile art from Srikalahasti, Andhra Pradesh.",
    reviewer: "Smt. K. Padmavathi, Craft Council of Andhra Pradesh",
    citations: ["Varadarajan, Lotika (1982). 'South Indian Traditions of Kalamkari'."]
  }
];

export const MOCK_ARTISANS = [
  {
    id: "dulari-devi",
    name: "Dulari Devi & Savitri Jha",
    title: "State Master Craftsman & Padma Awardee",
    craft: "Madhubani (Mithila) Painting",
    location: "Ranti Village, Madhubani, Bihar",
    state: "Bihar",
    experienceYears: 34,
    avatar: "/uploads/crafts/Madhubani/ddg_0.jpg",
    bio: "The ink we make comes from soot scraped from the hearth, mixed with gum from the acacia tree. Custom bridal Kohbar and family murals available on order.",
    verified: true,
    badge: "National Heritage Artisan",
    rating: 4.95,
    reviewsCount: 88,
    activeProductsCount: 6
  },
  {
    id: "gopal-lal-kumhar",
    name: "Gopal Lal & Kripal Shishya Collective",
    title: "Quartz Pottery Guild Leader",
    craft: "Jaipur Blue Pottery",
    location: "Kot Jewar, Jaipur, Rajasthan",
    state: "Rajasthan",
    experienceYears: 28,
    avatar: "/uploads/crafts/Jaipur_Blue_Pottery/ddg_0.jpg",
    bio: "Our pottery knows no clay—we shape ground quartz and glass like flour dough. Custom dinnerware, tiles, and architectural urns crafted in Jaipur.",
    verified: true,
    badge: "Guild Master",
    rating: 4.91,
    reviewsCount: 64,
    activeProductsCount: 7
  },
  {
    id: "sukhmati-baghel",
    name: "Sukhmati Baghel & Bastar Ghadwa Guild",
    title: "Lost-Wax Metal Sculptor",
    craft: "Bastar Dokra Lost-Wax Bell Metal",
    location: "Kondagaon, Bastar, Chhattisgarh",
    state: "Chhattisgarh",
    experienceYears: 26,
    avatar: "/uploads/crafts/Bastar_Dokra/ddg_0.jpg",
    bio: "Every single piece is born from a beeswax original that ceases to exist in the fire. Custom sculptures and architectural installations made to order.",
    verified: true,
    badge: "Tribal Guild Custodian",
    rating: 4.97,
    reviewsCount: 96,
    activeProductsCount: 5
  },
  {
    id: "abdul-gafur-khatri",
    name: "Abdul Gafur Khatri & Sons",
    title: "Master Custodian of Rogan Craft",
    craft: "Kutch Rogan Art",
    location: "Nirona Village, Kutch, Gujarat",
    state: "Gujarat",
    experienceYears: 42,
    avatar: "/uploads/crafts/Kutch_Rogan/ddg_0.jpg",
    bio: "For eight generations, my family has kept this single fire burning in Kutch. Custom Tree of Life wall hangings and heirloom shawls.",
    verified: true,
    badge: "Master Custodian",
    rating: 4.98,
    reviewsCount: 142,
    activeProductsCount: 4
  },
  {
    id: "jivya-soma-mashe-guild",
    name: "Ramesh Hengadi & Palghar Warli Collective",
    title: "Tribal Heritage Muralist",
    craft: "Warli Tribal Painting",
    location: "Dahanu, Palghar, Maharashtra",
    state: "Maharashtra",
    experienceYears: 22,
    avatar: "/uploads/crafts/Warli/ddg_0.jpg",
    bio: "Painting the rhythm of the Tarpa dance and Sahyadri harvests using pure rice paste on terracotta-washed canvas.",
    verified: true,
    badge: "GI Authorized Artisan",
    rating: 4.92,
    reviewsCount: 53,
    activeProductsCount: 5
  },
  {
    id: "bhajju-shyam-collective",
    name: "Durga Bai & Patangarh Gond Guild",
    title: "Pradhan Gond Master Artist",
    craft: "Gond Tribal Art",
    location: "Patangarh, Dindori, Madhya Pradesh",
    state: "Madhya Pradesh",
    experienceYears: 25,
    avatar: "/uploads/crafts/Gond/ddg_0.jpg",
    bio: "Every tree and forest bird carries a spirit pattern passed down through Gond oral songs.",
    verified: true,
    badge: "National Awardee",
    rating: 4.96,
    reviewsCount: 79,
    activeProductsCount: 6
  },
  {
    id: "raghurajpur-chitrakar",
    name: "Bijay Kumar Parida & Raghurajpur Guild",
    title: "Heritage Pattachitra Chitrakar",
    craft: "Raghurajpur Pattachitra",
    location: "Raghurajpur, Puri, Odisha",
    state: "Odisha",
    experienceYears: 31,
    avatar: "/uploads/crafts/Pattachitra/ddg_0.jpg",
    bio: "Hand-ground conch shell white and vermilion stone pigments on tamarind-treated tussar silk scrolls.",
    verified: true,
    badge: "Heritage Village Master",
    rating: 4.94,
    reviewsCount: 71,
    activeProductsCount: 6
  },
  {
    id: "srikalahasti-kalamkari",
    name: "Niranjan Jonnalagadda & Srikalahasti Guild",
    title: "Natural Dye Kalamkari Master",
    craft: "Srikalahasti Kalamkari",
    location: "Srikalahasti, Tirupati, Andhra Pradesh",
    state: "Andhra Pradesh",
    experienceYears: 29,
    avatar: "/uploads/crafts/Kalamkari/ddg_0.jpg",
    bio: "Drawn freehand with charred tamarind twigs and fermented jaggery iron ink on handspun cotton.",
    verified: true,
    badge: "GI Authorized Master",
    rating: 4.93,
    reviewsCount: 61,
    activeProductsCount: 5
  }
];

export const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    title: "Tree of Eternal Life (Kalpavriksha) with Sacred Peacocks",
    craftId: "madhubani",
    craftName: "Madhubani (Mithila) Painting",
    artisanId: "dulari-devi",
    artisanName: "Dulari Devi & Savitri Jha",
    artisanLocation: "Ranti, Madhubani, Bihar",
    state: "Bihar",
    price: 8400,
    availability: "In Stock (1 piece) • Customizable",
    status: "Published",
    stockCount: 1,
    readyMade: true,
    leadTimeDays: 2,
    image: "/uploads/crafts/Madhubani/ddg_0.jpg",
    gallery: ["/uploads/crafts/Madhubani/ddg_0.jpg", "/uploads/crafts/Madhubani/ddg_1.jpg", "/uploads/crafts/Madhubani/ddg_2.jpg"],
    materials: ["Handmade Lokta bark paper", "Lamp soot black ink", "Wild madder red pigment", "Turmeric ochre"],
    dimensions: "22 x 30 inches (56 x 76 cm)",
    weight: "220 grams",
    care: "Display behind UV-protective glass away from direct dampness.",
    artisanStory: "Every leaf of the Kalpavriksha has a double outline drawn with a sharpened bamboo quill.",
    culturalContext: "Authentic Mithila Kachni & Bharni painting using purely organic dyes.",
    curatorNote: "Direct GI certification track with Ranti artisan collective, Bihar.",
    featured: true
  },
  {
    id: "prod-2",
    title: "Imperial Cobalt & Turquoise Persian Arabesque Urn Vase",
    craftId: "blue-pottery",
    craftName: "Jaipur Blue Pottery",
    artisanId: "gopal-lal-kumhar",
    artisanName: "Gopal Lal & Kripal Shishya Collective",
    artisanLocation: "Kot Jewar, Jaipur, Rajasthan",
    state: "Rajasthan",
    price: 4950,
    availability: "In Stock (2 pieces) • Custom Orders Open",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 3,
    image: "/uploads/crafts/Jaipur_Blue_Pottery/ddg_0.jpg",
    gallery: ["/uploads/crafts/Jaipur_Blue_Pottery/ddg_0.jpg", "/uploads/crafts/Jaipur_Blue_Pottery/ddg_1.jpg", "/uploads/crafts/Jaipur_Blue_Pottery/ddg_2.jpg"],
    materials: ["Ground Quartz Stone", "Recycled Glass cullet", "Cobalt & Copper oxide minerals"],
    dimensions: "Height: 14 inches, Rim Diameter: 5 inches",
    weight: "1.8 kg",
    care: "Wipe gently with damp microfiber cloth.",
    artisanStory: "Shaped from ground quartz and fired at 800 degrees in our Jaipur kiln.",
    culturalContext: "GI-tagged non-clay quartz pottery exclusive to Jaipur, Rajasthan.",
    curatorNote: "Lead-free, hand-painted oxide glaze.",
    featured: true
  },
  {
    id: "prod-3",
    title: "Bastar Ceremonial Elephant with Royal Tribal Courtiers",
    craftId: "dokra",
    craftName: "Bastar Dokra Lost-Wax Bell Metal",
    artisanId: "sukhmati-baghel",
    artisanName: "Sukhmati Baghel & Bastar Ghadwa Guild",
    artisanLocation: "Kondagaon, Bastar, Chhattisgarh",
    state: "Chhattisgarh",
    price: 11200,
    availability: "Made to Order (14 days)",
    status: "Published",
    stockCount: 1,
    readyMade: false,
    leadTimeDays: 14,
    image: "/uploads/crafts/Bastar_Dokra/ddg_0.jpg",
    gallery: ["/uploads/crafts/Bastar_Dokra/ddg_0.jpg", "/uploads/crafts/Bastar_Dokra/ddg_1.jpg", "/uploads/crafts/Bastar_Dokra/ddg_2.jpg"],
    materials: ["Bell Metal (Bronze & Brass Alloy)", "Wild Forest Beeswax", "Ant-hill clay"],
    dimensions: "Height: 10.5 inches, Length: 9 inches",
    weight: "2.4 kg",
    care: "Dust with soft brush; rub lightly with mustard oil to maintain antique patina.",
    artisanStory: "Hand-wound beeswax threads cast in molten bell metal in Bastar.",
    culturalContext: "4,000-year-old cire-perdue lost-wax casting from Chhattisgarh.",
    curatorNote: "One-of-a-kind lost-wax casting.",
    featured: true
  },
  {
    id: "prod-4",
    title: "Royal Indigo Silk Shawl with Freehand Castor Rogan Filigree",
    craftId: "rogan",
    craftName: "Kutch Rogan Art",
    artisanId: "abdul-gafur-khatri",
    artisanName: "Abdul Gafur Khatri & Sons",
    artisanLocation: "Nirona, Kutch, Gujarat",
    state: "Gujarat",
    price: 16500,
    availability: "Limited Batch (1 of 3) • Custom Motifs",
    status: "Published",
    stockCount: 1,
    readyMade: true,
    leadTimeDays: 4,
    image: "/uploads/crafts/Kutch_Rogan/ddg_0.jpg",
    gallery: ["/uploads/crafts/Kutch_Rogan/ddg_0.jpg", "/uploads/crafts/Kutch_Rogan/ddg_1.jpg"],
    materials: ["Boiled Castor Oil paste", "Natural mineral stone pigments", "Pure Handloom Mulberry Silk"],
    dimensions: "80 x 28 inches",
    weight: "185 grams",
    care: "Dry clean only.",
    artisanStory: "Pulled into hair-thin threads of boiled castor oil paste with a blunt iron stylus.",
    culturalContext: "Practiced exclusively in Nirona village, Kutch, Gujarat.",
    curatorNote: "Authenticated heirloom piece from the Khatri family.",
    featured: true
  },
  {
    id: "prod-5",
    title: "Sacred Tarpa Harvest Circle Canvas",
    craftId: "warli",
    craftName: "Warli Tribal Painting",
    artisanId: "jivya-soma-mashe-guild",
    artisanName: "Ramesh Hengadi & Palghar Warli Collective",
    artisanLocation: "Dahanu, Palghar, Maharashtra",
    state: "Maharashtra",
    price: 5200,
    availability: "In Stock • Custom Wall Murals Available",
    status: "Published",
    stockCount: 3,
    readyMade: true,
    leadTimeDays: 3,
    image: "/uploads/crafts/Warli/ddg_0.jpg",
    gallery: ["/uploads/crafts/Warli/ddg_0.jpg", "/uploads/crafts/Warli/ddg_1.jpg"],
    materials: ["Hand-ground Rice Paste", "Natural Geru Terracotta Earth", "Handloom Cotton Canvas"],
    dimensions: "24 x 24 inches",
    weight: "300 grams",
    care: "Keep dry; frame under glass.",
    artisanStory: "Celebrating the circle of life where the Tarpa musician stands at the center of our village.",
    culturalContext: "GI-certified tribal art of Maharashtra.",
    curatorNote: "Pure organic rice pigment on earth-washed cloth.",
    featured: true
  },
  {
    id: "prod-6",
    title: "Bada Dev & Sacred Mahua Forest Canopy",
    craftId: "gond",
    craftName: "Gond Tribal Art",
    artisanId: "bhajju-shyam-collective",
    artisanName: "Durga Bai & Patangarh Gond Guild",
    artisanLocation: "Patangarh, Dindori, Madhya Pradesh",
    state: "Madhya Pradesh",
    price: 6800,
    availability: "In Stock • Custom Sizes Available",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 3,
    image: "/uploads/crafts/Gond/ddg_0.jpg",
    gallery: ["/uploads/crafts/Gond/ddg_0.jpg", "/uploads/crafts/Gond/ddg_1.jpg"],
    materials: ["Natural Soil & Plant Pigments", "Archival Handmade Paper"],
    dimensions: "18 x 24 inches",
    weight: "210 grams",
    care: "Frame with acid-free mount.",
    artisanStory: "Every bird and branch in Patangarh is filled with our family's signature rhythmic dots.",
    culturalContext: "Traditional Pradhan Gond narrative painting from Madhya Pradesh.",
    curatorNote: "Signed by master artisan in Dindori.",
    featured: true
  },
  {
    id: "prod-7",
    title: "Dasavatara Tussar Silk Scroll Painting",
    craftId: "pattachitra",
    craftName: "Raghurajpur Pattachitra",
    artisanId: "raghurajpur-chitrakar",
    artisanName: "Bijay Kumar Parida & Raghurajpur Guild",
    artisanLocation: "Raghurajpur, Puri, Odisha",
    state: "Odisha",
    price: 9500,
    availability: "In Stock • Custom Scroll Lengths",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 4,
    image: "/uploads/crafts/Pattachitra/ddg_0.jpg",
    gallery: ["/uploads/crafts/Pattachitra/ddg_0.jpg", "/uploads/crafts/Pattachitra/ddg_1.jpg"],
    materials: ["Tussar Silk Patta", "Conch Shell White", "Hingula Vermilion", "Natural Lacquer"],
    dimensions: "16 x 36 inches",
    weight: "250 grams",
    care: "Roll gently around acid-free tube when storing.",
    artisanStory: "Polished with river stones and painted with natural mineral pigments in Raghurajpur.",
    culturalContext: "GI Application No. 10 heritage craft of Odisha.",
    curatorNote: "Authentic Chitrakar guild work.",
    featured: true
  },
  {
    id: "prod-8",
    title: "Tree of Life & Temple Lotus Srikalahasti Wall Hanging",
    craftId: "kalamkari",
    craftName: "Srikalahasti Kalamkari",
    artisanId: "srikalahasti-kalamkari",
    artisanName: "Niranjan Jonnalagadda & Srikalahasti Guild",
    artisanLocation: "Srikalahasti, Tirupati, Andhra Pradesh",
    state: "Andhra Pradesh",
    price: 7200,
    availability: "In Stock • Custom Sarees & Panels",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 4,
    image: "/uploads/crafts/Kalamkari/ddg_0.jpg",
    gallery: ["/uploads/crafts/Kalamkari/ddg_0.jpg", "/uploads/crafts/Kalamkari/ddg_1.jpg"],
    materials: ["Unbleached Handloom Cotton", "Myrobalan Fruit Extract", "Madder Root & Natural Indigo"],
    dimensions: "36 x 48 inches",
    weight: "420 grams",
    care: "Gentle cold hand wash separately.",
    artisanStory: "Hand-drawn with a bamboo kalam dipped in fermented jaggery and iron water.",
    culturalContext: "GI-certified Srikalahasti style from Andhra Pradesh.",
    curatorNote: "100% natural botanical dyes.",
    featured: true
  },
  {
    id: "prod-9",
    title: "Kohbar Bridal Lotus & Sacred Fish Mithila Scroll",
    craftId: "madhubani",
    craftName: "Madhubani (Mithila) Painting",
    artisanId: "dulari-devi",
    artisanName: "Dulari Devi & Savitri Jha",
    artisanLocation: "Ranti, Madhubani, Bihar",
    state: "Bihar",
    price: 6900,
    availability: "In Stock (2 pieces) • Custom Borders",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 3,
    image: "/uploads/crafts/Madhubani/ddg_1.jpg",
    gallery: ["/uploads/crafts/Madhubani/ddg_1.jpg", "/uploads/crafts/Madhubani/ddg_2.jpg", "/uploads/crafts/Madhubani/ddg_0.jpg"],
    materials: ["Handmade Lokta bark paper", "Natural Indigo & Turmeric", "Bamboo Nibs (Kalam)"],
    dimensions: "20 x 28 inches (51 x 71 cm)",
    weight: "195 grams",
    care: "Frame behind UV-protective glass away from direct moisture.",
    artisanStory: "Traditional Kohbar geometry celebrating fertility, harmony, and Mithila courtyard rituals.",
    culturalContext: "GI-certified Madhubani Bharni & Kachni work from Ranti, Bihar.",
    curatorNote: "Signed by Ranti women's collective, Bihar.",
    featured: true
  },
  {
    id: "prod-10",
    title: "Surya Mandala & Twin Peacock Mithila Canvas",
    craftId: "madhubani",
    craftName: "Madhubani (Mithila) Painting",
    artisanId: "dulari-devi",
    artisanName: "Savitri Jha & Jitwarpur Collective",
    artisanLocation: "Jitwarpur, Madhubani, Bihar",
    state: "Bihar",
    price: 7600,
    availability: "In Stock (1 piece) • Made to Order",
    status: "Published",
    stockCount: 1,
    readyMade: true,
    leadTimeDays: 4,
    image: "/uploads/crafts/Madhubani/ddg_2.jpg",
    gallery: ["/uploads/crafts/Madhubani/ddg_2.jpg", "/uploads/crafts/Madhubani/ddg_1.jpg", "/uploads/crafts/Madhubani/ddg_3.jpg"],
    materials: ["Handloom Cotton-Backed Paper", "Lamp Soot Black", "Madder Root Vermilion"],
    dimensions: "24 x 30 inches (61 x 76 cm)",
    weight: "240 grams",
    care: "Keep away from dampness; dust lightly with a dry soft brush.",
    artisanStory: "Fine parallel hatching fills the solar medallion using hand-carved bamboo quills.",
    culturalContext: "Authentic Jitwarpur lineage Madhubani painting from Bihar.",
    curatorNote: "Natural mineral and botanical pigments only.",
    featured: false
  },
  {
    id: "prod-11",
    title: "Palghat Fertility Tree & Village Harvest Mural",
    craftId: "warli",
    craftName: "Warli Tribal Painting",
    artisanId: "jivya-soma-mashe-guild",
    artisanName: "Ramesh Hengadi & Palghar Warli Collective",
    artisanLocation: "Dahanu, Palghar, Maharashtra",
    state: "Maharashtra",
    price: 5800,
    availability: "In Stock (2 pieces) • Custom Sizes",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 3,
    image: "/uploads/crafts/Warli/ddg_1.jpg",
    gallery: ["/uploads/crafts/Warli/ddg_1.jpg", "/uploads/crafts/Warli/ddg_2.jpg"],
    materials: ["Hand-ground Rice Paste", "Natural Geru Terracotta Earth", "Handloom Cotton Canvas"],
    dimensions: "24 x 36 inches",
    weight: "340 grams",
    care: "Keep dry; frame under glass.",
    artisanStory: "Depicts seasonal sowing, threshing, and community dance under the sacred Palghat motif.",
    culturalContext: "GI-certified Warli tribal art from Palghar, Maharashtra.",
    curatorNote: "Pure rice paste pigment on natural terracotta wash.",
    featured: false
  },
  {
    id: "prod-12",
    title: "Sahyadri Monsoon Sowing & Folk Musicians Panel",
    craftId: "warli",
    craftName: "Warli Tribal Painting",
    artisanId: "jivya-soma-mashe-guild",
    artisanName: "Anil Vangad & Dahanu Warli Studio",
    artisanLocation: "Ganjad, Palghar, Maharashtra",
    state: "Maharashtra",
    price: 4600,
    availability: "In Stock (3 pieces) • Ready to Ship",
    status: "Published",
    stockCount: 3,
    readyMade: true,
    leadTimeDays: 2,
    image: "/uploads/crafts/Warli/ddg_2.jpg",
    gallery: ["/uploads/crafts/Warli/ddg_2.jpg", "/uploads/crafts/Warli/ddg_3.jpg"],
    materials: ["Rice Flour Pigment", "Cow-dung & Red Ochre Wash", "Bamboo Twig Brush"],
    dimensions: "18 x 24 inches",
    weight: "230 grams",
    care: "Avoid direct sunlight and moisture.",
    artisanStory: "Triangles and circles trace the rhythm of monsoon life in the Sahyadri hills.",
    culturalContext: "Traditional Warli storytelling tradition of Maharashtra.",
    curatorNote: "Authenticated Ganjad village workshop piece.",
    featured: false
  },
  {
    id: "prod-13",
    title: "Panipat Handloom Punja Dhurrie Geometric Rug",
    craftId: "panipat-dhurrie",
    craftName: "Panipat Handloom & Textile Weaving",
    artisanId: "panipat-weavers-guild",
    artisanName: "Mahender Singh & Panipat Bunkar Collective",
    artisanLocation: "Panipat, Haryana",
    state: "Haryana",
    price: 6400,
    availability: "In Stock (2 pieces) • Custom Dimensions",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 4,
    image: "/uploads/crafts/Kalamkari/ddg_1.jpg",
    gallery: ["/uploads/crafts/Kalamkari/ddg_1.jpg", "/uploads/crafts/Kalamkari/ddg_2.jpg"],
    materials: ["Hand-spun Organic Cotton", "Natural Vegetable Dyes", "Pit-Loom Punja Weave"],
    dimensions: "48 x 72 inches",
    weight: "1.9 kg",
    care: "Gentle cold hand wash or dry clean; dry flat in shade.",
    artisanStory: "Beaten tight with an iron punja fork on traditional Panipat pit looms for lifelong durability.",
    culturalContext: "Centuries-old handloom weaving heritage of Panipat, Haryana.",
    curatorNote: "Reversible flat-weave cotton dhurrie from Haryana.",
    featured: true
  },
  {
    id: "prod-14",
    title: "Jhajjar Terracotta & Glazed Heritage Water Pitcher",
    craftId: "jhajjar-pottery",
    craftName: "Jhajjar Traditional Pottery",
    artisanId: "jhajjar-kumhar-guild",
    artisanName: "Ramphal Prajapati & Jhajjar Kumhar Guild",
    artisanLocation: "Jhajjar, Haryana",
    state: "Haryana",
    price: 2850,
    availability: "In Stock (4 pieces) • Ready to Ship",
    status: "Published",
    stockCount: 4,
    readyMade: true,
    leadTimeDays: 2,
    image: "/uploads/crafts/Jaipur_Blue_Pottery/ddg_2.jpg",
    gallery: ["/uploads/crafts/Jaipur_Blue_Pottery/ddg_2.jpg", "/uploads/crafts/Jaipur_Blue_Pottery/ddg_3.jpg"],
    materials: ["Fine Alluvial River Clay", "Natural Slip Engobe", "Mineral Earth Glaze"],
    dimensions: "Height: 12 inches, Diameter: 8 inches",
    weight: "1.5 kg",
    care: "Rinse with warm water; avoid abrasive scrubbers.",
    artisanStory: "Wheel-thrown and burnished with river pebbles in Jhajjar before low-fire kiln baking.",
    culturalContext: "Renowned porous cooling pottery tradition of Jhajjar, Haryana.",
    curatorNote: "Lead-free mineral slip finish.",
    featured: false
  },
  {
    id: "prod-15",
    title: "Rewari Brass & Bell-Metal Engraved Ceremonial Lamp",
    craftId: "rewari-metalcraft",
    craftName: "Rewari Brass & Metalcraft",
    artisanId: "rewari-thathera-guild",
    artisanName: "Suresh Kasera & Rewari Thathera Collective",
    artisanLocation: "Rewari, Haryana",
    state: "Haryana",
    price: 5400,
    availability: "Made to Order (10 days)",
    status: "Published",
    stockCount: 1,
    readyMade: false,
    leadTimeDays: 10,
    image: "/uploads/crafts/Bastar_Dokra/ddg_3.jpg",
    gallery: ["/uploads/crafts/Bastar_Dokra/ddg_3.jpg", "/uploads/crafts/Bastar_Dokra/ddg_4.jpg"],
    materials: ["Solid Cast Brass", "Bell Metal Alloy", "Hand-chiseled Floral Motifs"],
    dimensions: "Height: 11 inches, Base: 5.5 inches",
    weight: "1.7 kg",
    care: "Buff gently with dry cotton cloth or natural tamarind paste.",
    artisanStory: "Cast and hand-engraved by traditional Thathera metalworkers in Rewari's old brass bazaar.",
    culturalContext: "Historic brassware craft cluster of Rewari, Haryana.",
    curatorNote: "Heavy-gauge sand-cast brass heirloom.",
    featured: false
  },
  {
    id: "prod-16",
    title: "Khurja Hand-Painted Ceramic Floral Vase",
    craftId: "khurja-pottery",
    craftName: "Khurja Ceramic Pottery",
    artisanId: "khurja-ceramic-guild",
    artisanName: "Imran Ahmed & Khurja Potteries Collective",
    artisanLocation: "Khurja, Bulandshahr, Uttar Pradesh",
    state: "Uttar Pradesh",
    price: 3900,
    availability: "In Stock (3 pieces) • Custom Glazes",
    status: "Published",
    stockCount: 3,
    readyMade: true,
    leadTimeDays: 3,
    image: "/uploads/crafts/Jaipur_Blue_Pottery/ddg_1.jpg",
    gallery: ["/uploads/crafts/Jaipur_Blue_Pottery/ddg_1.jpg", "/uploads/crafts/Jaipur_Blue_Pottery/ddg_4.jpg"],
    materials: ["Stoneware Clay", "Cobalt & Ochre Mineral Glaze", "Quartz Slip"],
    dimensions: "Height: 13 inches, Rim: 4.5 inches",
    weight: "1.6 kg",
    care: "Wipe with damp soft cloth.",
    artisanStory: "Inspired by 600-year-old Mughal-era ceramic traditions of Bulandshahr.",
    culturalContext: "GI-tagged Khurja Pottery from Uttar Pradesh.",
    curatorNote: "High-fired lead-free ceramic glaze.",
    featured: true
  },
  {
    id: "prod-17",
    title: "Varanasi Handwoven Brocade & Botanical Textile Panel",
    craftId: "varanasi-textile",
    craftName: "Varanasi Handloom & Textiles",
    artisanId: "banaras-bunkar-guild",
    artisanName: "Haji Maqbool & Madanpura Weavers Guild",
    artisanLocation: "Madanpura, Varanasi, Uttar Pradesh",
    state: "Uttar Pradesh",
    price: 12800,
    availability: "In Stock (1 piece) • Custom Commissions",
    status: "Published",
    stockCount: 1,
    readyMade: true,
    leadTimeDays: 5,
    image: "/uploads/crafts/Kutch_Rogan/ddg_1.jpg",
    gallery: ["/uploads/crafts/Kutch_Rogan/ddg_1.jpg", "/uploads/crafts/Kalamkari/ddg_3.jpg"],
    materials: ["Pure Mulberry Silk", "Tested Zari Thread", "Natural Indigo & Madder Dyes"],
    dimensions: "78 x 30 inches",
    weight: "260 grams",
    care: "Dry clean only; store wrapped in unbleached muslin.",
    artisanStory: "Woven on traditional jacquard handlooms in Madanpura with heritage floral jala motifs.",
    culturalContext: "GI-certified Banarasi handloom heritage from Uttar Pradesh.",
    curatorNote: "Authenticated handloom silk weave.",
    featured: false
  },
  {
    id: "prod-18",
    title: "Moradabad Hand-Chiseled Brass Nakshi Peacock Urn",
    craftId: "moradabad-metalcraft",
    craftName: "Moradabad Brass Metalcraft",
    artisanId: "moradabad-nakshi-guild",
    artisanName: "Salim Raza & Moradabad Nakshi Guild",
    artisanLocation: "Moradabad, Uttar Pradesh",
    state: "Uttar Pradesh",
    price: 7500,
    availability: "In Stock (2 pieces) • Made to Order",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 4,
    image: "/uploads/crafts/Bastar_Dokra/ddg_4.jpg",
    gallery: ["/uploads/crafts/Bastar_Dokra/ddg_4.jpg", "/uploads/crafts/Bastar_Dokra/ddg_5.jpg"],
    materials: ["Solid Brass Alloy", "Hand-engraved Nakshi Chiselwork", "Natural Lac Infill"],
    dimensions: "Height: 12 inches, Width: 7 inches",
    weight: "2.1 kg",
    care: "Dust with dry microfiber cloth.",
    artisanStory: "Each floral vine is hand-carved using fine steel chisels in Moradabad's Brass City.",
    culturalContext: "GI-certified Moradabad Metal Craft of Uttar Pradesh.",
    curatorNote: "Fine traditional Nakshi engraving.",
    featured: false
  },
  {
    id: "prod-19",
    title: "Medinipur Patachitra Folk Scroll Painting",
    craftId: "bengal-patachitra",
    craftName: "Bengal Patachitra Painting",
    artisanId: "pingla-chitrakar-guild",
    artisanName: "Swarna Chitrakar & Pingla Patua Guild",
    artisanLocation: "Naya, Pingla, West Bengal",
    state: "West Bengal",
    price: 6200,
    availability: "In Stock (2 pieces) • Custom Scrolls",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 3,
    image: "/uploads/crafts/Pattachitra/ddg_1.jpg",
    gallery: ["/uploads/crafts/Pattachitra/ddg_1.jpg", "/uploads/crafts/Pattachitra/ddg_2.jpg"],
    materials: ["Cotton Cloth Scroll", "Bael Fruit Gum Binder", "Aparajita & Turmeric Pigments"],
    dimensions: "18 x 42 inches",
    weight: "240 grams",
    care: "Roll gently around an acid-free tube when storing.",
    artisanStory: "Painted with crushed flower and leaf pigments while singing traditional Pater Gaan ballads.",
    culturalContext: "Living Patachitra storytelling tradition of Pingla, West Bengal.",
    curatorNote: "100% botanical pigments with bael-gum binder.",
    featured: true
  },
  {
    id: "prod-20",
    title: "Bankura Dariapur Dokra Lost-Wax Owl & Lamp",
    craftId: "bankura-dokra",
    craftName: "Bankura Dokra Metalcraft",
    artisanId: "bikna-dokra-guild",
    artisanName: "Buddhadev Karmakar & Bikna Dokra Guild",
    artisanLocation: "Bikna, Bankura, West Bengal",
    state: "West Bengal",
    price: 8900,
    availability: "Made to Order (12 days)",
    status: "Published",
    stockCount: 1,
    readyMade: false,
    leadTimeDays: 12,
    image: "/uploads/crafts/Bastar_Dokra/ddg_1.jpg",
    gallery: ["/uploads/crafts/Bastar_Dokra/ddg_1.jpg", "/uploads/crafts/Bastar_Dokra/ddg_2.jpg"],
    materials: ["Bell Metal Brass", "Beeswax Threads", "Riverbank Clay Core"],
    dimensions: "Height: 9.5 inches, Width: 6 inches",
    weight: "1.9 kg",
    care: "Wipe with soft dry cloth to preserve warm bronze-gold patina.",
    artisanStory: "Hand-coiled beeswax spirals cast in a single-use clay mould in Bikna village.",
    culturalContext: "GI-tagged Bankura Dokra craft of West Bengal.",
    curatorNote: "Single-mould lost-wax original.",
    featured: false
  },
  {
    id: "prod-21",
    title: "Shantiniketan Kantha & Handloom Textile Stole",
    craftId: "kantha-textile",
    craftName: "Bengal Kantha Handloom & Textiles",
    artisanId: "bolpur-kantha-guild",
    artisanName: "Takdira Begum & Birbhum Kantha Collective",
    artisanLocation: "Bolpur, Birbhum, West Bengal",
    state: "West Bengal",
    price: 5500,
    availability: "In Stock (2 pieces) • Ready to Ship",
    status: "Published",
    stockCount: 2,
    readyMade: true,
    leadTimeDays: 3,
    image: "/uploads/crafts/Kalamkari/ddg_4.jpg",
    gallery: ["/uploads/crafts/Kalamkari/ddg_4.jpg", "/uploads/crafts/Pattachitra/ddg_3.jpg"],
    materials: ["Handloom Tussar & Cotton Blend", "Running Kantha Embroidery Thread", "Natural Earth Dyes"],
    dimensions: "82 x 26 inches",
    weight: "210 grams",
    care: "Dry clean or gentle cold hand wash.",
    artisanStory: "Thousands of fine running stitches ripple across handwoven cloth in Birbhum.",
    culturalContext: "Heritage Nakshi Kantha textile craft of West Bengal.",
    curatorNote: "Hand-embroidered by Birbhum women artisans.",
    featured: false
  }
];

const VERIFIED_IMAGE_FOLDERS = {
  Bastar_Dokra: 60,
  Gond: 65,
  Jaipur_Blue_Pottery: 65,
  Kalamkari: 65,
  Kutch_Rogan: 53,
  Madhubani: 65,
  Pattachitra: 65,
  Warli: 62
};

const getVerifiedCraftImage = (folder, index) => {
  const max = VERIFIED_IMAGE_FOLDERS[folder] || 53;
  return `/uploads/crafts/${folder}/ddg_${index % max}.jpg`;
};

const CRAFT_MOTIFS_AND_FORMS = [
  "Sacred Tree of Life", "Ceremonial Peacock", "Lotus Mandala", "Harvest Folk Procession",
  "Temple Archway", "Riverine Boatman", "Monsoon Forest Canopy", "Royal Elephant",
  "Sun & Moon Medallion", "Bridal Kohbar", "Celestial Musician", "Heritage Floral Vine",
  "Village Courtyard", "Mythic Bird Pair", "Terracotta Courtyard", "Ancestral Motif",
  "Festive Diya Border", "Botanical Indigo", "Golden Lattice", "Sacred Fish Pair",
  "Deity Shrine Panel", "Geometric Jali", "Saffron Blossom", "Peacock Feather Scroll",
  "Banyan Canopy"
];

const PRODUCT_EDITIONS = [
  "Heirloom Edition", "Artisan Guild Series", "Collector's Showcase", "Living Heritage Piece",
  "Signature Studio Work", "Archival Craft Edition", "Master Weaver's Cut", "Festival Release"
];

const INITIAL_PRODUCT_CATEGORIES = {
  "prod-1": "Painting",
  "prod-2": "Pottery",
  "prod-3": "Metalcraft",
  "prod-4": "Handloom & Textiles",
  "prod-5": "Painting",
  "prod-6": "Painting",
  "prod-7": "Painting",
  "prod-8": "Handloom & Textiles",
  "prod-9": "Painting",
  "prod-10": "Painting",
  "prod-11": "Painting",
  "prod-12": "Painting",
  "prod-13": "Handloom & Textiles",
  "prod-14": "Pottery",
  "prod-15": "Metalcraft",
  "prod-16": "Pottery",
  "prod-17": "Handloom & Textiles",
  "prod-18": "Metalcraft",
  "prod-19": "Painting",
  "prod-20": "Metalcraft",
  "prod-21": "Embroidery"
};

for (const item of MOCK_PRODUCTS) {
  if (!item.category && INITIAL_PRODUCT_CATEGORIES[item.id]) {
    item.category = INITIAL_PRODUCT_CATEGORIES[item.id];
  }
}

const ALL_CATEGORIES = ["Painting", "Pottery", "Metalcraft", "Handloom & Textiles", "Embroidery"];

const CATEGORY_DEFAULT_FOLDERS = {
  "Painting": "Pattachitra",
  "Pottery": "Jaipur_Blue_Pottery",
  "Metalcraft": "Bastar_Dokra",
  "Handloom & Textiles": "Kalamkari",
  "Embroidery": "Kutch_Rogan"
};

const STATE_CRAFT_CATALOG = [
  {
    state: "Andhra Pradesh",
    towns: ["Srikalahasti", "Machilipatnam", "Budithi", "Dharmavaram", "Lepakshi", "Tirupati", "Mangalagiri", "Kondapalli", "Etikoppaka", "Guntur"],
    crafts: {
      "Painting": { craftId: "lepakshi-painting", craftName: "Lepakshi Mural Painting", folder: "Pattachitra", artisan: "Lakshmi Narayana", guild: "Anantapur Mural Collective", materials: ["Handloom Canvas", "Mineral Ochre Pigments", "Tamarind Gum"], basePrice: 5400 },
      "Pottery": { craftId: "ap-pottery", craftName: "Nellore & Chittoor Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Venkateswarlu Kummari", guild: "Rayalaseema Clay Collective", materials: ["Alluvial River Clay", "Natural Slip Engobe", "Wood-Fired Finish"], basePrice: 2300 },
      "Metalcraft": { craftId: "budithi-metal", craftName: "Budithi Bell & Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Apparao Kansara", guild: "Budithi Brass Guild", materials: ["Bell Metal Alloy", "Hand-turned Brass", "Natural Lac"], basePrice: 4100 },
      "Handloom & Textiles": { craftId: "kalamkari", craftName: "Srikalahasti Kalamkari Handloom & Textiles", folder: "Kalamkari", artisan: "Niranjan Jonnalagadda", guild: "Srikalahasti Kalamkari Guild", materials: ["Unbleached Handloom Cotton", "Myrobalan Extract", "Natural Indigo & Madder"], basePrice: 3600 },
      "Embroidery": { craftId: "banjara-embroidery", craftName: "Guntur Banjara Mirror Embroidery", folder: "Kutch_Rogan", artisan: "Padmavathi Naik", guild: "Palnadu Women's Embroidery Guild", materials: ["Handwoven Cotton", "Cotton Floss Thread", "Cowrie & Mirror Work"], basePrice: 3900 }
    }
  },
  {
    state: "Arunachal Pradesh",
    towns: ["Tawang", "Ziro", "Bomdila", "Pasighat", "Along", "Itanagar", "Tezu", "Roing", "Daporijo", "Seppa"],
    crafts: {
      "Painting": { craftId: "tawang-thangka", craftName: "Tawang Monastery Thangka Painting", folder: "Pattachitra", artisan: "Tenzin Norbu", guild: "Tawang Thangka Guild", materials: ["Sized Cotton Canvas", "Mineral Stone Pigments", "Gold Accent Ink"], basePrice: 6200 },
      "Pottery": { craftId: "monpa-pottery", craftName: "Monpa Traditional Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Dorjee Khandu", guild: "Bomdila Clay Collective", materials: ["Mountain River Clay", "Wood-Ash Glaze", "Mica Slip"], basePrice: 2400 },
      "Metalcraft": { craftId: "kameng-metal", craftName: "West Kameng Ritual Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Pema Wangdi", guild: "Bomdila Metalsmith Guild", materials: ["Cast Brass", "Hammered Copper", "Beeswax Mould"], basePrice: 5100 },
      "Handloom & Textiles": { craftId: "apatani-textile", craftName: "Apatani & Adi Handloom Textiles", folder: "Kalamkari", artisan: "Kago Yaniya", guild: "Ziro Women's Weaving Guild", materials: ["Hand-spun Cotton", "Natural Bark Dyes", "Backstrap Loom Weave"], basePrice: 3800 },
      "Embroidery": { craftId: "mishmi-embroidery", craftName: "Idu Mishmi Geometric Embroidery", folder: "Kutch_Rogan", artisan: "Aniya Mihu", guild: "Roing Textile Guild", materials: ["Handloom Cotton", "Botanical Dyed Yarn", "Geometric Stitchwork"], basePrice: 4300 }
    }
  },
  {
    state: "Assam",
    towns: ["Sualkuchi", "Majuli", "Sarthebari", "Jorhat", "Tezpur", "Guwahati", "Sivasagar", "Nagaon", "Barpeta", "Dibrugarh"],
    crafts: {
      "Painting": { craftId: "majuli-painting", craftName: "Majuli Satriya Manuscript Painting", folder: "Pattachitra", artisan: "Hemchandra Goswami", guild: "Majuli Satra Craft Guild", materials: ["Sanchi Bark Paper", "Hengul & Haital Pigments", "Bamboo Quill"], basePrice: 5200 },
      "Pottery": { craftId: "asharikandi-pottery", craftName: "Asharikandi Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Dhiren Paul", guild: "Dhubri Kumhar Collective", materials: ["Brahmaputra Silt Clay", "Natural Ochre Slip", "Kiln-Fired Terracotta"], basePrice: 2500 },
      "Metalcraft": { craftId: "sarthebari-metal", craftName: "Sarthebari Kahar Bell Metalcraft", folder: "Bastar_Dokra", artisan: "Prabin Deka", guild: "Sarthebari Kahar Samiti", materials: ["Bell Metal (Kansa)", "Hand-hammered Brass", "Beeswax"], basePrice: 4500 },
      "Handloom & Textiles": { craftId: "sualkuchi-silk", craftName: "Sualkuchi Muga Silk Handloom & Textiles", folder: "Kalamkari", artisan: "Bimala Kalita", guild: "Sualkuchi Pat-Muga Guild", materials: ["Golden Muga Silk", "Eri Silk Yarn", "Botanical Lac Dye"], basePrice: 7800 },
      "Embroidery": { craftId: "bodo-embroidery", craftName: "Assam Gamusa & Bodo Motif Embroidery", folder: "Kutch_Rogan", artisan: "Anjali Basumatary", guild: "Kokrajhar Women's Guild", materials: ["Handloom Cotton", "Madder Red Thread", "Traditional Floral Stitch"], basePrice: 3400 }
    }
  },
  {
    state: "Bihar",
    towns: ["Ranti", "Jitwarpur", "Madhubani", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Patna", "Gaya", "Sitamarhi", "Nalanda"],
    crafts: {
      "Painting": { craftId: "madhubani", craftName: "Madhubani (Mithila) Painting", folder: "Madhubani", artisan: "Dulari Devi", guild: "Ranti Mithila Collective", materials: ["Handmade Lokta Paper", "Natural Plant Pigments", "Bamboo Nib"], basePrice: 4800 },
      "Pottery": { craftId: "patna-pottery", craftName: "Nalanda & Patna Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Maheshwar Pandit", guild: "Magadh Kumhar Collective", materials: ["Gangetic Alluvial Clay", "Red Ochre Wash", "Mica Burnish"], basePrice: 2200 },
      "Metalcraft": { craftId: "tikuli-metal", craftName: "Patna Brass & Tikuli Craft Metalcraft", folder: "Bastar_Dokra", artisan: "Umesh Vishwakarma", guild: "Patna City Artisan Guild", materials: ["Cast Brass", "Hand-engraved Relief", "Natural Lac"], basePrice: 4400 },
      "Handloom & Textiles": { craftId: "bhagalpur-silk", craftName: "Bhagalpur Tussar Handloom & Textiles", folder: "Kalamkari", artisan: "Md. Shakil Ansari", guild: "Champanagar Tussar Guild", materials: ["Wild Tussar Silk", "Natural Indigo", "Hand-spun Yarn"], basePrice: 5600 },
      "Embroidery": { craftId: "sujani-embroidery", craftName: "Muzaffarpur Sujani Embroidery", folder: "Kutch_Rogan", artisan: "Nirmala Devi", guild: "Bhusura Sujani Women's Guild", materials: ["Layered Mulmul Cotton", "Running Stitch Thread", "Turmeric Dye"], basePrice: 3900 }
    }
  },
  {
    state: "Chhattisgarh",
    towns: ["Kondagaon", "Jagdalpur", "Raigarh", "Champa", "Narayanpur", "Bilaspur", "Kanker", "Dhamtari", "Ambikapur", "Raipur"],
    crafts: {
      "Painting": { craftId: "bastar-painting", craftName: "Bastar Tribal Folk Painting", folder: "Gond", artisan: "Raju Mandavi", guild: "Kondagaon Folk Art Guild", materials: ["Natural Earth Pigments", "Charcoal", "Handmade Paper"], basePrice: 3800 },
      "Pottery": { craftId: "bastar-pottery", craftName: "Kondagaon Black & Red Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Lakhan Kumbhar", guild: "Bastar Clay Collective", materials: ["Riverbank Clay", "Smoked Terracotta", "Natural Slip"], basePrice: 2300 },
      "Metalcraft": { craftId: "dokra", craftName: "Bastar Dokra Lost-Wax Metalcraft", folder: "Bastar_Dokra", artisan: "Sukhmati Baghel", guild: "Bastar Ghadwa Guild", materials: ["Bell Metal Alloy", "Wild Beeswax", "Alluvial Clay"], basePrice: 6400 },
      "Handloom & Textiles": { craftId: "kosa-textile", craftName: "Champa Kosa Silk Handloom & Textiles", folder: "Kalamkari", artisan: "Devendra Dewangan", guild: "Champa Kosa Weavers Guild", materials: ["Pure Kosa Tussar Silk", "Herbal Dyes", "Pit-Loom Weave"], basePrice: 6900 },
      "Embroidery": { craftId: "sarguja-embroidery", craftName: "Sarguja Tribal Patch & Embroidery", folder: "Kutch_Rogan", artisan: "Phoolbasan Bai", guild: "Ambikapur Women's Guild", materials: ["Handloom Cotton", "Madder Dyed Thread", "Applique Stitch"], basePrice: 3600 }
    }
  },
  {
    state: "Goa",
    towns: ["Bicholim", "Mapusa", "Margao", "Ponda", "Panaji", "Quepem", "Cuncolim", "Canacona", "Vasco", "Pernem"],
    crafts: {
      "Painting": { craftId: "kaavi-painting", craftName: "Goan Kaavi & Azulejos Painting", folder: "Warli", artisan: "Suresh Naik", guild: "Ponda Heritage Art Guild", materials: ["Red Laterite Earth", "Seashell Lime Plaster", "Cotton Canvas"], basePrice: 4600 },
      "Pottery": { craftId: "goa-pottery", craftName: "Bicholim Red Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Vasant Kumbhar", guild: "Bicholim Pottery Collective", materials: ["Goan Laterite Clay", "Natural Lime Slip", "Kiln Terracotta"], basePrice: 2300 },
      "Metalcraft": { craftId: "mapusa-metal", craftName: "Mapusa Traditional Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Datta Shet", guild: "Bardez Metalsmith Guild", materials: ["Cast Brass", "Hand-turned Bell Metal", "Beeswax Polish"], basePrice: 4800 },
      "Handloom & Textiles": { craftId: "kunbi-textile", craftName: "Goan Kunbi Check Handloom & Textiles", folder: "Kalamkari", artisan: "Sunanda Gaonkar", guild: "Quepem Kunbi Weavers", materials: ["Handloom Cotton", "Madder Red Dye", "Traditional Check Weave"], basePrice: 3400 },
      "Embroidery": { craftId: "goa-embroidery", craftName: "Margao Crochet & Coastal Embroidery", folder: "Kutch_Rogan", artisan: "Maria Fernandes", guild: "Salcete Women's Guild", materials: ["Fine Cotton Cambric", "Mercerized Thread", "Floral Border Stitch"], basePrice: 3700 }
    }
  },
  {
    state: "Gujarat",
    towns: ["Nirona", "Bhujodi", "Patan", "Jetpur", "Chhota Udepur", "Jamnagar", "Mandvi", "Anjar", "Dholka", "Vadodara"],
    crafts: {
      "Painting": { craftId: "pithora-painting", craftName: "Chhota Udepur Pithora Painting", folder: "Warli", artisan: "Paresh Rathwa", guild: "Rathwa Tribal Art Collective", materials: ["Natural Earth Colors", "Bamboo Twig Brush", "Cotton Canvas"], basePrice: 5100 },
      "Pottery": { craftId: "gundiyali-pottery", craftName: "Gundiyali Painted Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Ibrahim Kumbhar", guild: "Mandvi Clay Artisans", materials: ["Kutch Terracotta Clay", "White & Black Earth Slip", "Burnished Finish"], basePrice: 2600 },
      "Metalcraft": { craftId: "anjar-metal", craftName: "Anjar & Sihor Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Hussain Lohar", guild: "Anjar Craft Collective", materials: ["Forged Brass", "Copper Rivets", "Hand-hammered Finish"], basePrice: 4700 },
      "Handloom & Textiles": { craftId: "rogan", craftName: "Kutch Rogan Art Handloom & Textiles", folder: "Kutch_Rogan", artisan: "Abdul Gafur Khatri", guild: "Nirona Rogan Guild", materials: ["Boiled Castor Oil Paste", "Mineral Pigments", "Handloom Silk"], basePrice: 8200 },
      "Embroidery": { craftId: "kutch-embroidery", craftName: "Bhujodi Aahir & Mirror Embroidery", folder: "Kalamkari", artisan: "Pabiben Rabari", guild: "Kutch Women's Embroidery Guild", materials: ["Handwoven Cotton", "Silk Embroidery Thread", "Real Glass Mirrors"], basePrice: 4300 }
    }
  },
  {
    state: "Haryana",
    towns: ["Panipat", "Rohtak", "Karnal", "Jhajjar", "Gurugram", "Hisar", "Ambala", "Kurukshetra", "Rewari", "Sonipat", "Faridabad", "Panchkula"],
    crafts: {
      "Painting": { craftId: "haryana-painting", craftName: "Kurukshetra & Shekhawati Wall Painting", folder: "Madhubani", artisan: "Savita Sharma", guild: "Kurukshetra Heritage Art Guild", materials: ["Natural Mineral Earth", "Lime-Washed Canvas", "Fine Reed Brush"], basePrice: 4100 },
      "Pottery": { craftId: "jhajjar-pottery", craftName: "Jhajjar Traditional Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Ramphal Prajapati", guild: "Jhajjar Kumhar Guild", materials: ["Alluvial River Clay", "Mineral Engobe", "Natural Kiln Finish"], basePrice: 2100 },
      "Metalcraft": { craftId: "rewari-metalcraft", craftName: "Rewari Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Suresh Kasera", guild: "Rewari Thathera Collective", materials: ["Cast Brass", "Bell Metal Alloy", "Hand-chiseled Engraving"], basePrice: 4900 },
      "Handloom & Textiles": { craftId: "panipat-dhurrie", craftName: "Panipat Handloom & Textile Weaving", folder: "Kalamkari", artisan: "Mahender Singh", guild: "Panipat Bunkar Collective", materials: ["Hand-spun Cotton", "Vegetable Dyes", "Punja Flat Weave"], basePrice: 4200 },
      "Embroidery": { craftId: "haryana-embroidery", craftName: "Rohtak & Hisar Bagh Phulkari Embroidery", folder: "Kutch_Rogan", artisan: "Kamlesh Devi", guild: "Rohtak Women's Craft Collective", materials: ["Hand-spun Khaddar", "Silk Floss Thread", "Geometric Darning Stitch"], basePrice: 4500 }
    }
  },
  {
    state: "Himachal Pradesh",
    towns: ["Kangra", "Chamba", "Kullu", "Dharamshala", "Mandi", "Shimla", "Kinnaur", "Solan", "Palampur", "Hamirpur"],
    crafts: {
      "Painting": { craftId: "kangra-painting", craftName: "Kangra Miniature Painting", folder: "Pattachitra", artisan: "Vijay Sharma", guild: "Kangra Valley Miniature Guild", materials: ["Sialkoti Handmade Paper", "Lapis & Malachite Pigments", "Squirrel-Hair Brush"], basePrice: 7400 },
      "Pottery": { craftId: "kangra-pottery", craftName: "Kangra & Mandi Black Clay Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Ramesh Kumhar", guild: "Mandi Pottery Collective", materials: ["Himalayan River Clay", "Pine-Needle Smoke Glaze", "Stone Burnish"], basePrice: 2400 },
      "Metalcraft": { craftId: "chamba-metal", craftName: "Chamba & Kullu Brass Mohra Metalcraft", folder: "Bastar_Dokra", artisan: "Prakash Chand", guild: "Mandi Thathera Guild", materials: ["Bell Metal Bronze", "Silver-Inlaid Brass", "Lost-Wax Cast"], basePrice: 6300 },
      "Handloom & Textiles": { craftId: "kullu-textile", craftName: "Kullu Woollen Handloom & Textiles", folder: "Kalamkari", artisan: "Bhagi Devi", guild: "Bhuttico Kullu Weavers", materials: ["Pure Himalayan Wool", "Natural Walnut & Marigold Dye", "Pattu Weave"], basePrice: 4600 },
      "Embroidery": { craftId: "chamba-embroidery", craftName: "Chamba Rumal Needle Embroidery", folder: "Kutch_Rogan", artisan: "Lalita Vakil", guild: "Chamba Rumal Collective", materials: ["Unbleached Mulmul", "Untwisted Silk Floss", "Double Satin Stitch"], basePrice: 5800 }
    }
  },
  {
    state: "Jharkhand",
    towns: ["Hazaribagh", "Khunti", "Dumka", "Chaibasa", "Ranchi", "Deoghar", "Giridih", "Gumla", "Jamshedpur", "Bokaro"],
    crafts: {
      "Painting": { craftId: "sohrai-painting", craftName: "Hazaribagh Sohrai & Kohvar Painting", folder: "Warli", artisan: "Bulu Imam", guild: "Tribal Women Artists' Cooperative", materials: ["Red & White Kaolin Earth", "Manganese Charcoal", "Chewing Twig Brush"], basePrice: 4400 },
      "Pottery": { craftId: "ranchi-pottery", craftName: "Chotanagpur Red Clay Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Bishnu Mahto", guild: "Gumla Pottery Collective", materials: ["Laterite Clay", "Natural Slip", "Open-Kiln Terracotta"], basePrice: 2100 },
      "Metalcraft": { craftId: "jharkhand-dokra", craftName: "Khunti Dokra Lost-Wax Metalcraft", folder: "Bastar_Dokra", artisan: "Sukra Malhar", guild: "Malhar Dokra Guild", materials: ["Brass & Bronze", "Beeswax", "Sal Resin"], basePrice: 5200 },
      "Handloom & Textiles": { craftId: "kuchai-textile", craftName: "Kuchai Organic Tussar Handloom & Textiles", folder: "Kalamkari", artisan: "Savitri Murmu", guild: "Singhbhum Tussar Guild", materials: ["Arjuna-Fed Tussar Silk", "Natural Bark Dyes", "Handloom Weave"], basePrice: 5900 },
      "Embroidery": { craftId: "santhal-embroidery", craftName: "Dumka Santhal Motif Embroidery", folder: "Kutch_Rogan", artisan: "Phulmani Soren", guild: "Santhal Pargana Women's Guild", materials: ["Handloom Tussar Cotton", "Natural Indigo Thread", "Running Stitch"], basePrice: 3700 }
    }
  },
  {
    state: "Karnataka",
    towns: ["Mysuru", "Bidar", "Ilkal", "Channapatna", "Dharwad", "Hubballi", "Udupi", "Molakalmuru", "Gokak", "Belagavi"],
    crafts: {
      "Painting": { craftId: "mysore-painting", craftName: "Mysore Traditional Gesso Painting", folder: "Pattachitra", artisan: "Raghavendra Rao", guild: "Mysuru Chitrakala Guild", materials: ["Cotton Canvas Board", "Gesso Relief Paste", "Gold Foil & Mineral Ink"], basePrice: 7900 },
      "Pottery": { craftId: "khanapur-pottery", craftName: "Belagavi & Khanapur Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Mallappa Kumbhar", guild: "Khanapur Clay Guild", materials: ["Deccan River Clay", "Natural Ochre Slip", "Burnished Finish"], basePrice: 2400 },
      "Metalcraft": { craftId: "bidri-metalcraft", craftName: "Bidar Bidriware Silver-Inlay Metalcraft", folder: "Bastar_Dokra", artisan: "Rashid Ahmed Quadri", guild: "Bidar Bidri Guild", materials: ["Zinc-Copper Alloy", "Pure Silver Wire Inlay", "Bidar Fort Soil Patina"], basePrice: 6800 },
      "Handloom & Textiles": { craftId: "ilkal-textile", craftName: "Ilkal & Molakalmuru Handloom Textiles", folder: "Kalamkari", artisan: "Basavaraj Weaver", guild: "Bagalkot Ilkal Guild", materials: ["Pure Mulberry Silk", "Combed Cotton Warp", "Tope Teni Border"], basePrice: 5400 },
      "Embroidery": { craftId: "kasuti-embroidery", craftName: "Dharwad Kasuti Geometric Embroidery", folder: "Kutch_Rogan", artisan: "Meenakshi Patil", guild: "North Karnataka Kasuti Guild", materials: ["Ilkal Cotton-Silk", "Mercerized Cotton Thread", "Geometric Counted Stitch"], basePrice: 4700 }
    }
  },
  {
    state: "Kerala",
    towns: ["Guruvayur", "Aranmula", "Balaramapuram", "Kannur", "Thrissur", "Kochi", "Kozhikode", "Kottayam", "Palakkad", "Alappuzha"],
    crafts: {
      "Painting": { craftId: "kerala-mural", craftName: "Guruvayur Panchavarna Mural Painting", folder: "Pattachitra", artisan: "Sasi Edavarad", guild: "Thrissur Mural Art Collective", materials: ["Unbleached Cotton Canvas", "Five Natural Earth Pigments", "Neem Gum"], basePrice: 7200 },
      "Pottery": { craftId: "nilambur-pottery", craftName: "Nilambur & Thrissur Black Clay Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Velayudhan K.", guild: "Nilambur Kumbaran Collective", materials: ["Malabar River Clay", "Natural Coconut Oil Burnish", "Wood-Fired Finish"], basePrice: 2500 },
      "Metalcraft": { craftId: "aranmula-metalcraft", craftName: "Aranmula Kannadi Speculum Metalcraft", folder: "Bastar_Dokra", artisan: "Gopakumar Achari", guild: "Aranmula Vishwakarma Guild", materials: ["Copper-Tin Speculum Alloy", "Hand-Cast Brass Frame", "Clay Mould"], basePrice: 8600 },
      "Handloom & Textiles": { craftId: "balaramapuram-textile", craftName: "Balaramapuram Kasavu Handloom & Textiles", folder: "Kalamkari", artisan: "Radhakrishnan Nair", guild: "Balaramapuram Weavers Guild", materials: ["Unbleached Combed Cotton", "Traditional Kasavu Zari", "Throw-Shuttle Pit Loom"], basePrice: 4800 },
      "Embroidery": { craftId: "kochi-embroidery", craftName: "Travancore Kasavu & Floral Embroidery", folder: "Kutch_Rogan", artisan: "Lakshmi Menon", guild: "Kottayam Women's Craft Guild", materials: ["Handloom Mulmul", "Gold Zari & Silk Thread", "Satin Stitch"], basePrice: 4400 }
    }
  },
  {
    state: "Madhya Pradesh",
    towns: ["Patangarh", "Chanderi", "Maheshwar", "Bagh", "Tikamgarh", "Bhopal", "Indore", "Ujjain", "Dindori", "Gwalior"],
    crafts: {
      "Painting": { craftId: "gond", craftName: "Patangarh Gond Tribal Painting", folder: "Gond", artisan: "Durga Bai Vyam", guild: "Patangarh Gond Guild", materials: ["Natural Soil Pigments", "Charcoal", "Archival Handmade Paper"], basePrice: 5600 },
      "Pottery": { craftId: "malwa-pottery", craftName: "Ujjain & Malwa Painted Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Kailash Prajapati", guild: "Malwa Clay Collective", materials: ["Black Malwa Clay", "Red & White Slip", "Kiln Terracotta"], basePrice: 2300 },
      "Metalcraft": { craftId: "tikamgarh-metalcraft", craftName: "Tikamgarh Bell Metalcraft", folder: "Bastar_Dokra", artisan: "Babulal Soni", guild: "Bundelkhand Brass Guild", materials: ["Bell Metal Bronze", "Beeswax Mould", "River Clay"], basePrice: 5900 },
      "Handloom & Textiles": { craftId: "chanderi-textile", craftName: "Chanderi & Bagh Handloom & Textiles", folder: "Kalamkari", artisan: "Ismail Khatri", guild: "Chanderi & Bagh Print Guild", materials: ["Chanderi Silk-Cotton", "Alizarin & Iron Dyes", "Hand-Carved Teak Blocks"], basePrice: 5400 },
      "Embroidery": { craftId: "bhopal-embroidery", craftName: "Bhopal Zardozi & Batua Embroidery", folder: "Kutch_Rogan", artisan: "Shabnam Begum", guild: "Bhopal Craftswomen Guild", materials: ["Silk Velvet", "Metallic Zari Thread", "Glass Beadwork"], basePrice: 4600 }
    }
  },
  {
    state: "Maharashtra",
    towns: ["Dahanu", "Ganjad", "Yeola", "Paithan", "Sawantwadi", "Kolhapur", "Solapur", "Pune", "Nagpur", "Nashik"],
    crafts: {
      "Painting": { craftId: "warli", craftName: "Palghar Warli Tribal Painting", folder: "Warli", artisan: "Ramesh Hengadi", guild: "Palghar Warli Collective", materials: ["Hand-ground Rice Paste", "Geru Red Ochre", "Cotton Canvas"], basePrice: 4500 },
      "Pottery": { craftId: "bhadrawati-pottery", craftName: "Bhadrawati & Pune Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Pandurang Kumbhar", guild: "Vidarbha Clay Artisans", materials: ["Black Cotton Soil Clay", "Natural Red Slip", "Wood-Fired Finish"], basePrice: 2400 },
      "Metalcraft": { craftId: "sawantwadi-metal", craftName: "Kolhapur & Sawantwadi Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Mangesh Chitari", guild: "Konkan Artisan Guild", materials: ["Cast Brass", "Natural Lacquer", "Mineral Enamel"], basePrice: 4800 },
      "Handloom & Textiles": { craftId: "paithani-textile", craftName: "Yeola Paithani Handloom & Textiles", folder: "Kalamkari", artisan: "Balasaheb Kapse", guild: "Yeola Paithani Bunkar Guild", materials: ["Mulberry Silk", "Interlocking Tapestry Weave", "Peacock & Lotus Borders"], basePrice: 9500 },
      "Embroidery": { craftId: "banjara-maharashtra", craftName: "Yavatmal Banjara Mirror Embroidery", folder: "Kutch_Rogan", artisan: "Sunita Rathod", guild: "Vidarbha Banjara Guild", materials: ["Handloom Cotton", "Vibrant Floss Thread", "Traditional Mirrorwork"], basePrice: 4100 }
    }
  },
  {
    state: "Manipur",
    towns: ["Imphal", "Ukhrul", "Moirang", "Bishnupur", "Thoubal", "Kakching", "Churachandpur", "Senapati", "Tamenglong", "Chandel"],
    crafts: {
      "Painting": { craftId: "manipuri-painting", craftName: "Imphal Subika & Lai Haraoba Painting", folder: "Gond", artisan: "Ibochouba Singh", guild: "Imphal Heritage Art Guild", materials: ["Handmade Bark Paper", "Botanical Pigments", "Bamboo Stylus"], basePrice: 4900 },
      "Pottery": { craftId: "longpi-pottery", craftName: "Longpi Hamlei Black Stone Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Mathew Sasa", guild: "Ukhrul Longpi Pottery Guild", materials: ["Weathered Serpentine Rock", "Black River Clay", "Beeswax Burnish"], basePrice: 3600 },
      "Metalcraft": { craftId: "imphal-metal", craftName: "Imphal Bell-Metal & Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Tomba Singh", guild: "Bishnupur Metalsmith Guild", materials: ["Bell Metal Alloy", "Cast Brass", "Hand-engraved Motifs"], basePrice: 5200 },
      "Handloom & Textiles": { craftId: "moirang-textile", craftName: "Moirang Phee Handloom & Textiles", folder: "Kalamkari", artisan: "Memcha Devi", guild: "Moirang Weavers Cooperative", materials: ["Hand-spun Cotton", "Natural Indigo & Lac", "Temple Border Weave"], basePrice: 4400 },
      "Embroidery": { craftId: "shaphi-embroidery", craftName: "Shaphi Lanphee Quilted Embroidery", folder: "Kutch_Rogan", artisan: "Ibemhal Devi", guild: "Imphal Women's Craft Guild", materials: ["Handloom Cotton", "Multi-colored Cotton Thread", "Geometric Border Stitch"], basePrice: 4700 }
    }
  },
  {
    state: "Meghalaya",
    towns: ["Larnai", "Shillong", "Jowai", "Tura", "Nongpoh", "Cherrapunji", "Mawlynnong", "Baghmara", "Williamnagar", "Nongstoin"],
    crafts: {
      "Painting": { craftId: "khasi-painting", craftName: "Khasi & Garo Folk Narrative Painting", folder: "Gond", artisan: "Banshan Nongbri", guild: "Shillong Folk Collective", materials: ["Handmade Cotton Paper", "Earth Pigments", "Charcoal Ink"], basePrice: 4100 },
      "Pottery": { craftId: "larnai-pottery", craftName: "Larnai Jaintia Black Clay Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Phida Kyndait", guild: "Larnai Women Potters Guild", materials: ["Jaintia Black Clay", "Tree-Bark Tannin Wash", "Hand-Beaten Rim"], basePrice: 2700 },
      "Metalcraft": { craftId: "jaintia-metal", craftName: "Jowai Traditional Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Kyrshan Ryngkhlem", guild: "Jaintia Hills Metal Guild", materials: ["Cast Brass", "Hammered Iron-Bronze", "Beeswax Polish"], basePrice: 4600 },
      "Handloom & Textiles": { craftId: "ryndia-textile", craftName: "Ri-Bhoi Ryndia Eri Silk Handloom & Textiles", folder: "Kalamkari", artisan: "Ibanroi Kharkongor", guild: "Umden Diwon Silk Guild", materials: ["Ahimsa Eri Silk", "Turmeric & Lac Dyes", "Handloom Weave"], basePrice: 5300 },
      "Embroidery": { craftId: "garo-embroidery", craftName: "Garo Dakmanda Motif Embroidery", folder: "Kutch_Rogan", artisan: "Silchi Sangma", guild: "Tura Women's Weaving & Stitch Guild", materials: ["Handloom Cotton", "Diamond-Motif Yarn", "Border Embroidery"], basePrice: 4000 }
    }
  },
  {
    state: "Mizoram",
    towns: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Lawngtlai", "Mamit", "Khawzawl", "Hnahthial"],
    crafts: {
      "Painting": { craftId: "mizoram-painting", craftName: "Lushai Hills Tribal Folk Painting", folder: "Warli", artisan: "Vanlalhruaia Ralte", guild: "Aizawl Heritage Studio", materials: ["Natural Mineral Pigments", "Cotton Canvas", "Bamboo Brush"], basePrice: 3900 },
      "Pottery": { craftId: "lunglei-pottery", craftName: "Lunglei Hand-Coiled Clay Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Zonunmawii Pachuau", guild: "Lunglei Clay Artisans", materials: ["Hillside Terracotta Clay", "Stone Burnish", "Wood-Fired Finish"], basePrice: 2500 },
      "Metalcraft": { craftId: "champhai-metal", craftName: "Champhai Traditional Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Lalhmangaiha", guild: "Champhai Artisan Collective", materials: ["Cast Brass", "Hand-forged Bronze", "Natural Patina"], basePrice: 4700 },
      "Handloom & Textiles": { craftId: "puanchei-textile", craftName: "Mizoram Puanchei Handloom & Textiles", folder: "Kalamkari", artisan: "Lalsangzuali Sailo", guild: "Aizawl Puan Weavers Guild", materials: ["Combed Cotton & Silk", "Supplementary Weft Motifs", "Natural Dyes"], basePrice: 5100 },
      "Embroidery": { craftId: "mizo-embroidery", craftName: "Tawlhlohpuan Geometric Embroidery", folder: "Kutch_Rogan", artisan: "Lalthansangi", guild: "Serchhip Women's Loom Guild", materials: ["Handloom Cotton", "Indigo & Crimson Thread", "Geometric Stitch"], basePrice: 4300 }
    }
  },
  {
    state: "Nagaland",
    towns: ["Kohima", "Dimapur", "Mokokchung", "Mon", "Tuensang", "Wokha", "Zunheboto", "Phek", "Longleng", "Kiphire"],
    crafts: {
      "Painting": { craftId: "naga-painting", craftName: "Naga Morung Heritage Folk Painting", folder: "Warli", artisan: "Vikuo Metha", guild: "Kohima Heritage Art Guild", materials: ["Earth & Charcoal Pigments", "Handmade Bark Paper", "Bamboo Brush"], basePrice: 4400 },
      "Pottery": { craftId: "longleng-pottery", craftName: "Longleng & Wokha Traditional Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Chubala Ao", guild: "Mokokchung Clay Collective", materials: ["Coarse Hill Clay", "Hand-Beaten Paddle Finish", "Open-Pit Firing"], basePrice: 2800 },
      "Metalcraft": { craftId: "naga-metalcraft", craftName: "Mon Konyak Brass & Bell Metalcraft", folder: "Bastar_Dokra", artisan: "Wangsha Konyak", guild: "Mon Brass Artisans", materials: ["Cast Brass", "Lost-Wax Beads", "Forged Bronze"], basePrice: 6100 },
      "Handloom & Textiles": { craftId: "naga-textile", craftName: "Chakhesang & Ao Naga Handloom & Textiles", folder: "Kalamkari", artisan: "Neikhrieno Nakhro", guild: "Kohima Loinloom Guild", materials: ["Backstrap Loinloom Cotton", "Natural Indigo & Madder", "Traditional Warrior Stripes"], basePrice: 5700 },
      "Embroidery": { craftId: "naga-embroidery", craftName: "Ao & Angami Cowrie Motif Embroidery", folder: "Kutch_Rogan", artisan: "Alemkumla Ao", guild: "Mokokchung Women's Guild", materials: ["Handwoven Cotton", "Madder Red Yarn", "Tribal Stitchwork"], basePrice: 4900 }
    }
  },
  {
    state: "Odisha",
    towns: ["Raghurajpur", "Puri", "Sambalpur", "Pipli", "Cuttack", "Bargarh", "Berhampur", "Balasore", "Koraput", "Baripada"],
    crafts: {
      "Painting": { craftId: "pattachitra", craftName: "Raghurajpur Pattachitra Painting", folder: "Pattachitra", artisan: "Bijay Kumar Parida", guild: "Raghurajpur Chitrakar Guild", materials: ["Tussar Silk Patta", "Conch Shell White", "Natural Lacquer"], basePrice: 6800 },
      "Pottery": { craftId: "barpali-pottery", craftName: "Barpali & Koraput Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Sridhar Rana", guild: "Bargarh Kumhar Collective", materials: ["Alluvial River Clay", "Red Ochre Slip", "Kiln-Fired Finish"], basePrice: 2300 },
      "Metalcraft": { craftId: "dhenkanal-dokra", craftName: "Dhenkanal & Sadeibareni Dokra Metalcraft", folder: "Bastar_Dokra", artisan: "Kailash Behera", guild: "Sadeibareni Dokra Guild", materials: ["Bell Metal Brass", "Wild Beeswax", "River Silt Mould"], basePrice: 5800 },
      "Handloom & Textiles": { craftId: "sambalpuri-textile", craftName: "Sambalpuri Bandha Ikat Handloom & Textiles", folder: "Kalamkari", artisan: "Chaturbhuja Meher", guild: "Bargarh Ikat Weavers", materials: ["Double Ikat Cotton & Silk", "Natural Vegetable Dyes", "Shankha & Chakra Motifs"], basePrice: 6200 },
      "Embroidery": { craftId: "pipli-embroidery", craftName: "Pipli Chandua Applique Embroidery", folder: "Kutch_Rogan", artisan: "Pravat Mohapatra", guild: "Pipli Applique Collective", materials: ["Vibrant Cotton Broadcloth", "Mirror-Work Accent", "Chain Stitch Embroidery"], basePrice: 3700 }
    }
  },
  {
    state: "Punjab",
    towns: ["Amritsar", "Patiala", "Ludhiana", "Jalandhar", "Hoshiarpur", "Bathinda", "Kapurthala", "Sangrur", "Mohali", "Pathankot"],
    crafts: {
      "Painting": { craftId: "punjab-painting", craftName: "Kapurthala & Patiala Fresco Painting", folder: "Pattachitra", artisan: "Gurdev Singh Gill", guild: "Patiala Heritage Art Guild", materials: ["Natural Mineral Pigments", "Lime-Washed Paper", "Fine Squirrel Brush"], basePrice: 5100 },
      "Pottery": { craftId: "jalandhar-pottery", craftName: "Jalandhar & Hoshiarpur Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Balwinder Kumar", guild: "Doaba Kumhar Collective", materials: ["Sutlej Alluvial Clay", "Mineral Slip", "Burnished Kiln Finish"], basePrice: 2200 },
      "Metalcraft": { craftId: "hoshiarpur-metal", craftName: "Hoshiarpur Brass Inlay & Metalcraft", folder: "Bastar_Dokra", artisan: "Gurpreet Singh", guild: "Hoshiarpur Artisan Collective", materials: ["Seasoned Sheesham & Brass", "Hand-cut Brass Wire", "Natural Beeswax"], basePrice: 5400 },
      "Handloom & Textiles": { craftId: "punjab-textile", craftName: "Amritsar Khes Handloom & Textiles", folder: "Kalamkari", artisan: "Kuldeep Kaur", guild: "Majha Handloom Guild", materials: ["Thick Hand-spun Cotton", "Double-Cloth Damask Weave", "Madder & Indigo Dyes"], basePrice: 3800 },
      "Embroidery": { craftId: "phulkari-embroidery", craftName: "Patiala Bagh & Phulkari Embroidery", folder: "Kutch_Rogan", artisan: "Harjinder Kaur", guild: "Patiala Phulkari Women's Guild", materials: ["Hand-spun Khaddar Cotton", "Pat Silk Floss Thread", "Darning Stitch Geometry"], basePrice: 4900 }
    }
  },
  {
    state: "Rajasthan",
    towns: ["Jaipur", "Udaipur", "Jodhpur", "Bhilwara", "Nathdwara", "Barmer", "Bikaner", "Jaisalmer", "Kota", "Pushkar"],
    crafts: {
      "Painting": { craftId: "phad-painting", craftName: "Bhilwara Phad & Pichwai Painting", folder: "Pattachitra", artisan: "Kalyan Joshi", guild: "Chhipa Phad Guild", materials: ["Starched Khadi Scroll", "Stone Mineral Pigments", "Natural Gum"], basePrice: 7600 },
      "Pottery": { craftId: "blue-pottery", craftName: "Jaipur Blue Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Gopal Lal Kumhar", guild: "Kripal Shishya Collective", materials: ["Ground Quartz Stone", "Glass Cullet", "Cobalt & Copper Oxide"], basePrice: 3900 },
      "Metalcraft": { craftId: "jodhpur-metal", craftName: "Jaipur & Jodhpur Koftgari Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Shabbir Khan", guild: "Marwar Metalsmith Guild", materials: ["Cast Brass", "Silver-Wire Koftgari", "Engraved Jali"], basePrice: 6100 },
      "Handloom & Textiles": { craftId: "kota-textile", craftName: "Kota Doria & Bagru Handloom & Textiles", folder: "Kalamkari", artisan: "Ramdayal Chhipa", guild: "Bagru Natural Dye Guild", materials: ["Cotton-Silk Khat Weave", "Indigo & Kashish Dyes", "Hand-Carved Teak Blocks"], basePrice: 4300 },
      "Embroidery": { craftId: "barmer-embroidery", craftName: "Barmer Applique & Suf Embroidery", folder: "Kutch_Rogan", artisan: "Ruma Devi", guild: "Barmer Craftswomen Collective", materials: ["Handloom Cotton", "Silk Threadwork", "Traditional Mirror Accents"], basePrice: 4400 }
    }
  },
  {
    state: "Sikkim",
    towns: ["Gangtok", "Namchi", "Pelling", "Ravangla", "Mangan", "Rumtek", "Yuksom", "Singtam", "Rangpo", "Gyalshing"],
    crafts: {
      "Painting": { craftId: "sikkim-thangka", craftName: "Rumtek Buddhist Thangka Painting", folder: "Pattachitra", artisan: "Karma Bhutia", guild: "Gangtok Thangka Guild", materials: ["Linen Canvas", "Himalayan Mineral Colors", "24K Gold Ink"], basePrice: 7100 },
      "Pottery": { craftId: "namchi-pottery", craftName: "Namchi & Ravangla Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Dawa Sherpa", guild: "South Sikkim Clay Collective", materials: ["Himalayan Mountain Clay", "Wood-Ash Glaze", "Hand-Thrown Body"], basePrice: 2600 },
      "Metalcraft": { craftId: "sikkim-metalcraft", craftName: "Gangtok Copper & Brass Ritual Metalcraft", folder: "Bastar_Dokra", artisan: "Sonam Tamang", guild: "Sikkim Repousse Guild", materials: ["Hand-beaten Copper", "Cast Brass", "Engraved Ashtamangala"], basePrice: 5600 },
      "Handloom & Textiles": { craftId: "lepcha-textile", craftName: "Dzongu Lepcha Handloom & Textiles", folder: "Kalamkari", artisan: "Ongmu Lepcha", guild: "Mangan Lepcha Weavers", materials: ["Hand-spun Nettle & Cotton", "Backstrap Loom Weave", "Natural Root Dyes"], basePrice: 4300 },
      "Embroidery": { craftId: "bhutia-embroidery", craftName: "Gangtok Bhutia Brocade Embroidery", folder: "Kutch_Rogan", artisan: "Pema Choden", guild: "Rumtek Women's Embroidery Guild", materials: ["Handloom Silk-Cotton", "Gold & Crimson Thread", "Lotus Motif Stitch"], basePrice: 4800 }
    }
  },
  {
    state: "Tamil Nadu",
    towns: ["Thanjavur", "Kumbakonam", "Kanchipuram", "Chettinad", "Ooty", "Madurai", "Swamimalai", "Coimbatore", "Salem", "Tirunelveli"],
    crafts: {
      "Painting": { craftId: "tanjore-painting", craftName: "Thanjavur Gold-Leaf Painting", folder: "Pattachitra", artisan: "Srinivasan Sthapati", guild: "Thanjavur Chitrakala Guild", materials: ["Jackfruit Wood Panel", "Chalk Muck Relief", "22K Gold Foil"], basePrice: 9200 },
      "Pottery": { craftId: "karigiri-pottery", craftName: "Karigiri & Manamadurai Glazed Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Murugan Velar", guild: "Sivaganga Velar Guild", materials: ["Kaveri Clay", "Lead-Free Mineral Glaze", "Hand-Carved Piercing"], basePrice: 2900 },
      "Metalcraft": { craftId: "nachiarkoil-metal", craftName: "Nachiarkoil Kuthuvilakku Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Subramanian Pathar", guild: "Kumbakonam Brass Guild", materials: ["Vengalam Bell Metal", "Kaveri Alluvial Sand Mould", "Solid Brass"], basePrice: 6400 },
      "Handloom & Textiles": { craftId: "kanjeevaram-textile", craftName: "Kanchipuram & Chettinad Handloom Textiles", folder: "Kalamkari", artisan: "Krishnamoorthy Weaver", guild: "Kanchipuram Silk Weavers", materials: ["Pure Mulberry Silk", "Korvai Interlock Border", "Temple Zari"], basePrice: 8800 },
      "Embroidery": { craftId: "toda-embroidery", craftName: "Nilgiri Toda Pugur Embroidery", folder: "Kutch_Rogan", artisan: "Vasamalli Toda", guild: "Nilgiri Toda Women's Guild", materials: ["Unbleached Coarse Cotton", "Red & Black Wool Thread", "Reversible Stitch"], basePrice: 4600 }
    }
  },
  {
    state: "Telangana",
    towns: ["Cheriyal", "Pembarthi", "Pochampally", "Warangal", "Nirmal", "Hyderabad", "Karimnagar", "Nizamabad", "Gadwal", "Narayanpet"],
    crafts: {
      "Painting": { craftId: "cheriyal-painting", craftName: "Cheriyal Nakashi Scroll Painting", folder: "Pattachitra", artisan: "Nageshwar Rao", guild: "Cheriyal Nakashi Guild", materials: ["Tamarind-Seed Khadi Scroll", "Natural Stone Colors", "Squirrel-Hair Brush"], basePrice: 5800 },
      "Pottery": { craftId: "adilabad-pottery", craftName: "Chunduru & Nirmal Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Rajanna Kummari", guild: "Telangana Clay Collective", materials: ["Deccan Black & Red Clay", "Natural Earth Slip", "Burnished Finish"], basePrice: 2400 },
      "Metalcraft": { craftId: "pembarthi-metal", craftName: "Pembarthi Sheet-Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Satyanarayana Chary", guild: "Pembarthi Vishwakarma Guild", materials: ["Sheet Brass & Copper", "Lac Pitch Repousse", "Antique Oxidized Finish"], basePrice: 6300 },
      "Handloom & Textiles": { craftId: "pochampally-textile", craftName: "Pochampally Ikat Handloom & Textiles", folder: "Kalamkari", artisan: "Gajam Anjaiah", guild: "Bhoodan Pochampally Guild", materials: ["Mercerized Cotton & Silk", "Tie-and-Dye Ikat Warp", "Natural Indigo"], basePrice: 5400 },
      "Embroidery": { craftId: "lambadi-embroidery", craftName: "Warangal Lambadi Mirror Embroidery", folder: "Kutch_Rogan", artisan: "Kavitha Rathod", guild: "Warangal Lambadi Guild", materials: ["Handwoven Cotton", "Bright Threadwork", "Cowrie & Mirrorwork"], basePrice: 4100 }
    }
  },
  {
    state: "Tripura",
    towns: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Ambassa", "Belonia", "Khowai", "Teliamura", "Sonamura", "Sabroom"],
    crafts: {
      "Painting": { craftId: "unakoti-painting", craftName: "Unakoti Relief & Folk Painting", folder: "Gond", artisan: "Pradip Chakraborty", guild: "Kailashahar Folk Art Guild", materials: ["Handmade Paper", "Earth Pigments", "Charcoal Ink"], basePrice: 4300 },
      "Pottery": { craftId: "tripura-pottery", craftName: "Agartala & Gomati Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Subhash Pal", guild: "Tripura Kumhar Collective", materials: ["Gomati River Clay", "Natural Red Ochre Slip", "Kiln-Fired Terracotta"], basePrice: 2200 },
      "Metalcraft": { craftId: "udaipur-metal", craftName: "Gomati Traditional Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Haripada Karmakar", guild: "Udaipur Metalsmith Guild", materials: ["Cast Brass", "Bell Metal Alloy", "Hand-engraved Finish"], basePrice: 4600 },
      "Handloom & Textiles": { craftId: "risa-textile", craftName: "Tripura Risa & Pachra Handloom & Textiles", folder: "Kalamkari", artisan: "Sumati Debbarma", guild: "Agartala Tribal Weavers Guild", materials: ["Hand-spun Cotton", "Backstrap Loinloom Weave", "Natural Vegetable Dyes"], basePrice: 3900 },
      "Embroidery": { craftId: "tripura-embroidery", craftName: "Tripuri Rignai Geometric Embroidery", folder: "Kutch_Rogan", artisan: "Anamika Jamatia", guild: "Khowai Women's Craft Guild", materials: ["Handloom Cotton", "Crimson & Indigo Yarn", "Border Embroidery"], basePrice: 3800 }
    }
  },
  {
    state: "Uttar Pradesh",
    towns: ["Khurja", "Lucknow", "Varanasi", "Moradabad", "Bhadohi", "Agra", "Azamgarh", "Mirzapur", "Firozabad", "Saharanpur"],
    crafts: {
      "Painting": { craftId: "mathura-painting", craftName: "Braj Sanjhi & Miniature Painting", folder: "Pattachitra", artisan: "Mohan Kumar Verma", guild: "Vrindavan Sanjhi Guild", materials: ["Handmade Wasli Paper", "Mineral Stone Pigments", "Natural Gum"], basePrice: 5300 },
      "Pottery": { craftId: "khurja-pottery", craftName: "Khurja Ceramic & Nizamabad Black Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Imran Ahmed", guild: "Khurja Potteries Collective", materials: ["Stoneware Clay", "Cobalt & Ochre Glaze", "Silver-Inlaid Slip"], basePrice: 3400 },
      "Metalcraft": { craftId: "moradabad-metalcraft", craftName: "Moradabad Nakshi Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Salim Raza", guild: "Moradabad Nakshi Guild", materials: ["Solid Brass Alloy", "Hand-Chiseled Engraving", "Natural Lac Infill"], basePrice: 5900 },
      "Handloom & Textiles": { craftId: "varanasi-textile", craftName: "Varanasi Banarasi Handloom & Textiles", folder: "Kalamkari", artisan: "Haji Maqbool", guild: "Madanpura Weavers Guild", materials: ["Pure Mulberry Silk", "Tested Zari Thread", "Natural Indigo & Madder"], basePrice: 8900 },
      "Embroidery": { craftId: "chikankari-embroidery", craftName: "Lucknow Chikankari Shadow Embroidery", folder: "Kutch_Rogan", artisan: "Rukhsana Begum", guild: "Chowk Chikankari Guild", materials: ["Fine Cotton Mulmul", "Tepchi & Bakhiya Stitch", "Uncut Cotton Thread"], basePrice: 4800 }
    }
  },
  {
    state: "Uttarakhand",
    towns: ["Almora", "Nainital", "Chamoli", "Pithoragarh", "Uttarkashi", "Dehradun", "Bageshwar", "Ranikhet", "Haldwani", "Tehri"],
    crafts: {
      "Painting": { craftId: "aipan-painting", craftName: "Kumaoni Aipan Sacred Folk Painting", folder: "Madhubani", artisan: "Meenakshi Joshi", guild: "Almora Aipan Women's Guild", materials: ["Geru Red Ochre Base", "Biswar Rice Paste", "Cotton Canvas"], basePrice: 3600 },
      "Pottery": { craftId: "bageshwar-pottery", craftName: "Bageshwar & Garhwal Clay Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Harish Tamta", guild: "Kumaon Clay Collective", materials: ["Himalayan River Clay", "Geru Earth Slip", "Wood-Fired Finish"], basePrice: 2300 },
      "Metalcraft": { craftId: "tamta-metalcraft", craftName: "Almora Tamta Hand-Beaten Copper Metalcraft", folder: "Bastar_Dokra", artisan: "Bishan Ram Tamta", guild: "Kumaon Tamta Guild", materials: ["Pure Electrolytic Copper", "Brass Fittings", "Tin Lining (Kalai)"], basePrice: 5700 },
      "Handloom & Textiles": { craftId: "bhotia-textile", craftName: "Munsiari Bhotia Woollen Handloom & Textiles", folder: "Kalamkari", artisan: "Kamla Pangtey", guild: "Johar Valley Weavers Guild", materials: ["High-Altitude Sheep Wool", "Walnut & Rhubarb Dyes", "Pit-Loom Thulma Weave"], basePrice: 4900 },
      "Embroidery": { craftId: "garhwal-embroidery", craftName: "Pithoragarh Himalayan Wool Embroidery", folder: "Kutch_Rogan", artisan: "Hema Rawat", guild: "Chamoli Women's Craft Guild", materials: ["Hand-spun Wool", "Natural Botanical Thread", "Traditional Border Stitch"], basePrice: 4200 }
    }
  },
  {
    state: "West Bengal",
    towns: ["Pingla", "Bikna", "Bolpur", "Kalighat", "Bishnupur", "Shantipur", "Phulia", "Murshidabad", "Krishnanagar", "Cooch Behar"],
    crafts: {
      "Painting": { craftId: "bengal-patachitra", craftName: "Pingla Patachitra Scroll Painting", folder: "Pattachitra", artisan: "Swarna Chitrakar", guild: "Pingla Patua Guild", materials: ["Cotton Cloth Scroll", "Bael Fruit Gum", "Aparajita & Turmeric Dyes"], basePrice: 5400 },
      "Pottery": { craftId: "krishnanagar-pottery", craftName: "Krishnanagar & Bankura Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Kartik Pal", guild: "Nadia Clay Artisans", materials: ["Gangetic Alluvial Clay", "Natural Terracotta Slip", "Hand-Moulded Finish"], basePrice: 2600 },
      "Metalcraft": { craftId: "bankura-dokra", craftName: "Bankura Dokra Lost-Wax Metalcraft", folder: "Bastar_Dokra", artisan: "Buddhadev Karmakar", guild: "Bikna Dokra Guild", materials: ["Bell Metal Brass", "Beeswax Coils", "Riverbank Clay Core"], basePrice: 6600 },
      "Handloom & Textiles": { craftId: "shantipur-textile", craftName: "Phulia & Shantipur Jamdani Handloom Textiles", folder: "Kalamkari", artisan: "Biren Basak", guild: "Nadia Tantubay Guild", materials: ["Extra-Fine Muslin Cotton", "Discontinuous Weft Jamdani", "Natural Dyes"], basePrice: 6100 },
      "Embroidery": { craftId: "kantha-embroidery", craftName: "Shantiniketan Nakshi Kantha Embroidery", folder: "Kutch_Rogan", artisan: "Takdira Begum", guild: "Birbhum Kantha Collective", materials: ["Tussar & Cotton Blend", "Running Kantha Stitch", "Natural Earth Dyes"], basePrice: 4900 }
    }
  },
  {
    state: "Delhi",
    towns: ["Chandni Chowk", "Mehrauli", "Hauz Khas", "Shahdara", "Nizamuddin", "Karol Bagh", "Paharganj", "Dilli Haat", "Mayur Vihar", "Rohini"],
    crafts: {
      "Painting": { craftId: "mehrauli-painting", craftName: "Mehrauli Mughal Miniature Painting", folder: "Pattachitra", artisan: "Farhan Siddiqui", guild: "Nizamuddin Atelier", materials: ["Wasli Handmade Paper", "Lapis Lazuli & Gold Ink", "Fine Squirrel Brush"], basePrice: 7200 },
      "Pottery": { craftId: "delhi-pottery", craftName: "Delhi Blue-Glazed Quartz Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Devraj Prajapati", guild: "Uttam Nagar Potter Collective", materials: ["Quartz & Clay Body", "Turquoise Oxide Glaze", "Lead-Free Finish"], basePrice: 3100 },
      "Metalcraft": { craftId: "shahjahanabad-metal", craftName: "Old Delhi Brass & Copper Aftaba Metalcraft", folder: "Bastar_Dokra", artisan: "Salman Qureshi", guild: "Ballimaran Metalsmith Guild", materials: ["Cast Brass", "Engraved Copper", "Tin-Lined Finish"], basePrice: 5800 },
      "Handloom & Textiles": { craftId: "delhi-textile", craftName: "Delhi Khadi & Block-Print Handloom Textiles", folder: "Kalamkari", artisan: "Ananya Kapoor", guild: "Hauz Khas Craft Collective", materials: ["Hand-spun Khadi Cotton", "Natural Indigo Vat", "Teak Block Print"], basePrice: 4200 },
      "Embroidery": { craftId: "delhi-zardozi", craftName: "Old Delhi Zardozi & Dabka Embroidery", folder: "Kutch_Rogan", artisan: "Ustad Haji Naeem", guild: "Kinari Bazaar Zardozi Guild", materials: ["Silk Velvet Base", "Metallic Dabka & Kasab", "Natural Pearl Accents"], basePrice: 8400 }
    }
  },
  {
    state: "Jammu & Kashmir",
    towns: ["Srinagar", "Anantnag", "Pampore", "Budgam", "Jammu", "Baramulla", "Sopore", "Pulwama", "Kulgam", "Udhampur"],
    crafts: {
      "Painting": { craftId: "papier-mache-painting", craftName: "Srinagar Papier-Mache Naqqashi Painting", folder: "Pattachitra", artisan: "Bashir Ahmad Bhat", guild: "Zadibal Naqqashi Collective", materials: ["Hand-pressed Paper Pulp", "Mineral Earth Pigments", "24K Gold Leaf"], basePrice: 5200 },
      "Pottery": { craftId: "kashmir-pottery", craftName: "Pampore & Kralpora Terracotta Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Ghulam Qadir Kumhar", guild: "Pulwama Clay Guild", materials: ["Kashmiri Red Clay", "Mineral Slip", "Wood-Fired Finish"], basePrice: 2600 },
      "Metalcraft": { craftId: "kashmir-metal", craftName: "Srinagar Engraved Copper Samovar Metalcraft", folder: "Bastar_Dokra", artisan: "Nissar Ahmad Misgar", guild: "Zaina Kadal Copper Guild", materials: ["Hand-hammered Copper", "Tin-Coated Interior", "Chinar Leaf Engraving"], basePrice: 7400 },
      "Handloom & Textiles": { craftId: "kani-textile", craftName: "Kanihama Pashmina Kani Handloom & Textiles", folder: "Kalamkari", artisan: "Ali Mohammad Mir", guild: "Budgam Kani Weavers Guild", materials: ["Ladakhi Changthangi Pashmina", "Wooden Kani Bobbins", "Natural Saffron Dye"], basePrice: 12500 },
      "Embroidery": { craftId: "kashmir-embroidery", craftName: "Kashmiri Sozni & Aari Embroidery", folder: "Kutch_Rogan", artisan: "Ghulam Nabi Dar", guild: "Srinagar Sozni Guild", materials: ["Fine Wool & Silk", "Multi-strand Silk Thread", "Chinar & Paisley Stitch"], basePrice: 7900 }
    }
  },
  {
    state: "Ladakh",
    towns: ["Leh", "Chilling", "Kargil", "Diskit", "Hemis", "Alchi", "Lamayuru", "Nubra", "Zanskar", "Nyoma"],
    crafts: {
      "Painting": { craftId: "ladakh-thangka", craftName: "Ladakhi Monastery Thangka Painting", folder: "Pattachitra", artisan: "Stanzin Dorje", guild: "Leh Buddhist Art Guild", materials: ["Sized Cotton Cloth", "Himalayan Mineral Colors", "Gold Leaf Linework"], basePrice: 7600 },
      "Pottery": { craftId: "likir-pottery", craftName: "Likir & Zanskar Mountain Clay Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Tashi Wangyal", guild: "Likir Clay Guild", materials: ["High-Altitude River Clay", "Natural Mineral Slip", "Open-Kiln Finish"], basePrice: 2800 },
      "Metalcraft": { craftId: "chilling-metalcraft", craftName: "Chilling Copper & Silver Metalcraft", folder: "Bastar_Dokra", artisan: "Tsering Namgyal", guild: "Chilling Metalsmith Guild", materials: ["Hand-forged Copper", "Silver Repousse", "Brass Dragon Handles"], basePrice: 6800 },
      "Handloom & Textiles": { craftId: "ladakh-textile", craftName: "Leh Changthangi Pashmina Handloom & Textiles", folder: "Kalamkari", artisan: "Padma Yangchen", guild: "Changthang Women's Loom Guild", materials: ["Raw Changthangi Pashmina", "Unbleached Natural Wool", "Handloom Twill"], basePrice: 8900 },
      "Embroidery": { craftId: "ladakh-embroidery", craftName: "Kargil & Leh Woollen Brocade Embroidery", folder: "Kutch_Rogan", artisan: "Dechen Angmo", guild: "Leh Women's Craft Collective", materials: ["Hand-spun Wool", "Silk Brocade Thread", "Auspicious Knot Stitch"], basePrice: 5400 }
    }
  },
  {
    state: "Puducherry",
    towns: ["Auroville", "White Town", "Villianur", "Karaikal", "Ariyankuppam", "Muthialpet", "Lawspet", "Bahour", "Oulgaret", "Mahe"],
    crafts: {
      "Painting": { craftId: "villianur-painting", craftName: "Villianur Heritage & Kolam Painting", folder: "Madhubani", artisan: "Muruganandam V.", guild: "Villianur Craft Guild", materials: ["Handmade Cotton Paper", "Mineral Earth Pigments", "Natural Gum"], basePrice: 3800 },
      "Pottery": { craftId: "auroville-pottery", craftName: "Auroville Stoneware & Glazed Pottery", folder: "Jaipur_Blue_Pottery", artisan: "Anandamohan Pillai", guild: "Auroville Ceramic Collective", materials: ["High-Fire Stoneware Clay", "Wood-Ash & Celadon Glaze", "Wheel-Thrown Body"], basePrice: 3500 },
      "Metalcraft": { craftId: "karaikal-metal", craftName: "Karaikal & Villianur Brass Metalcraft", folder: "Bastar_Dokra", artisan: "Selvaraj Pathar", guild: "Karaikal Brass Guild", materials: ["Cast Brass", "Bell Metal Alloy", "Traditional Lamp Finish"], basePrice: 5100 },
      "Handloom & Textiles": { craftId: "pondicherry-textile", craftName: "Pondicherry Natural-Dyed Handloom & Textiles", folder: "Kalamkari", artisan: "Kavitha Sundaram", guild: "Karaikal Handloom Guild", materials: ["Organic Pondicherry Cotton", "Natural Indigo Vat", "Handloom Weave"], basePrice: 4100 },
      "Embroidery": { craftId: "pondicherry-embroidery", craftName: "White Town Botanical Needle Embroidery", folder: "Kutch_Rogan", artisan: "Rajeswari N.", guild: "Ariyankuppam Women's Guild", materials: ["Organic Cotton Linen", "Botanical Dyed Floss", "Fine Floral Stitch"], basePrice: 3900 }
    }
  }
];

const generateStateProducts = () => {
  const generated = [];
  let nextId = MOCK_PRODUCTS.length + 1;

  for (const stateEntry of STATE_CRAFT_CATALOG) {
    for (let catIdx = 0; catIdx < ALL_CATEGORIES.length; catIdx++) {
      const category = ALL_CATEGORIES[catIdx];
      const craft = stateEntry.crafts[category];
      const folder = craft.folder || CATEGORY_DEFAULT_FOLDERS[category];
      const existingInCat = MOCK_PRODUCTS.filter(
        (p) => p.state === stateEntry.state && p.category === category
      ).length;
      const needed = Math.max(10 - existingInCat, 0);

      for (let i = 0; i < needed; i++) {
        const town = stateEntry.towns[(i + catIdx * 2) % stateEntry.towns.length];
        const motif = CRAFT_MOTIFS_AND_FORMS[(i + catIdx * 5) % CRAFT_MOTIFS_AND_FORMS.length];
        const edition = PRODUCT_EDITIONS[(i + catIdx) % PRODUCT_EDITIONS.length];
        const imgSeed = i * 3 + catIdx * 7;
        const img0 = getVerifiedCraftImage(folder, imgSeed);
        const img1 = getVerifiedCraftImage(folder, imgSeed + 1);
        const img2 = getVerifiedCraftImage(folder, imgSeed + 2);
        const readyMade = (i + catIdx) % 4 !== 3;
        const stockCount = readyMade ? ((i + catIdx) % 4) + 1 : 1;
        const price = craft.basePrice + (((i * 275) + (catIdx * 150)) % 4200);

        generated.push({
          id: `prod-${nextId++}`,
          title: `${motif} ${craft.craftName.split(" ")[0]} (${edition} #${i + 1})`,
          craftId: craft.craftId,
          craftName: craft.craftName,
          category,
          artisanId: `${craft.craftId}-${stateEntry.state.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          artisanName: `${craft.artisan} & ${craft.guild}`,
          artisanLocation: `${town}, ${stateEntry.state}`,
          state: stateEntry.state,
          price,
          availability: readyMade
            ? `In Stock (${stockCount} ${stockCount === 1 ? "piece" : "pieces"}) • Customizable`
            : `Made to Order (${7 + (i % 8)} days)`,
          status: "Published",
          stockCount,
          readyMade,
          leadTimeDays: readyMade ? 2 + (i % 3) : 7 + (i % 8),
          image: img0,
          gallery: [img0, img1, img2],
          materials: craft.materials,
          dimensions: category === "Pottery" || category === "Metalcraft"
            ? `${8 + (i % 7)} x ${6 + (i % 5)} inches`
            : `${18 + (i % 14)} x ${24 + (i % 18)} inches`,
          weight: category === "Pottery" || category === "Metalcraft"
            ? `${(1.1 + (i % 5) * 0.3).toFixed(1)} kg`
            : `${190 + (i % 8) * 35} grams`,
          care: category === "Handloom & Textiles" || category === "Embroidery"
            ? "Dry clean or gentle cold hand wash separately; dry in shade."
            : "Dust gently with a soft dry cloth; keep away from direct dampness.",
          artisanStory: `Handcrafted in ${town}, ${stateEntry.state} by ${craft.artisan} following multi-generational ${craft.craftName} techniques.`,
          culturalContext: `Authentic regional ${craft.craftName} heritage from ${town}, ${stateEntry.state}.`,
          curatorNote: `Verified regional artisan guild piece (${stateEntry.state} • ${category} #${i + 1}).`,
          featured: i === 0 && catIdx === 0
        });
      }
    }
  }

  return generated;
};

MOCK_PRODUCTS.push(...generateStateProducts());

export const CULTURAL_JOURNAL_STORIES = [
  {
    id: "story-mithila-lines",
    title: "Lines Born from Rice Straw & Bamboo Nibs: The Living Geometry of Mithila",
    subtitle: "In the domestic courtyards of northern Bihar, ritual paintings are prayers cast in soot and lime.",
    author: "Shalini Jha & Dulari Devi",
    craft: "Madhubani (Mithila) Painting",
    readTime: "7 min read",
    image: "/uploads/crafts/Madhubani/ddg_1.jpg",
    previewText: "Long before synthetic acrylics arrived in the bazaars of Darbhanga, the women of Mithila crushed lampblack scraped from cooking pots.",
    fullContent: "Long before synthetic acrylics arrived in the bazaars of Darbhanga, the women of Mithila crushed lampblack scraped from cooking pots and mixed it with cow milk to outline the universe on freshly plastered mud walls.",
    tags: ["Ritual Art", "Natural Pigments", "Mithila Heritage"],
    citations: ["Vequaud, Yves (1977). 'The Art of Mithila'."],
    reviewedBy: "National Crafts Council of India Archives"
  },
  {
    id: "story-bastar-dokra",
    title: "Cast in Fire and Forest Wax: Bastar's 4,000-Year Dokra Heritage",
    subtitle: "Tracing an unbroken metallurgical lineage from the Indus Valley to Bastar.",
    author: "Kiran Baghel & Dr. Subhash Chandra",
    craft: "Bastar Dokra Lost-Wax Bell Metal",
    readTime: "9 min read",
    image: "/uploads/crafts/Bastar_Dokra/ddg_1.jpg",
    previewText: "In the red-earth hamlets of Kondagaon, metal belongs to the earth, the river silt, and the wild honeybee.",
    fullContent: "The Ghadwa artisans of Bastar begin by harvesting beeswax from wild beehives in the Sal forests, wrapping delicate wax coils around a clay core before pouring molten bell metal.",
    tags: ["Ancient Metallurgy", "Lost Wax", "Tribal Bastar"],
    citations: ["Bhattacharyya, N.N. (1980). 'Tribal Folk Metallurgy of Central India'."],
    reviewedBy: "Anthropological Research Council, Bastar Field Station"
  }
];

export const MOCK_ORDERS = [
  {
    id: "ORD-2026-8812",
    date: "2026-11-20",
    customerName: "Aditi Narang",
    customerEmail: "aditi.n@example.com",
    customerCity: "Bengaluru, Karnataka",
    productTitle: "Tree of Eternal Life (Kalpavriksha)",
    artisanId: "dulari-devi",
    amount: 8400,
    status: "In Production",
    paymentMode: "UPI (Verified)",
    trackingCode: "AAROH-EXP-5592",
    notes: "Please include the artisan signature certificate."
  }
];

export const MOCK_ENQUIRIES = [
  {
    id: "ENQ-504",
    date: "2026-11-24",
    customerName: "Sunita Deshmukh",
    customerPhone: "+91 98200 45123",
    customerEmail: "sunita.d@designstudio.in",
    productTitle: "Bastar Ceremonial Elephant",
    artisanId: "sukhmati-baghel",
    quantity: 6,
    purpose: "Architectural Hotel Lobby Installation",
    preferredContact: "WhatsApp",
    status: "New Enquiry",
    message: "We need 6 pieces for an architectural lobby project in Pune. Can they be scaled to 16 inches height?"
  }
];

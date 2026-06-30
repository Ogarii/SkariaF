// Static dataset for oneMedicare — single source of truth (no API calls).

const CATEGORIES = [
  {
    id: "psychology",
    name: "Psychology",
    short: "Therapy, counseling, and mental health care",
    description: "Licensed clinicians for anxiety, trauma, couples work, and psychiatric support.",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    short: "Dietetics and metabolic wellness",
    description: "Registered dietitians for meal planning, gut health, and chronic condition nutrition.",
  },
  {
    id: "holistic",
    name: "Holistic",
    short: "Integrative and mind-body medicine",
    description: "Whole-person care blending conventional medicine with complementary therapies.",
  },
  {
    id: "wellness",
    name: "Wellness",
    short: "Preventive care and lifestyle coaching",
    description: "Coaching, preventive screenings, and programs for sustainable daily health.",
  },
  {
    id: "physical-therapy",
    name: "Physical Therapy",
    short: "Rehabilitation and movement medicine",
    description: "Physiotherapy for injury recovery, chronic pain, and performance optimization.",
  },
];

const VALUE_PROPS = [
  {
    no: "01",
    title: "Schema-per-tenant isolation",
    body: "Each center receives a dedicated Postgres schema. Clinical data never crosses tenant boundaries.",
  },
  {
    no: "02",
    title: "Multi-category centers",
    body: "Centers can carry one or many practice types: psychology, nutrition, holistic, and beyond.",
  },
  {
    no: "03",
    title: "Unified patient identity",
    body: "A shared platform schema for users and auth, with tenant-scoped clinical records.",
  },
  {
    no: "04",
    title: "Launch-ready onboarding",
    body: "Apply once, provision a tenant, and go live with practitioners, services, and scheduling.",
  },
];

const CENTERS = [
  {
    id: "ctr-skaria",
    slug: "skaria",
    catalogNo: "CTR-001",
    name: "Skaria Medical Center",
    tagline: "Holistic telehealth blending African herbalism and Western clinical medicine",
    categories: ["holistic", "wellness", "nutrition"],
    featured: true,
    rating: 4.9,
    reviewCount: 128,
    location: "Portland, OR",
    status: "ACTIVE",
    joined: "2024-03-12",
    description:
      "Skaria Medical Center provides individualized holistic protocols that identify physical, mental, and spiritual imbalances, then combines traditional African herbal remedies with modern clinical care.",
    overview: [
      "Founder: Nelly Mwaniki, Family Nurse Practitioner, brings over 15 years of clinic experience across all lifespans, chronic disease management, weight management, telehealth delivery, and multidisciplinary collaboration.",
      "Vision: Expand access to holistic healthcare through telemedicine while maintaining warm, person-centered care.",
      "Specialties include women's health and hormone regulation, men's health and virility, immune support, body strengthening, hair loss treatment, weight management, and blood pressure and blood sugar management.",
      "Skaria integrates wholesome nutrition, body conditioning, and herbal remedies into practical daily wellness plans.",
    ],
    contact: {
      email: "hello@skaria.care",
      phone: "+1 (323) 913-4688",
      whatsapp: "254795920217",
      address: " ",
      hours: "Mon-Fri 8am-7pm · Sat 9am-2pm",
    },
    stats: { practitioners: 6, services: 10, yearsActive: 15 },
    services: [
      {
        id: "sk-s1",
        name: "Blood Pressure Management Program",
        description: "Guided plan using lifestyle counseling and herbal options such as hibiscus, lemongrass, thyme, and moringa support.",
        duration: "90 min",
        price: "$0",
      },
      {
        id: "sk-s2",
        name: "Blood Sugar Stabilization Program",
        description: "Integrative glucose support using nutrition and herbal protocols including moringa, bitter melon, guava leaf, and black-jack guidance.",
        duration: "60 min",
        price: "$0",
      },
      {
        id: "sk-s3",
        name: "Hormonal Balance Care",
        description: "Women's wellness consults focused on menstrual support, menopause symptoms, and natural anti-inflammatory protocols.",
        duration: "75 min",
        price: "$0",
      },
      {
        id: "sk-s4",
        name: "Weight Management Reset",
        description: "Personalized coaching combining nutrition, movement, and metabolic herbs such as green tea, ginger, and cinnamon.",
        duration: "45 min",
        price: "$0",
      },
      {
        id: "sk-s5",
        name: "Acne and Skin Wellness Support",
        description: "Natural skin-support protocol featuring neem, aloe vera, turmeric, and safe topical guidance.",
        duration: "45 min",
        price: "$0",
      },
      {
        id: "sk-s6",
        name: "Men's Prostate Health Support",
        description: "Integrative consult using nutritional plans and herbal support with pygeum, nettle root, and mpesu.",
        duration: "60 min",
        price: "$0",
      },
    ],
    schedule: [
      {
        day: "Monday",
        slots: [
          { time: "9:00 AM", service: "Blood Pressure Management Program", practitioner: "Nelly Mwaniki, FNP" },
          { time: "1:30 PM", service: "Weight Management Reset", practitioner: "Nelly Mwaniki, FNP" },
        ],
      },
      {
        day: "Tuesday",
        slots: [
          { time: "10:30 AM", service: "Blood Sugar Stabilization Program", practitioner: "Nelly Mwaniki, FNP" },
          { time: "4:00 PM", service: "Hormonal Balance Care", practitioner: "Nelly Mwaniki, FNP" },
        ],
      },
      {
        day: "Wednesday",
        slots: [{ time: "11:00 AM", service: "Men's Prostate Health Support", practitioner: "Nelly Mwaniki, FNP" }],
      },
      {
        day: "Thursday",
        slots: [
          { time: "9:30 AM", service: "Acne and Skin Wellness Support", practitioner: "Nelly Mwaniki, FNP" },
          { time: "1:00 PM", service: "Hormonal Balance Care", practitioner: "Nelly Mwaniki, FNP" },
        ],
      },
      {
        day: "Friday",
        slots: [{ time: "8:00 AM", service: "Blood Pressure Management Program", practitioner: "Nelly Mwaniki, FNP" }],
      },
    ],
    products: [
      {
        id: "sk-p1",
        name: "Herbal Regenerator",
        description: "Herbal drink with essential vitamins and minerals from 15 medicinal plants. Supports nervous system repair, blood circulation, digestion, and restful sleep.",
        price: "$0",
        category: "Herbal blends",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/MoringaLeavesBaguio.jpg",
      },
      {
        id: "sk-p2",
        name: "Morning Energizer",
        description: "Blend of 4 African herbs for smoothies, porridge, or workout drinks. Supports weight goals, blood sugar regulation, hair growth, and micronutrient replenishment.",
        price: "$0",
        category: "Daily nutrition",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Moringa_oleifera_1.jpg",
      },
      {
        id: "sk-p3",
        name: "Healing Spice",
        description: "Digestive spice blend sprinkled on prepared meals. Supports gut comfort and reduces acidity.",
        price: "$0",
        category: "Digestive support",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ginger_rhizome.jpg",
      },
      {
        id: "sk-p4",
        name: "Prostate Rejuvenator",
        description: "Potent drink made with Prunus africana to support prostate health and urinary comfort.",
        price: "$0",
        category: "Men's health",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Prunus_africana_MS_3588.jpg",
      },
      {
        id: "sk-p5",
        name: "Mojo Booster",
        description: "Special blend of 7 ingredients including African berries and herbs to support vitality.",
        price: "$0",
        category: "Vitality",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Hibiscus_sabdariffa.jpg",
      },
      {
        id: "sk-p6",
        name: "Memory Amplifier",
        description: "Green herbal blend intended to support memory, focus, and healthy aging.",
        price: "$0",
        category: "Cognitive support",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Rosmarinus_officinalis3.jpg",
      },
      {
        id: "sk-p7",
        name: "Oral Refresher",
        description: "Warburgia ugandensis-based oral formula for gum and dental support.",
        price: "$0",
        category: "Oral care",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Warburgia_salutaris_1.jpg",
      },
      {
        id: "sk-p8",
        name: "Mental Cooler",
        description: "Cooling support blend that helps soothe nerves, ease headaches, and promote restful sleep.",
        price: "$0",
        category: "Stress support",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Lavandula_angustifolia_(2).jpg",
      },
      {
        id: "sk-p9",
        name: "Gut Restorer (Goat Kefir)",
        description: "Nutrient-dense fermented goat milk beverage with probiotics and minerals. Easier digestion due to its A2 casein profile.",
        price: "$0",
        category: "Gut health",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kefir_Grains.jpg",
      },
      {
        id: "sk-p10",
        name: "Fibroid and Bone Support Protocol",
        description: "Integrated herbal support plan aimed at fibroid prevention, menopause comfort, bone support, and anemia care.",
        price: "$0",
        category: "Women's health",
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Urtica_dioica_3.jpg",
      },
    ],
    blogs: [
      {
        id: "sk-b1",
        title: "African herbal options for blood pressure management",
        date: "2026-05-12",
        author: "Nelly Mwaniki, FNP",
        excerpt: "How hibiscus, moringa, lemongrass, and thyme are integrated with monitoring and lifestyle plans.",
        readMin: 6,
      },
      {
        id: "sk-b2",
        title: "Balancing hormones with East African plant traditions",
        date: "2026-04-28",
        author: "Nelly Mwaniki, FNP",
        excerpt: "A practical guide to supportive herbs, nutrition, and inflammation control for women's wellness.",
        readMin: 5,
      },
      {
        id: "sk-b3",
        title: "Food, herbs, and daily rhythm for blood sugar stability",
        date: "2026-03-15",
        author: "Nelly Mwaniki, FNP",
        excerpt: "Combining meal timing, movement, and traditional herbs to reduce spikes and improve long-term outcomes.",
        readMin: 4,
      },
    ],
  },
];
const PRACTITIONERS = [
  {
    id: "pr-sk-1",
    centerSlug: "skaria",
    firstName: "Nelly",
    lastName: "Mwaniki",
    role: "Family Nurse Practitioner and Founder",
    credentials: "MSN, FNP",
    bio: "Over 15 years of clinic experience with strengths in chronic disease management, telehealth delivery, and holistic primary care.",
    photo: "assets/nelly-mwaniki.jpg",
    linkedin: "https://www.linkedin.com/in/nelly-mwaniki-914309281",
  },
];

const TESTIMONIALS = [
  {
    id: "t-sk-1",
    centerSlug: "skaria",
    quote: "Skaria changed how I think about my health. The integrative assessment uncovered patterns my primary care missed for years.",
    author: "Aisha K.",
    context: "Patient since 2023",
    featured: true,
  },
  {
    id: "t-sk-2",
    centerSlug: "skaria",
    quote: "The coaching sessions gave me structure without rigidity. I finally sleep through the night.",
    author: "Tomás S.",
    context: "Wellness program member",
    featured: true,
  },
  {
    id: "t-sk-3",
    centerSlug: "skaria",
    quote: "Bodywork at Skaria is clinical and restorative, not spa fluff. My chronic shoulder pain is manageable now.",
    author: "Jordan M.",
    context: "Holistic bodywork client",
    featured: false,
  },
  {
    id: "t-platform-1",
    centerSlug: null,
    quote: "oneMedicare let us launch three practice types on one platform without compromising data isolation.",
    author: "Dr. Renee Park",
    context: "Medical Director, Harbor Wellness",
    featured: true,
  },
  {
    id: "t-platform-2",
    centerSlug: null,
    quote: "Onboarding took a week, not six months. Our practitioners were scheduling patients the same day we went live.",
    author: "Marcus Webb",
    context: "Founder, Align Physical Therapy",
    featured: true,
  },
  {
    id: "t-platform-3",
    centerSlug: null,
    quote: "The directory experience helps patients find the right specialty mix, exactly what multi-category centers need.",
    author: "Elena Vasquez",
    context: "Practitioner, Skaria",
    featured: true,
  },
];

const PLATFORM_CONTACT = {
  email: "hello@onemedicare.care",
  phone: "+1 (503) 555-0100",
  whatsapp: "15035550142",
};

window.OM_DATA = {
  CATEGORIES,
  VALUE_PROPS,
  CENTERS,
  PRACTITIONERS,
  TESTIMONIALS,
  PLATFORM_CONTACT,
};

export const translations = {
  en: {
    meta: {
      title: 'Group ARGO | Growth, Digital Marketing & AI Technology',
      description:
        'A growth partner, not an agency: digital marketing and AI technology, built around your business. Book a call.',
      pages: {
        '/': {
          title: 'Group ARGO | Growth, Digital Marketing & AI Technology',
          description:
            'A growth partner, not an agency: digital marketing and AI technology, built around your business. Book a call.',
        },
        '/about': {
          title: 'About Group ARGO | Growth, Digital Marketing & AI Technology',
          description:
            'Group ARGO is a growth partner for digital marketing and AI technology, working with businesses worldwide from Barcelona and Miami.',
        },
        '/contact': {
          title: 'Contact Group ARGO | Growth, Digital Marketing & AI Technology',
          description:
            'Talk to the Group ARGO team about growth, digital marketing and AI technology for your business.',
        },
        '/digital-marketing': {
          title: 'Digital Marketing | Group ARGO',
          description:
            'Performance campaigns on Meta, Google, TikTok and LinkedIn Ads that turn ad spend into predictable revenue.',
        },
        '/ai-technology': {
          title: 'AI Technology & Automation | Group ARGO',
          description:
            'AI-powered funnel automation and integration: custom AI, CRM and lead capture, full-funnel automation and ROI reporting.',
        },
        '/creative-brand': {
          title: 'Creative & Brand Assets | Group ARGO',
          description:
            'Brand foundations, ad creative, social media and website design, built to perform inside your campaigns.',
        },
        '/thank-you': {
          title: 'Thank You | Group ARGO',
          description:
            'Thanks for reaching out to ARGO Group. Our team will contact you within 24 hours.',
        },
        '/cookie-policy': {
          title: 'Cookie Policy | Group ARGO',
          description:
            'The cookies and browser storage Group ARGO uses, what each one does, how long it lasts and how to change your choice.',
        },
        '/privacy-policy': {
          title: 'Privacy Policy | Group ARGO',
          description:
            'How ARGO Group collects, uses, stores, and protects personal data, and the rights you have over it.',
        },
        '/terms-of-service': {
          title: 'Terms of Service | Group ARGO',
          description:
            'The terms for using the Group ARGO website and for the services we provide, and how they relate to your signed agreement.',
        },
      },
    },
    nav: {
      services: 'Services',
      why: 'Why ARGO',
      testimonials: 'Testimonials',
      faq: 'FAQ',
      about: 'About',
      contact: 'Contact',
      cta: 'Get in Touch',
    },
    about: {
      title: 'About ARGO Group',
      sub: 'A growth partner for digital marketing and AI technology, built around transparency, speed, and direct access.',
      intro: [
        'ARGO Group is a growth partner for digital marketing and AI technology. We work with companies that want their advertising spend to turn into predictable revenue, and we keep paid media, funnel automation, and creative production inside a single team so strategy, execution, and measurement never sit in separate silos.',
        'We work from the Miami and Barcelona time zones and serve our clients online. That lets us work with companies all over the world and adapt to their time zones, in English and Spanish, without the handoffs and delays that distance usually introduces.',
        'We are deliberately not a volume agency. Every client works with a dedicated account manager who knows the account, and you talk to the people doing the work rather than to a layer of account handlers.',
      ],
      sections: [
        {
          title: 'What we do',
          desc: 'Three connected practices: performance marketing across Meta, Google, TikTok, and LinkedIn Ads; AI process automation that links your CRM, forms, and internal tools into one funnel; and creative and brand assets built to be tested and iterated inside those campaigns.',
        },
        {
          title: 'How we work',
          desc: 'Full visibility into what your budget is doing and why. Campaigns are reviewed daily rather than reported monthly, decisions are explained as they are made, and you receive concrete optimization steps whenever something needs to improve.',
        },
        {
          title: 'How we communicate',
          desc: 'Direct access to the team from 9:00 to 18:00 in both Spain and Miami, over WhatsApp, email, or Slack. Questions get answered the same day, and new enquiries receive a reply within 24 hours.',
        },
        {
          title: 'What we build on',
          desc: 'We work with the platforms you already use and build what is missing: HubSpot and Pipedrive for CRM, n8n and Make for automation, and custom integration layers where off-the-shelf connectors fall short.',
        },
      ],
      factsTitle: 'At a glance',
      facts: [
        { label: 'Offices',       value: 'Barcelona, Spain · Miami, Florida' },
        { label: 'Clients',       value: 'Worldwide, online, adapting to their time zones' },
        { label: 'Languages',     value: 'English and Spanish' },
        { label: 'Hours',         value: 'Monday to Friday, 09:00–18:00 (Spain and Miami)' },
        { label: 'Response time', value: 'Within 24 hours' },
      ],
      ctaTitle: 'Want to talk?',
      ctaSub: 'Tell us about your business and we will get back to you within 24 hours.',
      cta: 'Contact the team',
    },
    hero: {
      badge: 'Barcelona · Miami',
      headline: 'ARGO',
      sub: 'We scale your business with digital marketing and AI technology',
      sub2: 'Growth, Digital Marketing & AI Technology',
      cta1: 'Talk to Our Team',
      cta2: 'Services',
      stats: [
        { value: '1-on-1', label: 'Dedicated Account Management' },
        { value: 'Transparent', label: 'No Hidden Fees or Surprises' },
        { value: 'Adaptable', label: 'Flexible & Scalable Solutions' },
      ],
    },
    // The home hero (src/components/ArgoHero). Hero.jsx still reads `hero`.
    // The card figures are the design's examples, not client results: swap them
    // for real case figures before this goes live. Same order in both languages:
    // each card is pinned to a city on the globe (src/pages/Home.jsx).
    argoHero: {
      ariaLabel: 'Group ARGO — growth-driven marketing and AI automation',
      markLabel: 'Group ARGO symbol',
      pill: 'AI automation · Paid media · CRM',
      title: 'Growth-driven marketing',
      titleAccent: '& AI automation.',
      lede: 'Paid media, CRM and automation systems that turn ad spend into predictable revenue.',
      book: 'Book a call',
      work: 'See our work',
      locations: 'Barcelona · Miami',
      scroll: 'Scroll',
      cards: [
        { label: 'Barcelona · Ads', before: 'ROAS ', gold: '4.2x', after: '', caption: 'Meta + Google · 90 days' },
        { label: 'Miami · CRM', before: '', gold: '+38%', after: ' leads', caption: 'HubSpot pipeline' },
        { label: 'London · AI', before: 'CPL ', gold: '−27%', after: '', caption: 'n8n + Make workflows' },
      ],
    },
    services: {
      eyebrow: 'What we do',
      title: 'Our Services',
      // The word the section heading sets in the display serif. Must appear
      // verbatim in `title`; SectionTitle falls back to the plain title if not.
      accent: 'Services',
      items: [
        {
          title: 'Digital Marketing',
          subtitle: 'We run performance campaigns that turn ad spend into predictable revenue',
          sections: [
            {
              heading: 'Paid Media & Channel Strategy',
              headline: 'The right message, on the right platform, in front of the right people',
              items: [
                'Meta Ads, Google Ads, TikTok Ads, and LinkedIn Ads; we pick the channels that match your audience',
                'Full alignment with your marketing objectives, commercial calendars, and product launches',
                'Scaling plans built to grow revenue without sacrificing profitability',
              ],
            },
            {
              heading: 'Campaign Optimization',
              headline: 'We\'re inside your campaigns every day so you don\'t have to be',
              items: [
                'Continuous optimization of campaign structure, audience segmentation, and budget allocation',
                'Real-time, data-driven decisions; no waiting for monthly reports to fix what\'s broken',
                'A/B testing across creatives, copy, and targeting to find what converts fastest',
              ],
            },
            {
              heading: 'Conversion & Growth',
              headline: 'More clicks mean nothing without conversions',
              items: [
                'Conversion rate optimization for forms, landing pages, and checkout flows',
                'Advanced lead generation strategies focused on quality, not just volume',
                'Sustainable growth planning with profitability as the north star',
              ],
            },
          ],
        },
        {
          title: 'AI Technology & Automation',
          subtitle: 'AI-Powered Funnel Automation & Integration',
          sections: [
            {
              heading: 'Custom AI Integration',
              headline: 'Bridging your tech stack at the infrastructure level',
              items: [
                'We architect the integration layer between your platforms.',
                'Intelligent Document & Data Processing: extract, validate, and route structured data.',
                'App & Platform Configuration: From configuring your existing stack to building what doesn\'t exist yet.',
              ],
            },
            {
              heading: 'CRM & Lead Capture',
              headline: 'Every lead captured, synced, and ready to close',
              items: [
                'Instant CRM sync with HubSpot, Pipedrive, and more; zero leads fall through the cracks',
                'Real-time alerts so your sales team acts at the right moment',
                'Automatic lead scoring and segmentation out of the box',
              ],
            },
            {
              heading: 'Full-Funnel Automation',
              headline: 'From first click to closed deal; fully automated',
              items: [
                'End-to-end workflows: lead capture, nurturing, and delivery without manual steps',
                'Instant personalization: AI generates custom content and communications at scale',
                'Connected systems: your entire tech stack works together, automatically',
              ],
            },
            {
              heading: 'Reporting & ROI Visibility',
              headline: 'Always know what\'s working and why',
              items: [
                'Custom dashboards: real-time view of ad spend, lead costs, and campaign ROI',
                'One centralized report for all your metrics; no more spreadsheet juggling',
                'Predictive analytics to anticipate growth and adjust strategy before it\'s too late',
              ],
            },
          ],
        },
        {
          title: 'Creative & Brand Assets',
          subtitle: 'Where brand identity meets measurable results',
          sections: [
            {
              heading: 'Brand Foundations That Perform',
              headline: 'A consistent brand is the baseline for any campaign that scales',
              items: [
                'Logo, color systems, typography, and brand guide built to perform across paid and organic channels',
                'Visual identity designed with conversion in mind',
                'Brand foundations that make every ad, landing page, and post instantly recognizable',
              ],
            },
            {
              heading: 'Creative Built for Paid Media',
              headline: 'Ad creatives designed to be tested, iterated, and optimized',
              items: [
                'Static and motion creatives tailored for Ads',
                'Visuals aligned with audience, funnel stage, and campaign objective',
                'Iterative design process integrated with our performance team: we create, test, and double down on what works',
              ],
            },
            {
              heading: 'Social Media & Website Design',
              headline: 'The digital surfaces where your audience meets your brand',
              items: [
                'Social media feed setup and launch content aligned with your brand guide',
                'Website design or redesign focused on clarity, speed, and conversion',
                'Seamless integration with our performance marketing and automation workflows',
              ],
            },
            {
              heading: 'Additional Creative Services',
              headline: 'Everything else your brand might need along the way',
              items: [
                'Merchandise design, editorial, and packaging',
                'Custom creative for product launches, events, and seasonal campaigns',
                'Project-based creative work tailored to specific commercial goals',
              ],
            },
          ],
        },
      ],
    },
    whyArgo: {
      eyebrow: 'What sets us apart',
      title: 'Why ARGO',
      accent: 'ARGO',
      intro: [
        'Unlike traditional agencies, we function as a close, flexible partner deeply invested in your success.',
        'Direct communication isn\'t optional; it\'s essential. Questions and challenges arise throughout any project, and addressing them quickly makes all the difference.',
        'We work from the Miami and Barcelona time zones and serve clients online, worldwide, adapting to the time zone of each one.',
      ],
      items: [
        { title: 'Agile & Efficient Execution',    desc: 'We integrate as an extension of your team; moving fast, cutting bureaucracy, and delivering with precision.' },
        { title: 'Creative-First Performance',      desc: 'Creativity drives our strategy. Strong scripting, deep audience insight, and campaigns built to convert.' },
        { title: 'Transparency & Data Control',    desc: 'Full visibility into your KPIs at all times. You always know what\'s working, what isn\'t, and what\'s next.' },
        { title: 'Scalable Infrastructure',        desc: 'Systems built to grow with you; stable, efficient, and ready for whatever comes next.' },
      ],
    },
    testimonials: {
      eyebrow: 'Real results',
      title: 'What Our Clients Say',
      accent: 'Clients',
      items: [
        { quote: 'Our problem wasn\'t getting leads, it was managing them. Many were coming in, but there was no clear follow-up and we were losing opportunities. They implemented AI-powered automations to filter, prioritize, and nurture leads. They also reorganized the entire contact process.', name: 'Carlos Martínez',   role: 'CEO, TechScale EU',            initials: 'CM' },
        { quote: 'Before working with Argo, we were investing in ads but without being clear on what was actually working. Within a few weeks, they helped us organize the entire funnel and we started seeing more stable results.',                                                                 name: 'Laura Sánchez',     role: 'Marketing Director, GrowthCo', initials: 'LS' },
        { quote: 'What surprised me most was the communication. We came from agencies where everything was slow or unclear, and here it\'s the opposite. You write to them and they respond quickly with concrete solutions. That\'s greatly appreciated!',                                          name: 'Marc Puigdomènech', role: 'Founder, Barcelona Ventures',  initials: 'MP' },
        { quote: 'We were investing more and more without being clear if it was sustainable. They started measuring properly, optimizing campaigns, and automating parts of the funnel. Within a few months, they managed to reduce our CAC and maintain growth without blowing up our budget.',     name: 'Sofia Romano',      role: 'Head of Sales, ScaleUp Miami', initials: 'SR' },
      ],
    },
    clients: {
      title: 'Trusted By',
      // Empty until there are real, cleared client names to show: the strip
      // renders nothing while this is empty (see components/Clients.jsx).
      names: [],
    },
    faq: {
      eyebrow: 'Good to know',
      title: 'Frequently Asked Questions',
      accent: 'Questions',
      items: [
        {
          q: 'How does the onboarding process work?',
          a: 'We start with a discovery call to understand your business, goals, and current systems. From there, we design a tailored action plan and begin execution within days. No lengthy onboarding processes or unnecessary back-and-forth.',
        },
        {
          q: 'Who will I be working with day-to-day?',
          a: 'You\'ll have a dedicated account manager as your main point of contact, reachable via WhatsApp, email, or Slack between 9AM–6PM (Spain & Miami time). No account juggling, no middlemen.',
        },
        {
          q: 'How involved do I need to be?',
          a: 'As much or as little as you prefer. We work as an extension of your team, so we can operate with high autonomy while keeping you fully informed, or collaborate closely if you prefer that.',
        },
        {
          q: 'How long before I see results?',
          a: 'For performance marketing campaigns, you can expect initial data and optimizations within the first 2–4 weeks. Automation systems typically go live within the first month. Sustainable growth compounds from there.',
        },
        {
          q: 'What if a campaign isn\'t performing?',
          a: 'We monitor campaigns daily and adjust proactively. You\'ll always know what\'s happening and why; full transparency is core to how we work.',
        },
        {
          q: 'Do I need existing tools or tech set up before working with you?',
          a: 'Not at all. We can build your stack from scratch or plug into what you already have. We work with n8n, Make, and other automation platforms to connect everything seamlessly.',
        },
      ],
    },
    homeContact: {
      eyebrow: "Let's talk",
      title: 'Ready to Scale?',
      accent: 'Scale',
      sub: "Tell us about your business and we'll get back to you within 24 hours.",
    },
    contactPage: {
      title: "Let's Talk",
      sub: 'Fill out the form below and our team will reach out within 24 hours.',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
    },
    contactForm: {
      name:        'Full Name',
      email:       'Email',
      phone:       'Phone / WhatsApp',
      company:     'Company',
      subject:     'Subject',
      message:     'Message',
      send:        'Send Message',
      consent:     'I have read the',
      privacyLink: 'Privacy Policy',
      consentEnd:  'and agree to be contacted about my request.',
      ph_name:     'John Doe',
      ph_email:    'john@example.com',
      ph_phone:    '+1 (555) 000-0000',
      ph_company:  'Your Company',
      ph_subject:  'How can we help you?',
      ph_message:  'Tell us about your business...',
      err_required: 'This field is required.',
      err_email:    'Please enter a valid email address.',
      err_phone:    'That phone number does not look right.',
      err_consent:  'Please confirm you have read the Privacy Policy.',
      err_generic:  'Something went wrong. Please try again or email us directly.',
    },
    thankYou: {
      headline: "You're all set.",
      sub:      'Thanks for reaching out. Our team will contact you within 24 hours.',
      cta:      'Back to Home',
    },
    footer: {
      tagline:      'We scale your business with digital marketing and AI technology.',
      navTitle:     'Navigation',
      contactTitle: 'Contact',
      copy:         '© 2026 ARGO Group. All rights reserved.',
      privacy:      'Privacy Policy',
      terms:        'Terms of Service',
      cookies:      'Cookie Policy',
      cookieSettings: 'Cookie Settings',
    },
  },

  es: {
    meta: {
      title: 'ARGO Group | Crecimiento, Marketing Digital y Tecnología IA',
      description:
        'Un partner de crecimiento, no una agencia: marketing digital y tecnología de IA, a medida de tu negocio. Consigue una llamada.',
      pages: {
        '/': {
          title: 'ARGO Group | Crecimiento, Marketing Digital y Tecnología IA',
          description:
            'Un partner de crecimiento, no una agencia: marketing digital y tecnología de IA, a medida de tu negocio. Consigue una llamada.',
        },
        '/about': {
          title: 'Sobre ARGO Group | Crecimiento, Marketing Digital y Tecnología IA',
          description:
            'ARGO Group es un partner de crecimiento en marketing digital y tecnología de IA, con oficinas en Barcelona y Miami, que atiende clientes en todo el mundo en inglés y español.',
        },
        '/contact': {
          title: 'Contacta con ARGO Group | Crecimiento, Marketing Digital y Tecnología IA',
          description:
            'Habla con el equipo de ARGO Group sobre crecimiento, marketing digital y tecnología de IA para tu negocio. Respondemos en 24 horas.',
        },
        '/digital-marketing': {
          title: 'Marketing Digital | Group ARGO',
          description:
            'Campañas de performance en Meta, Google, TikTok y LinkedIn Ads que convierten inversión publicitaria en ingresos predecibles.',
        },
        '/ai-technology': {
          title: 'Tecnología IA y Automatización | Group ARGO',
          description:
            'Automatización e integración del funnel con IA: IA a medida, CRM y captación de leads, automatización completa y reporting de ROI.',
        },
        '/creative-brand': {
          title: 'Creatividad y Activos de Marca | Group ARGO',
          description:
            'Bases de marca, creatividades para anuncios, redes sociales y diseño web, pensados para rendir dentro de tus campañas.',
        },
        '/thank-you': {
          title: 'Gracias | ARGO Group',
          description:
            'Gracias por contactar con ARGO Group. Nuestro equipo se pondrá en contacto en 24 horas.',
        },
        '/cookie-policy': {
          title: 'Política de Cookies | ARGO Group',
          description:
            'Las cookies y el almacenamiento del navegador que usa ARGO Group, para qué sirve cada uno, cuánto dura y cómo cambiar tu elección.',
        },
        '/privacy-policy': {
          title: 'Política de Privacidad | ARGO Group',
          description:
            'Cómo ARGO Group recopila, usa, almacena y protege los datos personales, y los derechos que tienes sobre ellos.',
        },
        '/terms-of-service': {
          title: 'Términos de Servicio | ARGO Group',
          description:
            'Los términos que rigen el uso del sitio web de ARGO Group y los servicios que prestamos.',
        },
      },
    },
    nav: {
      services: 'Servicios',
      why: 'Por qué ARGO',
      testimonials: 'Testimonios',
      faq: 'FAQ',
      about: 'Nosotros',
      contact: 'Contacto',
      cta: 'Contáctanos',
    },
    about: {
      title: 'Sobre ARGO Group',
      sub: 'Un partner de crecimiento en marketing digital y tecnología de IA, construido sobre transparencia, rapidez y acceso directo.',
      intro: [
        'ARGO Group es un partner de crecimiento en marketing digital y tecnología de IA. Trabajamos con empresas que quieren que su inversión publicitaria se convierta en ingresos predecibles, y mantenemos paid media, automatización del funnel y producción creativa dentro de un mismo equipo, para que estrategia, ejecución y medición nunca queden en compartimentos separados.',
        'Trabajamos desde las zonas horarias de Miami y Barcelona y atendemos a nuestros clientes online. Eso nos permite trabajar con empresas de todo el mundo y adaptarnos a sus zonas horarias, en inglés y español, sin las transferencias y demoras que suele introducir la distancia.',
        'No somos una agencia de volumen, y es deliberado. Cada cliente trabaja con un account manager dedicado que conoce la cuenta, y hablas con las personas que hacen el trabajo, no con una capa de intermediarios.',
      ],
      sections: [
        {
          title: 'Qué hacemos',
          desc: 'Tres prácticas conectadas: performance marketing en Meta, Google, TikTok y LinkedIn Ads; automatización de procesos con IA que conecta tu CRM, formularios y herramientas internas en un único funnel; y creatividades y activos de marca diseñados para testarse e iterarse dentro de esas campañas.',
        },
        {
          title: 'Cómo trabajamos',
          desc: 'Visibilidad total sobre qué hace tu presupuesto y por qué. Revisamos las campañas a diario en lugar de reportar una vez al mes, explicamos las decisiones según se toman y recibes pasos concretos de optimización cuando algo necesita mejorar.',
        },
        {
          title: 'Cómo nos comunicamos',
          desc: 'Acceso directo al equipo de 9:00 a 18:00 tanto en España como en Miami, por WhatsApp, email o Slack. Las preguntas se responden el mismo día, y las consultas nuevas reciben respuesta en menos de 24 horas.',
        },
        {
          title: 'Sobre qué construimos',
          desc: 'Trabajamos con las plataformas que ya usas y construimos lo que falta: HubSpot y Pipedrive para CRM, n8n y Make para automatización, y capas de integración a medida donde los conectores estándar se quedan cortos.',
        },
      ],
      factsTitle: 'De un vistazo',
      facts: [
        { label: 'Oficinas',            value: 'Barcelona, España · Miami, Florida' },
        { label: 'Clientes',            value: 'En todo el mundo, online, adaptándonos a sus zonas horarias' },
        { label: 'Idiomas',             value: 'Inglés y español' },
        { label: 'Horario',             value: 'Lunes a viernes, 09:00–18:00 (España y Miami)' },
        { label: 'Tiempo de respuesta', value: 'Menos de 24 horas' },
      ],
      ctaTitle: '¿Hablamos?',
      ctaSub: 'Cuéntanos sobre tu negocio y te responderemos en menos de 24 horas.',
      cta: 'Contactar con el equipo',
    },
    hero: {
      badge: 'Barcelona · Miami',
      headline: 'ARGO',
      sub: 'Escalamos tu negocio con marketing digital y tecnología de IA',
      sub2: 'Crecimiento, Marketing Digital y Tecnología IA',
      cta1: 'Habla con Nuestro Equipo',
      cta2: 'Servicios',
      stats: [
        { value: '1-on-1', label: 'Gestión de Cuenta Dedicada' },
        { value: 'Transparente', label: 'Sin Costes Ocultos ni Sorpresas' },
        { value: 'Adaptable', label: 'Soluciones Flexibles y Escalables' },
      ],
    },
    argoHero: {
      ariaLabel: 'Group ARGO — marketing de crecimiento y automatización con IA',
      markLabel: 'Símbolo de Group ARGO',
      pill: 'Automatización IA · Paid media · CRM',
      title: 'Marketing de crecimiento',
      titleAccent: 'y automatización con IA.',
      lede: 'Paid media, CRM y sistemas de automatización que convierten la inversión publicitaria en ingresos predecibles.',
      book: 'Agenda una llamada',
      work: 'Ver nuestro trabajo',
      locations: 'Barcelona · Miami',
      scroll: 'Desliza',
      cards: [
        { label: 'Barcelona · Ads', before: 'ROAS ', gold: '4,2x', after: '', caption: 'Meta + Google · 90 días' },
        { label: 'Miami · CRM', before: '', gold: '+38%', after: ' leads', caption: 'Pipeline en HubSpot' },
        { label: 'Londres · IA', before: 'CPL ', gold: '−27%', after: '', caption: 'Flujos con n8n + Make' },
      ],
    },
    services: {
      eyebrow: 'Lo que hacemos',
      title: 'Nuestros Servicios',
      accent: 'Servicios',
      items: [
        {
          title: 'Marketing Digital',
          subtitle: 'Gestionamos campañas de performance que convierten inversión publicitaria en ingresos predecibles',
          sections: [
            {
              heading: 'Paid Media y Estrategia de Canales',
              headline: 'El mensaje correcto, en la plataforma correcta, frente a las personas correctas',
              items: [
                'Meta Ads, Google Ads, TikTok Ads y LinkedIn Ads; elegimos los canales que encajan con tu audiencia',
                'Alineación total con tus objetivos de marketing, calendarios comerciales y lanzamientos de producto',
                'Planes de escalado diseñados para crecer en ingresos sin sacrificar rentabilidad',
              ],
            },
            {
              heading: 'Optimización de Campañas',
              headline: 'Estamos dentro de tus campañas cada día para que tú no tengas que estarlo',
              items: [
                'Optimización continua de estructura de campañas, segmentación de audiencias y asignación de presupuesto',
                'Decisiones en tiempo real basadas en datos; sin esperar informes mensuales para arreglar lo que falla',
                'A/B testing en creatividades, copy y segmentación para encontrar lo que convierte más rápido',
              ],
            },
            {
              heading: 'Conversión y Crecimiento',
              headline: 'Más clics no significan nada sin conversiones',
              items: [
                'Optimización de la tasa de conversión en formularios, landing pages y flujos de compra',
                'Estrategias avanzadas de generación de leads enfocadas en calidad, no solo en volumen',
                'Planificación de crecimiento sostenible con la rentabilidad como norte',
              ],
            },
          ],
        },
        {
          title: 'Tecnología IA y Automatización',
          subtitle: 'Automatización avanzada del funnel con IA e integración de sistemas',
          sections: [
            {
              heading: 'Integración IA a Medida',
              headline: 'Conectamos tu stack tecnológico a nivel de infraestructura',
              items: [
                'Diseñamos la capa de integración entre tus plataformas.',
                'Procesamiento Inteligente de Documentos y Datos: extrae, valida y enruta datos estructurados.',
                'Configuración de Apps y Plataformas: Desde configurar tu stack actual hasta construir lo que aún no existe.',
              ],
            },
            {
              heading: 'CRM y Captación de Leads',
              headline: 'Cada lead capturado, sincronizado y listo para cerrar',
              items: [
                'Sincronización instantánea con HubSpot, Pipedrive y más; cero leads perdidos',
                'Alertas en tiempo real para que tu equipo actúe en el momento exacto',
                'Puntuación y segmentación automática de leads desde el primer día',
              ],
            },
            {
              heading: 'Automatización Full-Funnel',
              headline: 'Del primer clic al cierre; completamente automatizado',
              items: [
                'Flujos end-to-end: captación, nurturing y entrega del lead sin pasos manuales',
                'Personalización instantánea: la IA genera contenido y comunicaciones a escala',
                'Sistemas conectados: todo tu stack tecnológico trabajando junto, automáticamente',
              ],
            },
            {
              heading: 'Reporting y Visibilidad del ROI',
              headline: 'Siempre sabrás qué funciona y por qué',
              items: [
                'Dashboards personalizados: vista en tiempo real de inversión, coste por lead y ROI',
                'Un informe centralizado para todas tus métricas; sin más hojas de cálculo',
                'Analítica predictiva para anticipar el crecimiento y ajustar la estrategia a tiempo',
              ],
            },
          ],
        },
        {
          title: 'Creatividad y Activos de Marca',
          subtitle: 'Donde la identidad de marca se convierte en resultados medibles',
          sections: [
            {
              heading: 'Bases de Marca que Convierten',
              headline: 'Una marca consistente es la base de cualquier campaña que escala',
              items: [
                'Logo, sistemas de color, tipografía y guía de marca diseñados para rendir en canales de pago y orgánicos',
                'Identidad visual concebida con la conversión en mente',
                'Bases de marca que hacen que cada anuncio, landing page y publicación sea reconocible al instante',
              ],
            },
            {
              heading: 'Creatividades para Paid Media',
              headline: 'Creatividades diseñadas para ser testadas, iteradas y optimizadas',
              items: [
                'Creatividades estáticas y en movimiento adaptadas a cada plataforma de Ads',
                'Visuales alineados con la audiencia, la fase del funnel y el objetivo de campaña',
                'Proceso de diseño iterativo integrado con nuestro equipo de performance: creamos, testamos y apostamos por lo que funciona',
              ],
            },
            {
              heading: 'Redes Sociales y Diseño Web',
              headline: 'Las superficies digitales donde tu audiencia se encuentra con tu marca',
              items: [
                'Configuración del feed de redes sociales y contenido de lanzamiento alineado con tu guía de marca',
                'Diseño o rediseño de web enfocado en claridad, velocidad y conversión',
                'Integración fluida con nuestros flujos de performance marketing y automatización',
              ],
            },
            {
              heading: 'Servicios Creativos Adicionales',
              headline: 'Todo lo demás que tu marca pueda necesitar en el camino',
              items: [
                'Diseño de merchandising, editorial y packaging',
                'Creatividades personalizadas para lanzamientos de producto, eventos y campañas de temporada',
                'Trabajo creativo por proyecto adaptado a objetivos comerciales específicos',
              ],
            },
          ],
        },
      ],
    },
    whyArgo: {
      eyebrow: 'Nuestra diferencia',
      title: '¿Por qué ARGO?',
      accent: 'ARGO',
      intro: [
        'A diferencia de las agencias tradicionales, funcionamos como un partner cercano y flexible, profundamente comprometido con tu éxito.',
        'La comunicación directa no es opcional; es esencial. Las preguntas y los desafíos surgen a lo largo de cualquier proyecto, y abordarlos rápidamente marca la diferencia.',
        'Trabajamos desde las zonas horarias de Miami y Barcelona y atendemos online a clientes de todo el mundo, adaptándonos a la zona horaria de cada uno.',
      ],
      items: [
        { title: 'Ejecución Ágil y Eficiente',        desc: 'Nos integramos como una extensión de tu equipo; avanzando rápido, eliminando burocracia y entregando con precisión.' },
        { title: 'Performance Creativo',               desc: 'La creatividad impulsa nuestra estrategia. Scripting sólido, conocimiento profundo de la audiencia y campañas diseñadas para convertir.' },
        { title: 'Transparencia y Control de Datos',  desc: 'Visibilidad total de tus KPIs en todo momento. Siempre sabrás qué funciona, qué no y cuál es el siguiente paso.' },
        { title: 'Infraestructura Escalable',         desc: 'Sistemas diseñados para crecer contigo; estables, eficientes y preparados para lo que venga.' },
      ],
    },
    testimonials: {
      eyebrow: 'Casos reales',
      title: 'Lo Que Dicen Nuestros Clientes',
      accent: 'Clientes',
      items: [
        { quote: 'Nuestro problema no era conseguir leads, sino gestionarlos. Entraban muchos, pero no había un seguimiento claro y perdíamos oportunidades. Implementaron automatizaciones con IA para filtrar, priorizar y nutrir leads. También reorganizaron todo el proceso de contacto.',          name: 'Carlos Martínez',   role: 'CEO, TechScale EU',                    initials: 'CM' },
        { quote: 'Antes de trabajar con Argo, invertíamos en publicidad sin tener claro qué funcionaba realmente. En pocas semanas nos ayudaron a ordenar todo el funnel y empezamos a ver resultados más estables.',                                                                                   name: 'Laura Sánchez',     role: 'Directora de Marketing, GrowthCo',     initials: 'LS' },
        { quote: 'Lo que más me sorprendió fue la comunicación. Veníamos de agencias donde todo era lento o poco claro, y aquí es lo contrario. Les escribes y responden rápido con soluciones concretas. Eso se agradece mucho.',                                                                      name: 'Marc Puigdomènech', role: 'Fundador, Barcelona Ventures',         initials: 'MP' },
        { quote: 'Estábamos invirtiendo cada vez más sin tener claro si era sostenible. Empezaron a medir bien, a optimizar campañas y a automatizar partes del funnel. En pocos meses lograron reducir nuestro CAC y mantener el crecimiento sin disparar el presupuesto.',                           name: 'Sofia Romano',      role: 'Head of Sales, ScaleUp Miami',         initials: 'SR' },
      ],
    },
    clients: {
      title: 'Confían en Nosotros',
      names: [],
    },
    faq: {
      eyebrow: 'Resolvemos tus dudas',
      title: 'Preguntas Frecuentes',
      accent: 'Frecuentes',
      items: [
        {
          q: '¿Cómo funciona el proceso de incorporación?',
          a: 'Empezamos con una llamada de descubrimiento para entender tu negocio, objetivos y sistemas actuales. A partir de ahí, diseñamos un plan de acción personalizado y comenzamos la ejecución en pocos días. Sin procesos de incorporación largos ni idas y venidas innecesarias.',
        },
        {
          q: '¿Con quién trabajaré en el día a día?',
          a: 'Tendrás un account manager dedicado como tu punto de contacto principal, disponible por WhatsApp, email o Slack entre las 9h y las 18h (hora de España y Miami). Sin rotación de cuentas ni intermediarios.',
        },
        {
          q: '¿Cuánto tiempo tengo que dedicar yo?',
          a: 'El que tú prefieras. Trabajamos como una extensión de tu equipo, por lo que podemos operar con alta autonomía manteniéndote informado, o colaborar estrechamente si lo prefieres.',
        },
        {
          q: '¿Cuánto tiempo tardaré en ver resultados?',
          a: 'Para campañas de performance marketing, puedes esperar datos iniciales y optimizaciones en las primeras 2–4 semanas. Los sistemas de automatización suelen estar activos en el primer mes. El crecimiento sostenible se consolida a partir de ahí.',
        },
        {
          q: '¿Qué pasa si una campaña no está funcionando?',
          a: 'Monitorizamos las campañas a diario y ajustamos de forma proactiva. Siempre sabrás qué está pasando y por qué; la transparencia total es fundamental en nuestra forma de trabajar.',
        },
        {
          q: '¿Necesito tener herramientas o tecnología configurada antes de trabajar con vosotros?',
          a: 'Para nada. Podemos construir tu stack desde cero o integrarnos en lo que ya tienes. Trabajamos con n8n, Make y otras plataformas de automatización para conectar todo de forma fluida.',
        },
      ],
    },
    homeContact: {
      eyebrow: 'Hablemos',
      title: '¿Listo para Escalar?',
      accent: 'Escalar',
      sub: 'Cuéntanos sobre tu negocio y te responderemos en menos de 24 horas.',
    },
    contactPage: {
      title: 'Hablemos',
      sub: 'Rellena el formulario y nuestro equipo se pondrá en contacto en 24 horas.',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
    },
    contactForm: {
      name:        'Nombre Completo',
      email:       'Correo Electrónico',
      phone:       'Teléfono / WhatsApp',
      company:     'Empresa',
      subject:     'Asunto',
      message:     'Mensaje',
      send:        'Enviar Mensaje',
      consent:     'He leído la',
      privacyLink: 'Política de Privacidad',
      consentEnd:  'y acepto que me contactéis sobre mi solicitud.',
      ph_name:     'Juan García',
      ph_email:    'juan@ejemplo.com',
      ph_phone:    '+34 600 000 000',
      ph_company:  'Tu Empresa',
      ph_subject:  '¿En qué podemos ayudarte?',
      ph_message:  'Cuéntanos sobre tu proyecto...',
      err_required: 'Este campo es obligatorio.',
      err_email:    'Introduce un correo electrónico válido.',
      err_phone:    'Ese teléfono no parece correcto.',
      err_consent:  'Confirma que has leído la Política de Privacidad.',
      err_generic:  'Algo ha ido mal. Inténtalo de nuevo o escríbenos directamente por email.',
    },
    thankYou: {
      headline: 'Todo listo.',
      sub:      'Gracias por contactarnos. Nuestro equipo se pondrá en contacto en 24 horas.',
      cta:      'Volver al Inicio',
    },
    footer: {
      tagline:      'Escalamos tu negocio con marketing digital y tecnología de IA.',
      navTitle:     'Navegación',
      contactTitle: 'Contacto',
      copy:         '© 2026 ARGO. Todos los derechos reservados.',
      privacy:      'Política de Privacidad',
      terms:        'Términos de Servicio',
      cookies:      'Política de Cookies',
      cookieSettings: 'Configurar cookies',
    },
  },
}

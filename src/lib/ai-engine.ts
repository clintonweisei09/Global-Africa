export interface AIResponse {
  content: string;
  memoryUpdates?: { key: string; value: string }[];
}

const supportedLanguages: Record<string, { name: string; greetings: string[]; intro: string }> = {
  en: {
    name: 'English',
    greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you'],
    intro: "Hello! I'm your GlobalHire AI Assistant. I can help you with jobs, salaries, visas, immigration, CV writing, interviews, relocation, and general questions in any language. How can I help you today?",
  },
  sw: {
    name: 'Swahili',
    greetings: ['habari', 'mambo', 'jambo', 'hujambo', 'salama', 'vipi', 'shikamoo'],
    intro: "Habari! Mimi ni msaidizi wako wa AI wa GlobalHire. Ninaweza kukusaidia kuhusu ajira, mishahara, visa, uhamiaji, kuandika CV, mahojiano, na maswali ya jumla kwa lugha yoyote. Ninaweza kukusaidia vipi leo?",
  },
  fr: {
    name: 'French',
    greetings: ['bonjour', 'salut', 'coucou', 'bonsoir', 'ça va', 'comment ça va'],
    intro: "Bonjour ! Je suis votre assistant IA GlobalHire. Je peux vous aider avec les emplois, les salaires, les visas, l'immigration, la rédaction de CV, les entretiens, la relocalisation et des questions générales dans n'importe quelle langue. Comment puis-je vous aider aujourd'hui ?",
  },
  am: {
    name: 'Amharic',
    greetings: ['ሰላም', 'እንዴት ነህ', 'እንዴት አለህ'],
    intro: "ሰላም! እኔ የእርስዎ GlobalHire AI አጋዥ ነኝ። በማንኛውም ቋንቋ ስለ ስራዎች፣ ደመወዞች፣ ቪዛዎች፣ ስደት፣ CV መጻፍ፣ ቃለ-ምህርቶች እና አጠቃላይ ጥያቄዎች ልረዳዎት እችላለሁ። ዛሬ እንዴት ልረዳዎት እችላለሁ?",
  },
  ha: {
    name: 'Hausa',
    greetings: ['sannu', 'ina kwana', 'barka da safiya', 'barka da yamma'],
    intro: "Sannu! Ni ne mataimakin AI na GlobalHire. Zan iya taimaka maku da ayyuka, albashi, biza, shige da fice, rubuta CV, hira da aiki, da kuma wasu tambayoyi a kowane yare. Ta yaya zan iya taimaka maku yau?",
  },
  yo: {
    name: 'Yoruba',
    greetings: ['ẹ n lẹ', 'bawo ni', 'kaabo'],
    intro: "Ẹ n lẹ! Mo ni ọmọ ẹgbẹ AI rẹ ti GlobalHire. Mo le ṣàtúnṣe iranlọwọ rẹ lori iṣẹ, owo osù, vísà, ìrìnkọ-àjò, kíkọ CV, ìfọ̀rọ̀wánilẹ́nuwò, àti àwọn ìbéèrè gbogbo gbòò nínú èdè kọ̀ọ̀kan. Bawo ni mo ṣe le ṣàtúnṣe iranlọwọ rẹ lónìí?",
  },
  ar: {
    name: 'Arabic',
    greetings: ['مرحبا', 'السلام عليكم', 'أهلا', 'كيف حالك', 'صباح الخير', 'مساء الخير'],
    intro: "مرحبا! أنا مساعدك الذكي في GlobalHire. يمكنني مساعدتك في الوظائف والرواتب والتأشيرات والهجرة وكتابة السيرة الذاتية والمقابلات وإعادة التوطين وأي أسئلة عامة بأي لغة. كيف يمكنني مساعدتك اليوم؟",
  },
  pt: {
    name: 'Portuguese',
    greetings: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem'],
    intro: "Olá! Sou o seu assistente de IA da GlobalHire. Posso ajudá-lo com empregos, salários, vistos, imigração, escrita de CV, entrevistas, realocação e perguntas gerais em qualquer idioma. Como posso ajudá-lo hoje?",
  },
  es: {
    name: 'Spanish',
    greetings: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'qué tal'],
    intro: "¡Hola! Soy tu asistente de IA de GlobalHire. Puedo ayudarte con empleos, salarios, visados, inmigración, redacción de CV, entrevistas, reubicación y preguntas generales en cualquier idioma. ¿Cómo puedo ayudarte hoy?",
  },
  zh: {
    name: 'Chinese',
    greetings: ['你好', '您好', '早上好', '下午好', '晚上好', '嗨'],
    intro: "你好！我是你的GlobalHire AI助手。我可以用任何语言帮助你处理工作、薪水、签证、移民、简历撰写、面试、搬迁和一般问题。今天我能怎么帮你？",
  },
};

function detectLanguage(input: string): string {
  const lower = input.toLowerCase();
  for (const [code, lang] of Object.entries(supportedLanguages)) {
    if (lang.greetings.some((g) => lower.includes(g))) return code;
  }

  if (/[\u1200-\u137F]/.test(input)) return 'am';
  if (/[\u0600-\u06FF]/.test(input)) return 'ar';
  if (/[\u4e00-\u9fff]/.test(input)) return 'zh';
  if (/[àâçéèêëîïôûùüÿœ]/i.test(input) && /\b(le|la|les|de|une|un|est|je|tu|nous|vous|comment|pourquoi|avec|sans|pour)\b/i.test(lower)) return 'fr';
  if (/\b(el|la|los|las|de|que|con|por|para|como|una|un|es|hola|bueno|pero)\b/i.test(lower)) return 'es';
  if (/\b(o|a|os|as|de|que|com|por|para|uma|um|está|não|sim|bom|boa)\b/i.test(lower)) return 'pt';
  if (/\b(ni|na|ya|wa|za|ku|la|sana|habari|tafadhali|asante)\b/i.test(lower)) return 'sw';
  if (/\b(na|ko|da|ba|ne|ya|ke|a)\b/i.test(lower) && /[\u0600-\u06FF]/.test(input)) return 'ha';
  return 'en';
}

const knowledgeBase: Record<string, { en: string; sw: string; fr: string; ar: string; am: string; ha: string; yo: string; pt: string; es: string; zh: string }> = {
  salary: {
    en: `Here's a salary overview for popular overseas roles:\n\n| Role | Country | Monthly Salary |\n|------|---------|---------------|\n| Housekeeper | UAE | $420/mo |\n| Caregiver | Canada | $510/mo |\n| Factory Worker | South Korea | $480/mo |\n| Hotel Staff | Qatar | $390/mo |\n| Driver | Saudi Arabia | $450/mo |\n| Construction | Japan | $550/mo |\n| Chef | UK | $580/mo |\n\nMost positions also include **free accommodation**, **meals**, and **health insurance** on top of the base salary.`,
    sw: `Huu hapa ni muhtasari wa mishahara kwa ajira za nje:\n\n| Kazi | Nchi | Mshahara wa Mwezi |\n|------|------|-------------------|\n| Mfanyakazi wa Nyumba | UAE | $420/mwezi |\n| Mleza | Canada | $510/mwezi |\n| Mfanyakazi wa Kiwanda | South Korea | $480/mwezi |\n| Mfanyakazi wa Hoteli | Qatar | $390/mwezi |\n| Dereva | Saudi Arabia | $450/mwezi |\n| Ujenzi | Japan | $550/mwezi |\n| Mpika | UK | $580/mwezi |\n\nNafasi nyingi zinajumuisha **malipo ya makazi**, **chakula**, na **bima ya afya** pamoja na mshahara wa msingi.`,
    fr: `Voici un aperçu des salaires pour les postes à l'étranger :\n\n| Poste | Pays | Salaire mensuel |\n|-------|-----|-----------------|\n| Femme/Homme de ménage | EAU | $420/mois |\n| Aide-soignant | Canada | $510/mois |\n| Ouvrier d'usine | Corée du Sud | $480/mois |\n| Personnel d'hôtel | Qatar | $390/mois |\n| Chauffeur | Arabie saoudite | $450/mois |\n| Construction | Japon | $550/mois |\n| Chef | Royaume-Uni | $580/mois |\n\nLa plupart des postes incluent un **logement gratuit**, des **repas** et une **assurance maladie** en plus du salaire de base.`,
    ar: `إليك نظرة عامة على الرواتب للوظائف الشائعة في الخارج:\n\n| الوظيفة | الدولة | الراتب الشهري |\n|---------|--------|--------------|\n| عامل منزلي | الإمارات | $420/شهر |\n| مقدم رعاية | كندا | $510/شهر |\n| عامل مصنع | كوريا الجنوبية | $480/شهر |\n| موظف فندق | قطر | $390/شهر |\n| سائق | السعودية | $450/شهر |\n| بناء | اليابان | $550/شهر |\n| طاهي | بريطانيا | $580/شهر |\n\nمعظم الوظائف تشمل also **سكن مجاني** و**وجبات** و**تأمين صحي** بالإضافة إلى الراتب الأساسي.`,
    am: `የውጭ ስራዎች ደመወዝ ማጠቃለያ:\n\n| ስራ | ሀገር | ወርሃዊ ደመወዝ |\n|------|------|----------------|\n| የቤት ሰራተኛ | UAE | $420/ወር |\n| አክባሪ | Canada | $510/ወር |\n| የፋብሪካ ሰራተኛ | South Korea | $480/ወር |\n| የሆቴል ሰራተኛ | Qatar | $390/ወር |\n| ነጂ | Saudi Arabia | $450/ወር |\n| ግንባታ | Japan | $550/ወር |\n| ሱፐ | UK | $580/ወር |\n\nአብዛኞቹ ስራዎች **ነፃ መኖሪያ**፣ **ምግብ** እና **የጤና መድኃኒት መድከም** ያካትታሉ።`,
    ha: `Ga bayanin albashi shahararrun ayyuka a kasashen waje:\n\n| Aiki | Kasa | Albashin Wata |\n|------|------|---------------|\n| Ma'aikacin Gida | UAE | $420/wata |\n| Mai Kulawa | Canada | $510/wata |\n| Ma'aikacin Masana'anta | South Korea | $480/wata |\n| Ma'aikacin Otal | Qatar | $390/wata |\n| Direba | Saudi Arabia | $450/wata |\n| Gini | Japan | $550/wata |\n| Dafita | UK | $580/wata |\n\nYawancin mukamai sun haɗa da **kyauta zama**, **abinci**, da **inasurar lafiya** ban da albashi na asali.`,
    yo: `Eyi ni akopọ owo osù fun awọn iṣẹ ikọni:\n\n| Iṣẹ | Orilẹ-ede | Owo Osù |\n|------|---------|---------|\n| Olutọju ile | UAE | $420/osù |\n| Alagbẹtọju | Canada | $510/osù |\n| Oṣiṣẹ ile-iṣẹ | South Korea | $480/osù |\n| Oṣiṣẹ ile itura | Qatar | $390/osù |\n| Awakọ | Saudi Arabia | $450/osù |\n| Kikọ | Japan | $550/osù |\n| Aṣepọ | UK | $580/osù |\n\nPupọ julọ awọn iṣẹ ni **ile gbigba ọfẹ**, **ounjẹ**, ati **inurọ ilera** pẹlu owo osù ipilẹ.`,
    pt: `Aqui está uma visão geral dos salários para cargos populares no exterior:\n\n| Cargo | País | Salário Mensal |\n|-------|-----|-----------------|\n| Empregado doméstico | EAU | $420/mês |\n| Cuidador | Canadá | $510/mês |\n| Trabalhador de fábrica | Coreia do Sul | $480/mês |\n| Funcionário de hotel | Catar | $390/mês |\n| Motorista | Arábia Saudita | $450/mês |\n| Construção | Japão | $550/mês |\n| Chef | Reino Unido | $580/mês |\n\nA maioria das posições inclui **alojamento gratuito**, **refeições** e **seguro de saúde** além do salário base.`,
    es: `Aquí tienes un resumen de salarios para puestos populares en el extranjero:\n\n| Puesto | País | Salario mensual |\n|--------|-----|-----------------|\n| Empleado doméstico | EAU | $420/mes |\n| Cuidador | Canadá | $510/mes |\n| Obrero de fábrica | Corea del Sur | $480/mes |\n| Personal de hotel | Catar | $390/mes |\n| Conductor | Arabia Saudita | $450/mes |\n| Construcción | Japón | $550/mes |\n| Chef | Reino Unido | $580/mes |\n\nLa mayoría de los puestos incluyen **alojamiento gratuito**, **comidas** y **seguro de salud** además del salario base.`,
    zh: `以下是热门海外职位的薪资概览：\n\n| 职位 | 国家 | 月薪 |\n|------|------|------|\n| 家政工人 | 阿联酋 | $420/月 |\n| 护理人员 | 加拿大 | $510/月 |\n| 工厂工人 | 韩国 | $480/月 |\n| 酒店员工 | 卡塔尔 | $390/月 |\n| 司机 | 沙特阿拉伯 | $450/月 |\n| 建筑 | 日本 | $550/月 |\n| 厨师 | 英国 | $580/月 |\n\n大多数职位除了基本工资外还包括**免费住宿**、**餐食**和**健康保险**。`,
  },

  visa: {
    en: `**Visa Sponsorship Process:**\n\n1. **Job Offer** — You receive a verified job offer from an employer on GlobalHire\n2. **Documents** — Upload your passport, certificates, and medical records\n3. **Employer Files Visa** — The employer submits a work visa application with their country's immigration authority\n4. **Visa Approval** — Processing takes 2–8 weeks depending on the country\n5. **Flight Booking** — GlobalHire coordinates your flight and travel arrangements\n6. **Arrival** — You arrive and begin your new position\n\n**Key documents needed:**\n- Valid passport (6+ months validity)\n- Passport-size photos\n- Educational certificates (attested)\n- Police clearance certificate\n- Medical fitness certificate\n- Signed employment contract`,
    sw: `**Mchakato wa Udhamini wa Visa:**\n\n1. **Ofa ya Kazi** — Unapokea ofa ya kazi iliyothibitishwa kutoka kwa mwajiri kwenye GlobalHire\n2. **Nyaraka** — Pakia pasipoti yako, vyeti, na rekodi za matibabu\n3. **Mwajiri Anawasilisha Visa** — Mwajiri anawasilisha maombi ya visa ya kazi na mamlaka ya uhamiaji ya nchi yao\n4. **Uidhinishaji wa Visa** — Mchakato unachukua wiki 2–8 kulingana na nchi\n5. **Uhifadhi wa Safari** — GlobalHire inaratibu safari yako na mipangilio ya usafiri\n6. **Kuwasili** — Unafika na kuanza kazi yako mpya\n\n**Nyaraka muhimu:**\n- Pasipoti halali (miezi 6+)\n- Picha za pasipoti\n- Vyeti vya elimu (vilivyothibitishwa)\n- Cheti cha polisi\n- Cheti cha afya\n- Mkataba wa kazi uliosainiwa`,
    fr: `**Processus de parrainage de visa :**\n\n1. **Offre d'emploi** — Vous recevez une offre d'emploi vérifiée d'un employeur sur GlobalHire\n2. **Documents** — Téléchargez votre passeport, vos certificats et vos dossiers médicaux\n3. **L'employeur dépose le visa** — L'employeur soumet une demande de visa de travail\n4. **Approbation du visa** — Le traitement prend 2 à 8 semaines selon le pays\n5. **Réservation de vol** — GlobalHire coordonne votre vol et vos arrangements de voyage\n6. **Arrivée** — Vous arrivez et commencez votre nouveau poste\n\n**Documents nécessaires :**\n- Passeport valide (6+ mois)\n- Photos d'identité\n- Certificats d'études (légalisés)\n- Casier judiciaire\n- Certificat médical\n- Contrat de travail signé`,
    ar: `**عملية كفالة التأشيرة:**\n\n1. **عرض الوظيفة** — تتلقى عرض وظيفة موثق من صاحب عمل في GlobalHire\n2. **المستندات** — ارفع جواز سفرك وشهاداتك وسجلاتك الطبية\n3. **صاحب العمل يقدم التأشيرة** — يقدم صاحب العمل طلب تأشيرة عمل\n4. **الموافقة على التأشيرة** — تستغرق المعالجة 2-8 أسابيع حسب الدولة\n5. **حجز الرحلة** — ينسق GlobalHire رحلتك وترتيبات السفر\n6. **الوصول** — تصل وتبدأ منصبك الجديد\n\n**المستندات المطلوبة:**\n- جواز سفر ساري (6+ أشهر)\n- صور بحجم جواز السفر\n- الشهادات التعليمية (مصدقة)\n- شهادة خلو السجل الجنائي\n- شهادة لياقة طبية\n- عقد عمل موقّع`,
    am: `**የቪዛ ስፖንሰርሺፕ ሂደት:**\n\n1. **የስራ ጥሪ** — ከGlobalHire ባለሙያ የተገመገመ የስራ ጥሪ ይቀበላሉ\n2. **ሰነዶች** — ፓስፖርትዎን፣ ሰርተፊኬቶችዎን እና የጤና ሪከርዶችዎን ያስገቡ\n3. **አሰሪው ቪዛ ያስገባል** — አሰሪው የስራ ቪዛ ማመልከቻ ያስገባል\n4. **የቪዛ ማጽደቅ** — በሀገሩ መሰረት 2-8 ሳምንት ይወስዳል\n5. **የበረራ ቀረጽ** — GlobalHire የበረራዎን ያደራጃል\n6. **መውጣት** — ይደርሳሉ እና አዲስ ስራዎን ይጀምራሉ\n\n**አስፈላጊ ሰነዶች:**\n- ትክክለኛ ፓስፖርት (6+ ወር)\n- የፓስፖርት መጠን ፎቶዎች\n- የትምህርት ሰርተፊኬቶች (የተረጋገጡ)\n- የፖሊስ ንጹህነት ሰርተፊኬት\n- የጤና ምርመራ ሰርተፊኬት\n- የተፈረመ የስራ ውል`,
    ha: `**Tsarin Kula da Biza:**\n\n1. **Bayar da Aiki** — Kuna karbar tayin aiki da aka tabbatar daga mai daukar aiki akan GlobalHire\n2. **Takardu** — Loda fasfo ku, takaddun shaida, da bayanan likita\n3. **Mai Aiki Ya Shigar da Biza** — Mai daukar aiki yana gabatar da aikace-aiken biza\n4. **Amincewar Biza** — Yin aiki yana ɗaukar makonni 2-8 dangane da kasa\n5. **Booking Tafiya** — GlobalHire yana daidaita tafiyar ku\n6. **Iso** — Kuna isa kuma fara sabon aikin ku\n\n**Mahimman takardu:**\n- Fasfo mai inganci (watanni 6+)\n- Hotunan girmar fasfo\n- Takaddun ilimi (da aka tabbatar)\n- Takardar tsabtar 'yan sanda\n- Takardar lafiyar likita\n- Kwangilar aiki da aka sanya hannu`,
    yo: `**Ilana Iṣeduro Vísà:**\n\n1. **Iṣẹ Ipe** — O gba iṣẹ ti a jẹrisi lati ọdọ alabaṣiṣẹpọ lori GlobalHire\n2. **Awọn Iwe** — Gbe pasipoti rẹ, iwe-ẹri, ati iwe iṣẹ ilera wọle\n3. **Alabaṣiṣẹpọ N Fi Vísà** — Alabaṣiṣẹpọ n ṣe iwe aṣẹ iṣẹ\n4. **Ifọwọsi Vísà** — Ilana n gba ọsẹ 2-8 da lori orilẹ-ede\n5. **Iwe Ọkọ Oju-ọrun** — GlobalHire n ṣe atunṣe ọkọ rẹ\n6. **De** — O de ati bẹrẹ iṣẹ titun rẹ\n\n**Awọn iwe pataki:**\n- Pasipoti to wulo (osu 6+)\n- Awọn foto iwọn pasipoti\n- Iwe-ẹri ẹkọ (ti a jẹri)\n- Iwe-ẹri ọdọ-ọdọ\n- Iwe-ẹri ilera\n- Iwe iṣẹ ti a ṣẹwọ̀`,
    pt: `**Processo de patrocínio de visto:**\n\n1. **Oferta de emprego** — Você recebe uma oferta de emprego verificada de um empregador no GlobalHire\n2. **Documentos** — Carregue seu passaporte, certificados e registros médicos\n3. **Empregador requer visto** — O empregador submete um pedido de visto de trabalho\n4. **Aprovação do visto** — O processamento leva 2 a 8 semanas dependendo do país\n5. **Reserva de voo** — O GlobalHire coordena seu voo e arranjos de viagem\n6. **Chegada** — Você chega e começa sua nova posição\n\n**Documentos necessários:**\n- Passaporte válido (6+ meses)\n- Fotos de passaporte\n- Certificados educacionais (autenticados)\n- Certificado de antecedentes criminais\n- Certificado médico\n- Contrato de trabalho assinado`,
    es: `**Proceso de patrocinio de visado:**\n\n1. **Oferta de empleo** — Recibes una oferta de empleo verificada de un empleador en GlobalHire\n2. **Documentos** — Sube tu pasaporte, certificados y registros médicos\n3. **El empleador solicita el visado** — El empleador presenta una solicitud de visado de trabajo\n4. **Aprobación del visado** — El procesamiento toma de 2 a 8 semanas según el país\n5. **Reserva de vuelo** — GlobalHire coordina tu vuelo y arreglos de viaje\n6. **Llegada** — Llegas y comienzas tu nuevo puesto\n\n**Documentos necesarios:**\n- Pasaporte válido (6+ meses)\n- Fotos tamaño pasaporte\n- Certificados educativos (legalizados)\n- Certificado de antecedentes penales\n- Certificado médico\n- Contrato de trabajo firmado`,
    zh: `**签证担保流程：**\n\n1. **工作邀请** — 您收到GlobalHire上雇主的验证工作邀请\n2. **文件** — 上传您的护照、证书和医疗记录\n3. **雇主申请签证** — 雇主向其国家的移民局提交工作签证申请\n4. **签证批准** — 处理需要2-8周，具体取决于国家\n5. **航班预订** — GlobalHire协调您的航班和旅行安排\n6. **到达** — 您到达并开始新职位\n\n**所需文件：**\n- 有效护照（6个月以上）\n- 护照尺寸照片\n- 教育证书（认证）\n- 无犯罪记录证明\n- 体检证明\n- 签署的雇佣合同`,
  },

  immigration: {
    en: `**Immigration Pathways by Country:**\n\n🇨🇦 **Canada** — The Home Support Worker Pilot offers a direct path to Permanent Residency (PR) for caregivers. Processing time: 6–12 months.\n\n🇦🇪 **UAE** — Work visas are employer-sponsored, valid for 2 years. No direct PR pathway, but long-term residency permits are available.\n\n🇰🇷 **South Korea** — EPS-TOPIK work permits for manufacturing jobs, valid up to 4 years and 10 months. Can renew for extended stay.\n\n🇯🇵 **Japan** — Specified Skilled Worker (SSW) visas for construction, manufacturing, and hospitality. Path to long-term residency after 5+ years.\n\n🇸🇦 **Saudi Arabia** — Work permits are employer-sponsored, valid for 1–2 years, renewable.\n\n🇬🇧 **United Kingdom** — Skilled Worker Visa requires sponsorship from a licensed employer. Path to ILR after 5 years.\n\n🇩🇪 **Germany** — Work visa requires a job offer and recognized qualifications. EU Blue Card available for skilled professionals.`,
    sw: `**Njia za Uhamiaji kwa Nchi:**\n\n🇨🇦 **Kanada** — Programu ya Home Support Worker Pilot inatoa njia ya moja kwa moja ya Makazi ya Kudumu (PR) kwa walezi. Muda: miezi 6–12.\n\n🇦🇪 **UAE** — Visa za kazi zinadhaminiwa na mwajiri, halali kwa miaka 2. Hakuna njia ya moja kwa moja ya PR.\n\n🇰🇷 **Korea Kusini** — Ruhusa za kazi za EPS-TOPIK, halali hadi miaka 4 na miezi 10.\n\n🇯🇵 **Japani** — Visa za Specified Skilled Worker (SSW) kwa ujenzi, utengenezaji, na ukaribishaji.\n\n🇸🇦 **Saudi Arabia** — Ruhusa za kazi zinadhaminiwa na mwajiri, halali kwa miaka 1–2.\n\n🇬🇧 **Uingereza** — Skilled Worker Visa inahitaji udhamini kutoka kwa mwajiri mwenye leseni.\n\n🇩🇪 **Ujerumani** — Visa ya kazi inahitaji ofa ya kazi na sifa zinazotambulika.`,
    fr: `**Voies d'immigration par pays :**\n\n🇨🇦 **Canada** — Le programme Home Support Worker Pilot offre un chemin direct vers la résidence permanente (PR) pour les aidants. Délai : 6 à 12 mois.\n\n🇦🇪 **EAU** — Les visas de travail sont parrainés par l'employeur, valables 2 ans.\n\n🇰🇷 **Corée du Sud** — Permis de travail EPS-TOPIK pour les emplois de fabrication, valables jusqu'à 4 ans et 10 mois.\n\n🇯🇵 **Japon** — Visas Specified Skilled Worker (SSW) pour la construction, la fabrication et l'hôtellerie.\n\n🇸🇦 **Arabie saoudite** — Les permis de travail sont parrainés par l'employeur, valables 1 à 2 ans.\n\n🇬🇧 **Royaume-Uni** — Le visa Skilled Worker nécessite un parrainage d'un employeur autorisé.\n\n🇩🇪 **Allemagne** — Le visa de travail nécessite une offre d'emploi et des qualifications reconnues.`,
    ar: `**مسارات الهجرة حسب الدولة:**\n\n🇨🇦 **كندا** — برنامج Home Support Worker Pilot يوفر طريقاً مباشراً للإقامة الدائمة (PR) لمقدمي الرعاية. الوقت: 6-12 شهراً.\n\n🇦🇪 **الإمارات** — تأشيرات العمل برعاية صاحب العمل، صالحة لمدة سنتين.\n\n🇰🇷 **كوريا الجنوبية** — تصاريح عمل EPS-TOPIK للتصنيع، صالحة حتى 4 سنوات و10 أشهر.\n\n🇯🇵 **اليابان** — تأشيرات العامل المهرة المحدد (SSW) للبناء والتصنيع والضيافة.\n\n🇸🇦 **السعودية** — تصاريح العمل برعاية صاحب العمل، صالحة لمدة 1-2 سنة.\n\n🇬🇧 **بريطانيا** — تأشيرة العامل المهرة تتطلب كفالة من صاحب عمل مرخص.\n\n🇩🇪 **ألمانيا** — تأشيرة العمل تتطلب عرض وظيفة ومؤهلات معتمدة.`,
    am: `**የስደት መንገዶች በሀገር:**\n\n🇨🇦 **ካናዳ** — የ Home Support Worker Pilot ፕሮግራም ለአክባሪዎች ወደ ቋሚ ኗሪነት (PR) ቀጥተኛ መንገድ ይሰጣል። ጊዜ፡ 6-12 ወር።\n\n🇦🇪 **UAE** — የስራ ቪዛዎች በአሰሪ ይደገፋሉ፣ ለ2 ዓመት ይከውናሉ።\n\n🇰🇷 **ደቡብ ኮሪያ** — የ EPS-TOPIK የስራ ፍቃድ፣ እስከ 4 ዓመት እና 10 ወር ይከውናል።\n\n🇯🇵 **ጃፓን** — የተወሰነ ችሎታ ሰራተኛ (SSW) ቪዛ።\n\n🇸🇦 **ሳውዲ አረቢያ** — የስራ ፍቃድ በአሰሪ ይደገፋል።\n\n🇬🇧 **እንግሊዝ** — የችሎታ ሰራተኛ ቪዛ ከፈቀድ አሰሪ ማበረከት ይጠይቃል።\n\n🇩🇪 **ጀርመን** — የስራ ቪዛ የስራ ጥሪ እና የተረጋገጡ ብቃቶች ይጠይቃል።`,
    ha: `**Hanyoyin Shige da Fice ta Kasa:**\n\n🇨🇦 **Kanada** — Shirin Home Support Worker Pilot yana bayar da hanya kai tsaye zuwa zama na dindindin (PR) ga masu kulawa. Lokaci: watanni 6-12.\n\n🇦🇪 **UAE** — Biza na aiki ana marawa baya daga mai aikin, suna aiki na tsawon shekaru 2.\n\n🇰🇷 **Koriya ta Kudu** — Izinin aiki na EPS-TOPIK, yana aiki har shekaru 4 da wata 10.\n\n🇯🇵 **Japan** — Biza na Specified Skilled Worker (SSW).\n\n🇸🇦 **Saudi Arabia** — Izinin aiki ana marawa baya daga mai aikin.\n\n🇬🇧 **Birtaniya** — Biza na Skilled Worker yana buƙatar talla daga mai aikin da lasisi.\n\n🇩🇪 **Jamus** — Biza na aiki yana buƙatar tayin aiki da takaddun da aka gane.`,
    yo: `**Awọn ọna Irin-ajo nipasẹ Orilẹ-ede:**\n\n🇨🇦 **Kanada** — Etọ Home Support Worker Pilot n funni ni ọna taara si Igbimọ Tituntun (PR) fun awọn alagbẹtọju. Akoko: osu 6-12.\n\n🇦🇪 **UAE** — Awọn visto iṣẹ ni atilẹyin nipasẹ alabaṣiṣẹpọ, wọnyi ṣiṣẹ fun ọdun 2.\n\n🇰🇷 **Gusu Koria** — Iyẹnu iṣẹ EPS-TOPIK, titi di ọdun 4 ati osu 10.\n\n🇯🇵 **Japani** — Visto ti Specified Skilled Worker (SSW).\n\n🇸🇦 **Saudi Arabia** — Iyẹnu iṣẹ ni atilẹyin nipasẹ alabaṣiṣẹpọ.\n\n🇬🇧 **Ilu Gẹẹsi** — Visto ti Skilled Worker n beere fun atilẹyin lati ọdọ alabaṣiṣẹpọ ti ni lasisi.\n\n🇩🇪 **Jẹmani** — Visto iṣẹ n beere fun ipe iṣẹ ati awọn iwe-ẹri ti a mọ.`,
    pt: `**Caminhos de imigração por país:**\n\n🇨🇦 **Canadá** — O programa Home Support Worker Pilot oferece um caminho direto para a Residência Permanente (PR) para cuidadores. Tempo: 6 a 12 meses.\n\n🇦🇪 **EAU** — Vistos de trabalho patrocinados pelo empregador, válidos por 2 anos.\n\n🇰🇷 **Coreia do Sul** — Permissões de trabalho EPS-TOPIK, válidas até 4 anos e 10 meses.\n\n🇯🇵 **Japão** — Vistos Specified Skilled Worker (SSW) para construção, manufatura e hospitalidade.\n\n🇸🇦 **Arábia Saudita** — Permissões de trabalho patrocinadas pelo empregador, válidas por 1 a 2 anos.\n\n🇬🇧 **Reino Unido** — O visa Skilled Worker requer patrocínio de um empregador licenciado.\n\n🇩🇪 **Alemanha** — O visto de trabalho requer uma oferta de emprego e qualificações reconhecidas.`,
    es: `**Caminos de inmigración por país:**\n\n🇨🇦 **Canadá** — El programa Home Support Worker Pilot ofrece un camino directo a la Residencia Permanente (PR) para cuidadores. Tiempo: 6 a 12 meses.\n\n🇦🇪 **EAU** — Visados de trabajo patrocinados por el empleador, válidos por 2 años.\n\n🇰🇷 **Corea del Sur** — Permisos de trabajo EPS-TOPIK, válidos hasta 4 años y 10 meses.\n\n🇯🇵 **Japón** — Visados Specified Skilled Worker (SSW) para construcción, fabricación y hostelería.\n\n🇸🇦 **Arabia Saudita** — Permisos de trabajo patrocinados por el empleador, válidos por 1 a 2 años.\n\n🇬🇧 **Reino Unido** — El visado Skilled Worker requiere patrocinio de un empleador autorizado.\n\n🇩🇪 **Alemania** — El visado de trabajo requiere una oferta de empleo y calificaciones reconocidas.`,
    zh: `**各国移民途径：**\n\n🇨🇦 **加拿大** — 家庭支持工人试点项目为护理人员提供直接获得永久居留权(PR)的途径。处理时间：6-12个月。\n\n🇦🇪 **阿联酋** — 工作签证由雇主担保，有效期2年。\n\n🇰🇷 **韩国** — EPS-TOPIK工作许可，有效期最长4年10个月。\n\n🇯🇵 **日本** — 特定技能工人(SSW)签证，适用于建筑、制造和酒店业。\n\n🇸🇦 **沙特阿拉伯** — 工作许可由雇主担保，有效期1-2年。\n\n🇬🇧 **英国** — 技术工人签证需要持牌雇主的担保。\n\n🇩🇪 **德国** — 工作签证需要工作邀请和认可的资格。`,
  },

  cv: {
    en: `**CV Writing Tips for International Jobs:**\n\n1. **Format** — Use a clean, single-page CV with clear sections: Contact, Summary, Experience, Education, Skills\n2. **Photo** — Include a professional passport-size photo (required for UAE, Saudi Arabia, Qatar)\n3. **Language** — Write in English. If applying to Korea or Japan, mention any language certifications\n4. **Experience** — List relevant work experience with dates, employer names, and key responsibilities\n5. **Certifications** — Include any professional certifications (caregiving, hospitality, driving, etc.)\n6. **References** — Have 2–3 professional references ready with contact details\n7. **Tailor** — Customize your CV for each job category you apply to\n\n**Pro tip:** Use action verbs like "managed," "maintained," "coordinated" to describe your experience.`,
    sw: `**Vidokezo vya Kuandika CV kwa Ajira za Kimataifa:**\n\n1. **Muundo** — Tumia CV ya ukurasa mmoja yenye sehemu wazi: Mawasiliano, Muhtasari, Uzoefu, Elimu, Ujuzi\n2. **Picha** — Weka picha ya kitaalamu ya pasipoti (inahitajika kwa UAE, Saudi Arabia, Qatar)\n3. **Lugha** — Andika kwa Kiingereza. Kama unaomba Korea au Japani, taja vyeti vyako vya lugha\n4. **Uzoefu** — Orodhesha uzoefu wa kazi wenye tarehe, majina ya mwajiri, na majukumu\n5. **Vyeti** — Weka vyeti vyovyote vya kitaalamu\n6. **Marufuku** — Kuwa na viitio 2-3 vya kitaalamu\n7. **Rekebisha** — Badilisha CV kwa kila aina ya kazi\n\n**Lengo:** Tumia vitenzi kama "managed," "maintained," "coordinated."`,
    fr: `**Conseils pour la rédaction d'un CV pour les emplois à l'étranger :**\n\n1. **Format** — Utilisez un CV d'une page avec des sections claires : Contact, Résumé, Expérience, Éducation, Compétences\n2. **Photo** — Incluez une photo professionnelle (requise pour EAU, Arabie saoudite, Qatar)\n3. **Langue** — Écrivez en anglais. Mentionnez les certifications linguistiques pour la Corée ou le Japon\n4. **Expérience** — Listez l'expérience pertinente avec dates, noms des employeurs et responsabilités\n5. **Certifications** — Incluez les certifications professionnelles\n6. **Références** — Ayez 2 à 3 références professionnelles prêtes\n7. **Personnalisez** — Adaptez votre CV pour chaque catégorie d'emploi`,
    ar: `**نصائح كتابة السيرة الذاتية للوظائف الدولية:**\n\n1. **التنسيق** — استخدم سيرة ذاتية من صفحة واحدة مع أقسام واضحة\n2. **الصورة** — أضف صورة احترافية (مطلوبة للإمارات والسعودية وقطر)\n3. **اللغة** — اكتب بالإنجليزية. اذكر شهادات اللغة لكوريا أو اليابان\n4. **الخبرة** — اذكر الخبرة ذات الصلة مع التواريخ والمسؤوليات\n5. **الشهادات** — أضف الشهادات المهنية\n6. **المراجع** — جهّز 2-3 مراجع مهنية\n7. **خصص** — عدّل سيرتك الذاتية لكل فئة وظيفية`,
    am: `**የዓለም አቀፍ ስራዎች ለ CV መጻፊያ ጠቃሚ ምክሮች:**\n\n1. **ቅርጽ** — ባንድ ገጽ ላይ ባገኘ ክፍሎች CV ይጠቀሙ\n2. **ፎቶ** — ሙያዊ የፓስፖርት ፎቶ ያክሉ\n3. **ቋንቋ** — በእንግሊዝኛ ይጻፉ\n4. **ልምድ** — የስራ ልምድዎን ይዘርጁ\n5. **ሰርተፊኬቶች** — የሙያ ሰርተፊኬቶችዎን ያክሉ\n6. **ማመላከቻዎች** — 2-3 ሙያዊ ማመላከቻዎች ያዘጋጁ\n7. **አስተካክል** — ለእያንዳንዱ ስራ ዓይነት CV ያስተካክሉ`,
    ha: `**Shawarwari akan Rubutun CV don Ayyukan Duniya:**\n\n1. **Tsari** — Yi amfani da CV na shafi ɗaya tare da sassa masu haske\n2. **Hoto** — Saka ƙwararren hoto (ana buƙata don UAE, Saudi Arabia, Qatar)\n3. **Harshe** — Rubuta cikin Turanci. Ambaci takaddun harshe\n4. **Kwarewa** — Lissafa kwarewar aiki tare da kwanan wata\n5. **Takaddun** — Haɗa takaddun ƙwararru\n6. **Tuntuɓa** — Shirya masu tuntuɓa 2-3\n7. **Daidaita** — Daidaita CV ɗin ku don kowane nau'in aiki`,
    yo: `**Awọn imọran kikọ CV fun Awọn iṣẹ Agbaye:**\n\n1. **Iwelana** — Lo CV ti oju-iwe kan pẹlu awọn apakan ti ko yẹ\n2. **Foto** — Fi ọjọgbọn foto pasipoti kun\n3. **Ede** — Kọ ni Gẹẹsi. Sọ awọn iwe-ẹri ede fun Koria tabi Japani\n4. **Iriran** — Ṣe atokọ iriri iṣẹ pẹlu awọn ọjọ ati awọn ojuse\n5. **Iwe-ẹri** — Fi awọn iwe-ẹri ọmọgbun kun\n6. **Awọn itọkasi** — Ti 2-3 awọn itọkasi ọmọgbun\n7. **Ṣe atunṣe** — Ṣe atunṣe CV rẹ fun iru iṣẹ kọọkan`,
    pt: `**Dicas de escrita de CV para empregos internacionais:**\n\n1. **Formato** — Use um CV de uma página com seções claras\n2. **Foto** — Inclua uma foto profissional (necessária para EAU, Arábia Saudita, Catar)\n3. **Idioma** — Escreva em inglês. Mencione certificações de idioma\n4. **Experiência** — Liste experiência relevante com datas e responsabilidades\n5. **Certificações** — Inclua certificações profissionais\n6. **Referências** — Tenha 2-3 referências profissionais prontas\n7. **Personalize** — Adapte seu CV para cada categoria de emprego`,
    es: `**Consejos para escribir un CV para empleos internacionales:**\n\n1. **Formato** — Usa un CV de una página con secciones claras\n2. **Foto** — Incluye una foto profesional (necesaria para EAU, Arabia Saudita, Catar)\n3. **Idioma** — Escribe en inglés. Menciona certificaciones de idioma\n4. **Experiencia** — Lista la experiencia relevante con fechas y responsabilidades\n5. **Certificaciones** — Incluye certificaciones profesionales\n6. **Referencias** — Ten 2-3 referencias profesionales listas\n7. **Personaliza** — Adapta tu CV para cada categoría de empleo`,
    zh: `**国际工作简历撰写技巧：**\n\n1. **格式** — 使用简洁的单页简历，分清晰的板块\n2. **照片** — 附上专业护照照片（阿联酋、沙特、卡塔尔需要）\n3. **语言** — 用英文撰写。申请韩国或日本时提及语言证书\n4. **经验** — 列出相关工作经验，包括日期和职责\n5. **证书** — 附上专业证书\n6. **推荐人** — 准备2-3名专业推荐人\n7. **定制** — 为每种职位类别调整简历`,
  },

  interview: {
    en: `**Interview Preparation Guide:**\n\n**Before the Interview:**\n- Research the employer and their country's work culture\n- Prepare answers for common questions:\n  - "Tell me about yourself"\n  - "Why do you want to work abroad?"\n  - "How do you handle homesickness?"\n  - "Describe a difficult situation at work and how you handled it"\n- Practice speaking clearly and confidently in English\n- Dress professionally (business casual minimum)\n\n**During the Interview:**\n- Join on time if it's a video call\n- Have your documents ready\n- Ask questions about the role, accommodation, and contract terms\n- Show enthusiasm and willingness to learn\n\n**After the Interview:**\n- Send a thank-you message\n- Wait patiently for the employer's decision\n- GlobalHire will notify you of the outcome`,
    sw: `**Mwongozo wa Maandalizi ya Mahojiano:**\n\n**Kabla ya Mahojiano:**\n- Tafiti kuhusu mwajiri na utamaduni wa kazi wa nchi yao\n- Jiandae majibu kwa maswali ya kawaida\n- Fanya mazoezi ya kuongea kwa uwazi kwa Kiingereza\n- Vaa nguo za kitaalamu\n\n**Wakati wa Mahojiano:**\n- Jiunge kwa wakati kama ni simu ya video\n- Kuwa na nyaraka zako tayari\n- Uliza maswali kuhusu nafasi, makazi, na masharti ya mkataba\n- Onyesha shauku na utayari wa kujifunza\n\n**Baada ya Mahojiano:**\n- Tuma ujumbe wa asante\n- Subiri kwa subira uamuzi wa mwajiri\n- GlobalHire itakujulisha matokeo`,
    fr: `**Guide de préparation aux entretiens :**\n\n**Avant l'entretien :**\n- Recherchez l'employeur et la culture de travail du pays\n- Préparez des réponses aux questions courantes\n- Pratiquez l'anglais clairement et avec assurance\n- Habillez-vous professionnellement\n\n**Pendant l'entretien :**\n- Soyez à l'heure pour les appels vidéo\n- Ayez vos documents prêts\n- Posez des questions sur le poste et le contrat\n- Montrez votre enthousiasme\n\n**Après l'entretien :**\n- Envoyez un message de remerciement\n- Attendez patiemment la décision`,
    ar: `**دليل التحضير للمقابلة:**\n\n**قبل المقابلة:**\n- ابحث عن صاحب العمل وثقافة العمل في بلده\n- جهّز إجابات للأسئلة الشائعة\n- تدرّب على التحدث بوضوح بالإنجليزية\n- ارتدِ ملابس احترافية\n\n**أثناء المقابلة:**\n- انضم في الوقت المحدد إذا كانت مكالمة فيديو\n- جهّز مستنداتك\n- اطرح أسئلة عن الوظيفة والإقامة وشروط العقد\n- أظهر حماسك ورغبتك في التعلم\n\n**بعد المقابلة:**\n- أرسل رسالة شكر\n- انتظر قرار صاحب العمل بصبر`,
    am: `**የቃለ-ምህርት ዝግጅት መመሪያ:**\n\n**ከቃለ-ምህርት በፊት:**\n- ስለ አሰሪው እና የሀገር ስራ ባህል ያገኑ\n- ለተለመዱ ጥያቄዎች መልሶች ያዘጋጁ\n- በእንግሊዝኛ በግልጽነት ይንገሩ\n- ሙያዊ ልብስ ይልበሱ\n\n**በቃለ-ምህርት ወቅት:**\n- በሰዓቱ ይግቡ\n- ሰነዶችዎን ያዘጋጁ\n- ስለ ስራው ጥያቄዎች ይጠይቁ\n\n**ከቃለ-ምህርት በኋላ:**\n- የምስጋና መልዕክት ይላኩ\n- በትዕግስት ይጠብቁ`,
    ha: `**Jagaban Shirya Hira:**\n\n**Kafin Hira:**\n- Bincika mai aikin da al'adun aikin kasar su\n- Shirya amsoshi ga tambayoyi na yau da kullun\n- Yi aikace-aiken magana da Turanci\n- Sana'antar tufafi\n\n**A lokacin Hira:**\n- Shiga da lokaci idan kiran bidiyo ne\n- Ku da takardunku tayi\n- Tambayi game da aikin da kwangila\n\n**Bayan Hira:**\n- Aika sako na godiya\n- Jira da hakuri`,
    yo: `**Itọsọna Iṣeto Iṣẹrọ:**\n\n**Ṣaaju Iṣẹrọ:**\n- Ṣe iwadi lori alabaṣiṣẹpọ ati aṣa iṣẹ orilẹ-ede wọn\n- Ṣetọ awọn idahun fun awọn ibeere wọpọ\n- Ṣe ayo lori sọrọ ni Gẹẹsi\n- Wọ aṣọ ọmọgbun\n\n**Lakoko Iṣẹrọ:**\n- Wọle ni akoko\n- Ṣetọ awọn iwe rẹ\n- Beere awọn ibeere nipa iṣẹ naa\n\n**Lẹhin Iṣẹrọ:**\n- Fi ifẹ rẹ\n- Duuro pẹlu suuru`,
    pt: `**Guia de preparação para entrevistas:**\n\n**Antes da entrevista:**\n- Pesquise o empregador e a cultura de trabalho do país\n- Prepare respostas para perguntas comuns\n- Pratique falar inglês claramente\n- Vista-se profissionalmente\n\n**Durante a entrevista:**\n- Chegue a tempo para videochamadas\n- Tenha seus documentos prontos\n- Faça perguntas sobre a vaga e o contrato\n\n**Depois da entrevista:**\n- Envie uma mensagem de agradecimento\n- Aguarde pacientemente a decisão`,
    es: `**Guía de preparación para entrevistas:**\n\n**Antes de la entrevista:**\n- Investiga al empleador y la cultura laboral del país\n- Prepara respuestas para preguntas comunes\n- Practica hablar inglés con claridad\n- Vístete profesionalmente\n\n**Durante la entrevista:**\n- Llega a tiempo para videollamadas\n- Ten tus documentos listos\n- Haz preguntas sobre el puesto y el contrato\n\n**Después de la entrevista:**\n- Envía un mensaje de agradecimiento\n- Espera pacientemente la decisión`,
    zh: `**面试准备指南：**\n\n**面试前：**\n- 研究雇主和该国的工作文化\n- 准备常见问题的答案\n- 练习用英语清晰自信地表达\n- 穿着专业\n\n**面试中：**\n- 视频通话准时参加\n- 准备好文件\n- 询问关于职位和合同的问题\n\n**面试后：**\n- 发送感谢信息\n- 耐心等待决定`,
  },

  relocation: {
    en: `**Relocation Cost Estimates:**\n\nMost GlobalHire employers cover the following relocation costs:\n\n✅ **Covered by employer:**\n- Round-trip airfare\n- Accommodation (or housing allowance)\n- Meals (or food allowance)\n- Health insurance\n- Visa and work permit fees\n\n💰 **You may need to pay for:**\n- Passport renewal (~$50–$100)\n- Police clearance certificate (~$20–$50)\n- Medical fitness exam (~$50–$150)\n- Attestation of documents (~$30–$80 per document)\n\n**Total estimated out-of-pocket: $200–$500**`,
    sw: `**Makadirio ya Gharama za Kuhamia:**\n\nWafanyakazi wengi wa GlobalHire wanashughulikia:\n\n✅ **Zinashughulikiwa na mwajiri:**\n- Tikiti za ndege\n- Makazi\n- Chakula\n- Bima ya afya\n- Ada za visa na ruhusa za kazi\n\n💰 **Unaweza kulipa:**\n- Upya wa pasipoti (~$50-$100)\n- Cheti cha polisi (~$20-$50)\n- Uchunguzi wa afya (~$50-$150)\n\n**Jumla: $200-$500**`,
    fr: `**Estimation des coûts de relocalisation :**\n\nLa plupart des employeurs couvrent :\n\n✅ **Couvert par l'employeur :**\n- Billets d'avion\n- Logement\n- Repas\n- Assurance santé\n- Frais de visa\n\n💰 **Vous devrez peut-être payer :**\n- Renouvellement de passeport (~50-100$)\n- Casier judiciaire (~20-50$)\n- Examen médical (~50-150$)\n\n**Total estimé : 200-500$**`,
    ar: `**تقديرات تكاليف الانتقال:**\n\nمعظم أصحاب العمل يغطون:\n\n✅ **يغطيه صاحب العمل:**\n- تذاكر الطيران\n- السكن\n- الوجبات\n- التأمين الصحي\n- رسوم التأشيرة\n\n💰 **قد تحتاج للدفع:**\n- تجديد جواز السفر (~$50-100)\n- شهادة السجل الجنائي (~$20-50)\n- الفحص الطبي (~$50-150)\n\n**الإجمالي: $200-500**`,
    am: `**የስደት ወጪ ግምት:**\n\nአብዛኞቹ አሰሪዎች ይሸፍናሉ:\n\n✅ **በአሰሪ የተሸፈነ:**\n- የአየር ጉዞ ቲኬት\n- መኖሪያ\n- ምግብ\n- የጤና መድኃኒት\n- የቪዛ ክፍያ\n\n💰 **ሊከፍሉ ይችላሉ:**\n- የፓስፖርት تجدید (~$50-100)\n- የፖሊስ ሰርተፊኬት (~$20-50)\n- የጤና ምርመራ (~$50-150)\n\n**ጠቅላላ: $200-500**`,
    ha: `**Kimanin Kudin Shiga:**\n\nYawancin ma'aikata suna rufewa:\n\n✅ **Mai aikin yana rufewa:**\n- Tikitin jirgin sama\n- Gida\n- Abinci\n- Inshorar lafiya\n- Kudin biza\n\n💰 **Kuna iya biya:**\n- Sabunta fasfo (~$50-100)\n- Takardar 'yan sanda (~$20-50)\n- Jarrabin likita (~$50-150)\n\n**Jimla: $200-500**`,
    yo: `**Iye owo Gbigbe:**\n\nPupọ alabaṣiṣẹpọ n bo:\n\n✅ **Alabaṣiṣẹpọ n bo:**\n- Awọn tiketi ọkọ ofurufu\n- Ile\n- Ounjẹ\n- Inurọ ilera\n- Owo visto\n\n💰 **O le san:**\n- Imudojuiwọn pasipoti (~$50-100)\n- Iwe-ẹri ọdọ-ọdọ (~$20-50)\n- Ayẹwo ilera (~$50-150)\n\n**Lapapọ: $200-500**`,
    pt: `**Estimativa de custos de realocação:**\n\nA maioria dos empregadores cobre:\n\n✅ **Coberto pelo empregador:**\n- Passagens aéreas\n- Alojamento\n- Refeições\n- Seguro de saúde\n- Taxas de visto\n\n💰 **Você pode precisar pagar:**\n- Renovação de passaporte (~$50-100)\n- Certificado de antecedentes (~$20-50)\n- Exame médico (~$50-150)\n\n**Total estimado: $200-500**`,
    es: `**Estimación de costos de reubicación:**\n\nLa mayoría de los empleadores cubren:\n\n✅ **Cubierto por el empleador:**\n- Pasajes aéreos\n- Alojamiento\n- Comidas\n- Seguro de salud\n- Tarifas de visado\n\n💰 **Es posible que debas pagar:**\n- Renovación de pasaporte (~$50-100)\n- Certificado de antecedentes (~$20-50)\n- Examen médico (~$50-150)\n\n**Total estimado: $200-500**`,
    zh: `**搬迁费用估算：**\n\n大多数雇主承担以下费用：\n\n✅ **雇主承担：**\n- 机票\n- 住宿\n- 餐食\n- 健康保险\n- 签证和工作许可费\n\n💰 **您可能需要支付：**\n- 护照续期（约$50-100）\n- 无犯罪证明（约$20-50）\n- 体检（约$50-150）\n\n**自费总计：$200-500**`,
  },

  employers: {
    en: `**Top Verified Employers on GlobalHire:**\n\n1. **Marriott International** 🇶🇦 — World's largest hotel chain, 42 open roles, 4.9★ rating\n2. **Samsung Electronics** 🇰🇷 — Global tech leader, 28 open roles, 4.8★ rating\n3. **BrightCare Senior Services** 🇨🇦 — Canada's top caregiver agency, 35 open roles, 4.9★ rating\n4. **Royal Emirates Hospitality** 🇦🇪 — Premium hospitality, 56 open roles, 4.7★ rating\n5. **Hilton Worldwide** 🇬🇧 — Global hospitality leader, 31 open roles, 4.8★ rating\n6. **BMW Group** 🇩🇪 — Automotive manufacturing, 24 open roles, 4.7★ rating\n7. **Tokyo Build Corp** 🇯🇵 — Construction & infrastructure, 18 open roles, 4.7★ rating\n8. **Riyadh Transport Co.** 🇸🇦 — Logistics specialist, 22 open roles, 4.6★ rating`,
    sw: `**Waajiri Wakuu Walioidhinishwa kwenye GlobalHire:**\n\n1. **Marriott International** 🇶🇦 — Hoteli kubwa zaidi, nafasi 42, 4.9★\n2. **Samsung Electronics** 🇰🇷 — Kiongozi wa teknolojia, nafasi 28, 4.8★\n3. **BrightCare Senior Services** 🇨🇦 — Wakala bora wa walezi Kanada, nafasi 35, 4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — Ubora wa juu, nafasi 56, 4.7★\n5. **Hilton Worldwide** 🇬🇧 — Kiongozi wa hoteli, nafasi 31, 4.8★\n6. **BMW Group** 🇩🇪 — Uzalishaji wa magari, nafasi 24, 4.7★\n7. **Tokyo Build Corp** 🇯🇵 — Ujenzi, nafasi 18, 4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — Usafirishaji, nafasi 22, 4.6★`,
    fr: `**Meilleurs employeurs vérifiés sur GlobalHire :**\n\n1. **Marriott International** 🇶🇦 — Plus grande chaîne d'hôtels, 42 postes, 4.9★\n2. **Samsung Electronics** 🇰🇷 — Leader tech mondial, 28 postes, 4.8★\n3. **BrightCare Senior Services** 🇨🇦 — Top agence de soins au Canada, 35 postes, 4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — Hôtellerie haut de gamme, 56 postes, 4.7★\n5. **Hilton Worldwide** 🇬🇧 — Leader de l'hôtellerie, 31 postes, 4.8★\n6. **BMW Group** 🇩🇪 — Fabrication automobile, 24 postes, 4.7★\n7. **Tokyo Build Corp** 🇯🇵 — Construction, 18 postes, 4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — Logistique, 22 postes, 4.6★`,
    ar: `**أفضل أصحاب العمل الموثقون في GlobalHire:**\n\n1. **Marriott International** 🇶🇦 — أكبر سلسلة فنادق، 42 وظيفة، 4.9★\n2. **Samsung Electronics** 🇰🇷 — رائد التكنولوجيا، 28 وظيفة، 4.8★\n3. **BrightCare Senior Services** 🇨🇦 — أفضل وكالة رعاية في كندا، 35 وظيفة، 4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — ضيافة فاخرة، 56 وظيفة، 4.7★\n5. **Hilton Worldwide** 🇬🇧 — رائد الضيافة، 31 وظيفة، 4.8★\n6. **BMW Group** 🇩🇪 — تصنيع السيارات، 24 وظيفة، 4.7★\n7. **Tokyo Build Corp** 🇯🇵 — بناء، 18 وظيفة، 4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — لوجستيات، 22 وظيفة، 4.6★`,
    am: `**ከGlobalHire ላይ ከፍተኛ የተረጋገጡ አሰሪዎች:**\n\n1. **Marriott International** 🇶🇦 — ትልቁ የሆቴል ሰንሰለት፣ 42 ስራዎች፣ 4.9★\n2. **Samsung Electronics** 🇰🇷 — የቴክኖሎጂ መሪ፣ 28 ስራዎች፣ 4.8★\n3. **BrightCare Senior Services** 🇨🇦 — የካናዳ አክባሪ ኤጀንሲ፣ 35 ስራዎች፣ 4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — 56 ስራዎች፣ 4.7★\n5. **Hilton Worldwide** 🇬🇧 — 31 ስራዎች፣ 4.8★\n6. **BMW Group** 🇩🇪 — 24 ስራዎች፣ 4.7★\n7. **Tokyo Build Corp** 🇯🇵 — 18 ስራዎች፣ 4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — 22 ስራዎች፣ 4.6★`,
    ha: `**Manyan Ma'aikata da aka tabbatar a GlobalHire:**\n\n1. **Marriott International** 🇶🇦 — Mafi girman otal, aiki 42, 4.9★\n2. **Samsung Electronics** 🇰🇷 — Shugaban fasaha, aiki 28, 4.8★\n3. **BrightCare Senior Services** 🇨🇦 — Mafi kyau a Kanada, aiki 35, 4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — aiki 56, 4.7★\n5. **Hilton Worldwide** 🇬🇧 — aiki 31, 4.8★\n6. **BMW Group** 🇩🇪 — aiki 24, 4.7★\n7. **Tokyo Build Corp** 🇯🇵 — aiki 18, 4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — aiki 22, 4.6★`,
    yo: `**Awọn Alabaṣiṣẹpọ ti a jẹri lori GlobalHire:**\n\n1. **Marriott International** 🇶🇦 — Eto hoteli ti o tobi julọ, iṣẹ 42, 4.9★\n2. **Samsung Electronics** 🇰🇷 — Aláṣẹ imọ-ẹrọ, iṣẹ 28, 4.8★\n3. **BrightCare Senior Services** 🇨🇦 — Ajọ alagbẹtọju ti Kanada, iṣẹ 35, 4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — iṣẹ 56, 4.7★\n5. **Hilton Worldwide** 🇬🇧 — iṣẹ 31, 4.8★\n6. **BMW Group** 🇩🇪 — iṣẹ 24, 4.7★\n7. **Tokyo Build Corp** 🇯🇵 — iṣẹ 18, 4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — iṣẹ 22, 4.6★`,
    pt: `**Principais empregadores verificados no GlobalHire:**\n\n1. **Marriott International** 🇶🇦 — Maior cadeia de hotéis, 42 vagas, 4.9★\n2. **Samsung Electronics** 🇰🇷 — Líder global de tecnologia, 28 vagas, 4.8★\n3. **BrightCare Senior Services** 🇨🇦 — Melhor agência de cuidadores do Canadá, 35 vagas, 4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — 56 vagas, 4.7★\n5. **Hilton Worldwide** 🇬🇧 — 31 vagas, 4.8★\n6. **BMW Group** 🇩🇪 — 24 vagas, 4.7★\n7. **Tokyo Build Corp** 🇯🇵 — 18 vagas, 4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — 22 vagas, 4.6★`,
    es: `**Principales empleadores verificados en GlobalHire:**\n\n1. **Marriott International** 🇶🇦 — Cadena de hoteles más grande, 42 vacantes, 4.9★\n2. **Samsung Electronics** 🇰🇷 — Líder tecnológico, 28 vacantes, 4.8★\n3. **BrightCare Senior Services** 🇨🇦 — Mejor agencia de cuidadores de Canadá, 35 vacantes, 4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — 56 vacantes, 4.7★\n5. **Hilton Worldwide** 🇬🇧 — 31 vacantes, 4.8★\n6. **BMW Group** 🇩🇪 — 24 vacantes, 4.7★\n7. **Tokyo Build Corp** 🇯🇵 — 18 vacantes, 4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — 22 vacantes, 4.6★`,
    zh: `**GlobalHire上顶级认证雇主：**\n\n1. **Marriott International** 🇶🇦 — 全球最大酒店连锁，42个职位，4.9★\n2. **Samsung Electronics** 🇰🇷 — 全球科技领导者，28个职位，4.8★\n3. **BrightCare Senior Services** 🇨🇦 — 加拿大顶级护理机构，35个职位，4.9★\n4. **Royal Emirates Hospitality** 🇦🇪 — 56个职位，4.7★\n5. **Hilton Worldwide** 🇬🇧 — 31个职位，4.8★\n6. **BMW Group** 🇩🇪 — 24个职位，4.7★\n7. **Tokyo Build Corp** 🇯🇵 — 18个职位，4.7★\n8. **Riyadh Transport Co.** 🇸🇦 — 22个职位，4.6★`,
  },

  jobs: {
    en: `**Popular Job Categories on GlobalHire:**\n\n🏠 **Housekeepers** — 1,240+ jobs available\n✨ **Maids** — 980+ jobs\n💨 **Cleaners** — 1,560+ jobs\n🌳 **Gardeners** — 420+ jobs\n🚗 **Drivers** — 730+ jobs\n🏨 **Hotel Staff** — 890+ jobs\n🏭 **Factory Workers** — 1,120+ jobs\n⛽ **Petrol Attendants** — 340+ jobs\n❤️ **Caregivers** — 670+ jobs\n🏗️ **Construction** — 540+ jobs\n🛡️ **Security Guards** — 410+ jobs\n👨‍🍳 **Chefs & Cooks** — 380+ jobs\n\nBrowse all jobs on the Jobs page and filter by country, salary, and category.`,
    sw: `**Aina za Ajira Zinazopendwa kwenye GlobalHire:**\n\n🏠 **Wafanyakazi wa Nyumba** — ajira 1,240+\n✨ **Wahudumu** — ajira 980+\n💨 **Wafua** — ajira 1,560+\n🌳 **Wabustani** — ajira 420+\n🚗 **Madereva** — ajira 730+\n🏨 **Wafanyakazi wa Hoteli** — ajira 890+\n🏭 **Wafanyakazi wa Kiwanda** — ajira 1,120+\n⛽ **Wahudumu wa Petrol** — ajira 340+\n❤️ **Walezi** — ajira 670+\n🏗️ **Ujenzi** — ajira 540+\n🛡️ **Walinzi** — ajira 410+\n👨‍🍳 **Wapishi** — ajira 380+\n\nTazama ajira zote kwenye ukurasa wa Jobs.`,
    fr: `**Catégories d'emploi populaires sur GlobalHire :**\n\n🏠 **Femmes/Hommes de ménage** — 1 240+ emplois\n✨ **Domestiques** — 980+ emplois\n💨 **Nettoyeurs** — 1 560+ emplois\n🌳 **Jardiniers** — 420+ emplois\n🚗 **Chauffeurs** — 730+ emplois\n🏨 **Personnel d'hôtel** — 890+ emplois\n🏭 **Ouvriers d'usine** — 1 120+ emplois\n⛽ **Pompistes** — 340+ emplois\n❤️ **Aidants** — 670+ emplois\n🏗️ **Construction** — 540+ emplois\n🛡️ **Agents de sécurité** — 410+ emplois\n👨‍🍳 **Chefs** — 380+ emplois`,
    ar: `**فئات الوظائف الشائعة في GlobalHire:**\n\n🏠 **عمال منزليون** — 1,240+ وظيفة\n✨ **خادمات** — 980+ وظيفة\n💨 **عاملو نظافة** — 1,560+ وظيفة\n🌳 **بستانيون** — 420+ وظيفة\n🚗 **سائقون** — 730+ وظيفة\n🏨 **موظفو فنادق** — 890+ وظيفة\n🏭 **عاملو مصانع** — 1,120+ وظيفة\n⛽ **عاملو محطات وقود** — 340+ وظيفة\n❤️ **مقدمو رعاية** — 670+ وظيفة\n🏗️ **بناء** — 540+ وظيفة\n🛡️ **حراس أمن** — 410+ وظيفة\n👨‍🍳 **طهاة** — 380+ وظيفة`,
    am: `**በተወደዱ የስራ ምድቦች በ GlobalHire:**\n\n🏠 **የቤት ሰራተኞች** — 1,240+ ስራዎች\n✨ **አገልጋዮች** — 980+ ስራዎች\n💨 **ሴኞች** — 1,560+ ስራዎች\n🌳 **አትክልተኞች** — 420+ ስራዎች\n🚗 **ነጆች** — 730+ ስራዎች\n🏨 **የሆቴል ሰራተኞች** — 890+ ስራዎች\n🏭 **የፋብሪካ ሰራተኞች** — 1,120+ ስራዎች\n❤️ **አክባሪዎች** — 670+ ስራዎች\n🏗️ **ግንባታ** — 540+ ስራዎች\n🛡️ **ጥበቃ ዘቦች** — 410+ ስራዎች\n👨‍🍳 **ሱፐዎች** — 380+ ስራዎች`,
    ha: `**Shahararrun Nau'in Aiki a GlobalHire:**\n\n🏠 **Ma'aikatan Gida** — aiki 1,240+\n✨ **Bayi** — aiki 980+\n💨 **Masu Tsabta** — aiki 1,560+\n🌳 **Masu Lambu** — aiki 420+\n🚗 **Direbobi** — aiki 730+\n🏨 **Ma'aikatan Otal** — aiki 890+\n🏭 **Ma'aikatan Masana'anta** — aiki 1,120+\n❤️ **Masu Kulawa** — aiki 670+\n🏗️ **Gini** — aiki 540+\n🛡️ **Masu Tsaro** — aiki 410+\n👨‍🍳 **Masu Dafa** — aiki 380+`,
    yo: `**Awọn ẹka iṣẹ ti o wọpọ lori GlobalHire:**\n\n🏠 **Awọn olutọju ile** — iṣẹ 1,240+\n✨ **Awọn ẹru ile** — iṣẹ 980+\n💨 **Awọn olẹnu** — iṣẹ 1,560+\n🌳 **Awọn ọgba** — iṣẹ 420+\n🚗 **Awọn awakọ** — iṣẹ 730+\n🏨 **Awọn oṣiṣẹ ile itura** — iṣẹ 890+\n🏭 **Awọn oṣiṣẹ ile-iṣẹ** — iṣẹ 1,120+\n❤️ **Awọn alagbẹtọju** — iṣẹ 670+\n🏗️ **Kikọ** — iṣẹ 540+\n🛡️ **Awọn ọlẹ** — iṣẹ 410+\n👨‍🍳 **Awọn aṣepọ** — iṣẹ 380+`,
    pt: `**Categorias de emprego populares no GlobalHire:**\n\n🏠 **Empregados domésticos** — 1.240+ vagas\n✨ **Criados** — 980+ vagas\n💨 **Faxineiros** — 1.560+ vagas\n🌳 **Jardineiros** — 420+ vagas\n🚗 **Motoristas** — 730+ vagas\n🏨 **Funcionários de hotel** — 890+ vagas\n🏭 **Operários de fábrica** — 1.120+ vagas\n❤️ **Cuidadores** — 670+ vagas\n🏗️ **Construção** — 540+ vagas\n🛡️ **Guardas de segurança** — 410+ vagas\n👨‍🍳 **Chefs** — 380+ vagas`,
    es: `**Categorías de empleo populares en GlobalHire:**\n\n🏠 **Empleados domésticos** — 1.240+ vacantes\n✨ **Criados** — 980+ vacantes\n💨 **Limpiadores** — 1.560+ vacantes\n🌳 **Jardineros** — 420+ vacantes\n🚗 **Conductores** — 730+ vacantes\n🏨 **Personal de hotel** — 890+ vacantes\n🏭 **Obreros de fábrica** — 1.120+ vacantes\n❤️ **Cuidadores** — 670+ vacantes\n🏗️ **Construcción** — 540+ vacantes\n🛡️ **Guardias de seguridad** — 410+ vacantes\n👨‍🍳 **Chefs** — 380+ vacantes`,
    zh: `**GlobalHire上热门工作类别：**\n\n🏠 **家政工人** — 1,240+ 职位\n✨ **女佣** — 980+ 职位\n💨 **清洁工** — 1,560+ 职位\n🌳 **园丁** — 420+ 职位\n🚗 **司机** — 730+ 职位\n🏨 **酒店员工** — 890+ 职位\n🏭 **工厂工人** — 1,120+ 职位\n❤️ **护理人员** — 670+ 职位\n🏗️ **建筑** — 540+ 职位\n🛡️ **保安** — 410+ 职位\n👨‍🍳 **厨师** — 380+ 职位`,
  },
};

const suggestedPrompts = [
  'Nini mshahara wa wasaidizi wa nyumba Dubai?',
  'Mchakato wa visa ya kazi hufanywaje?',
  'Nisaidie kuandika CV ya kazi ya caregiver nchini Kanada',
  'Ni njia gani za uhamiaji kwenda Kanada?',
  'Ninawezaje kujitayarisha kwa mahojiano ya nje ya nchi?',
  'Ningepaswa kulipa gharama gani za kuhamia?',
  'Nionyeshe waajiri walioidhinishwa vizuri',
  'Ni ajira gani zinapatikana kwa wafanyakazi wa kiwanda?',
];

const keywords: { match: string[]; key: string }[] = [
  { match: ['salary', 'pay', 'wage', 'earn', 'income', 'money', 'mshahara', 'salaire', 'salario', 'راتب', 'ደመወዝ', 'albashi', 'owo'], key: 'salary' },
  { match: ['visa', 'sponsorship', 'work permit', 'work visa', 'biza', 'تأشيرة', 'visto', 'visado', '签证'], key: 'visa' },
  { match: ['immigration', 'pr', 'permanent', 'residency', 'pathway', 'settle', 'uhamiaji', 'shige', 'shige da fice', 'هجرة', 'imigração', 'inmigración', '移民'], key: 'immigration' },
  { match: ['cv', 'resume', 'curriculum', 'sira', 'السيرة', '简历'], key: 'cv' },
  { match: ['interview', 'prepare', 'questions', 'mahojiano', 'hira', 'مقابلة', 'entrevista', 'entrevista', '面试'], key: 'interview' },
  { match: ['relocation', 'cost', 'move', 'travel', 'flight', 'kuhamia', 'shige', 'الانتقال', 'mudança', 'reubicación', '搬迁'], key: 'relocation' },
  { match: ['employer', 'company', 'companies', 'who hire', 'top', 'mwajiri', 'mai aikin', 'صاحب عمل', 'empregador', 'empleador', '雇主'], key: 'employers' },
  { match: ['job', 'jobs', 'available', 'categories', 'roles', 'positions', 'ajira', 'aiki', 'iṣẹ', 'وظيفة', 'emprego', 'empleo', '工作'], key: 'jobs' },
];

export function getAIResponse(input: string): AIResponse {
  const lang = detectLanguage(input);
  const lower = input.toLowerCase();

  const jokeResponses: Record<string, string> = {
    en: "Why did the robot go to therapy? Because it had too many feelings to process. 😄",
    sw: "Kwa nini roboti ilikwenda kwenye tiba? Kwa sababu ilikuwa na hisia nyingi za kuchakata. 😄",
    fr: "Pourquoi le robot a-t-il consulté un psychologue ? Parce qu'il avait trop de sentiments à traiter. 😄",
    ar: "لماذا ذهب الروبوت إلى العلاج؟ لأنه كان لديه الكثير من المشاعر ليعالجها. 😄",
    am: "ሮቦት ወደ ሕክምና የሄደው ለምን? በጣም ብዙ ስሜቶች ስለነበሩ ነው። 😄",
    ha: "Me ya sa robobi ya tafi zuwa magani? Domin yana da jinai da yawa da ya kamata a sarrafa. 😄",
    pt: "Por que o robô foi à terapia? Porque tinha muitos sentimentos para processar. 😄",
    es: "¿Por qué el robot fue a terapia? Porque tenía demasiados sentimientos que procesar. 😄",
    zh: "为什么机器人去看心理医生？因为它有太多情绪需要处理。😄",
  };

  if (/tell me a joke|joke|funny|laugh/i.test(lower)) {
    return { content: jokeResponses[lang] || jokeResponses.en };
  }

  if (/(who are you|what can you do|you are|can you chat|chat with me|be my friend|hello|hi|hey|good morning|good afternoon|good evening|how are you|how are you doing|thanks|thank you)/i.test(lower)) {
    const greeting = supportedLanguages[lang];
    if (greeting) {
      return {
        content: `${greeting.intro}\n\nI can help with job search, salaries, visa requirements, interview preparation, CV writing, relocation planning, and employer questions. What would you like to know today?`,
      };
    }
  }

  for (const { match, key } of keywords) {
    if (match.some((m) => lower.includes(m.toLowerCase()))) {
      return { content: knowledgeBase[key]?.[lang] || knowledgeBase[key]?.en || '' };
    }
  }

  const greeting = supportedLanguages[lang];
  if (greeting && greeting.greetings.some((g) => lower.includes(g))) {
    return { content: greeting.intro };
  }

  return {
    content: lang === 'sw'
      ? `Niko hapa kukusaidia! Ninaelewa uliuliza: "${input}".\n\nNinaweza kukusaidia kuhusu:\n- **Ajira** — Pata ajira sahihi kwa ujuzi wako\n- **Mishahara** — Jua mishahara katika nchi mbalimbali\n- **Visa na uhamiaji** — Elewa mchakato wa udhamini\n- **Kuandika CV** — Vidokezo vya kuandika CV nzuri\n- **Mahojiano** — Jiandae kwa mahojiano ya kimataifa\n- **Gharama za kuhamia** — Panga uhamiaji wako\n\nNiulize swali mahususi ili nikusaidie vizuri!`
      : lang === 'fr'
      ? `Je suis là pour vous aider ! J'ai bien reçu votre question : "${input}".\n\nJe peux vous aider avec :\n- **Emplois** — Trouvez le bon poste\n- **Salaires** — Renseignez-vous sur les salaires\n- **Visas et immigration** — Comprendre le processus\n- **Rédaction de CV** — Conseils pour un bon CV\n- **Entretiens** — Préparez-vous aux entretiens\n- **Coûts de relocalisation** — Planifiez votre déménagement\n\nPosez-moi une question spécifique pour que je puisse mieux vous aider !`
      : lang === 'ar'
      ? `أنا هنا لمساعدتك! لقد فهمت سؤالك: "${input}".\n\nيمكنني مساعدتك في:\n- **الوظائف** — ابحث عن الوظيفة المناسبة\n- **الرواتب** — تعرف على الرواتب في مختلف البلدان\n- **التأشيرات والهجرة** — افهم عملية الكفالة\n- **كتابة السيرة الذاتية** — نصائح لكتابة سيرة ذاتية جيدة\n- **المقابلات** — استعد للمقابلات الدولية\n- **تكاليف الانتقال** — خطط لانتقالك\n\nاطرح علي سؤالاً محدداً لأتمكن من مساعدتك بشكل أفضل!`
      : lang === 'am'
      ? `እነሆ ለማገዝ ቅድሚያ እዚህ ነኝ! ጥያቄዎን ተረድቻለሁ: "${input}".\n\nስለ የሚከተለው ልረዳዎት እችላለሁ:\n- **ስራዎች** — የተሻለ ስራ ይፈልጉ\n- **ደመወዞች** — ስለ ደመወዞች ይወቁ\n- **ቪዛ እና ስደት** — የስፖንሰርሺፕ ሂደትን ይረዱ\n- **የ CV መጻፊያ** — የተሻለ CV ለመጻፍ ጠቃሚ ምክሮች\n- **ቃለ-ምህርቶች** — ለዓለም አቀፍ ቃለ-ምህርቶች ይዘጋጁ\n\nበትክክል ስለ ምን እንደፈለጉ ይንገሩኝ!`
      : lang === 'ha'
      ? `Ina nan don taimaka maku! Na fahimci tambayarku: "${input}".\n\nZan iya taimaka maku da:\n- **Ayyuka** — Nemo aikin da ya dace\n- **Albashi** — Sani albashi a kasashe daban-daban\n- **Biza da shige da fice** — Fahimtar tsarin tallafi\n- **Rubutun CV** — Shawarwari akan rubutun CV\n- **Hira** — Shirya don hira ta duniya\n- **Kudin shiga** — Shirya tafiyar ku\n\nAika min takamaiman tambaya don in taimaka maku sosai!`
      : lang === 'yo'
      ? `Mo wa nibi lati ran ọ lọwọ! Mo ti loye ibeere rẹ: "${input}".\n\nMo le ran ọ lọwọ pẹlu:\n- **Awọn iṣẹ** — Wa iṣẹ to yẹ\n- **Awọn owo osù** — Mọ awọn owo osù ninu awọn orilẹ-ede\n- **Vísà ati irin-ajo** — Ye ilana atilẹyin\n- **Kikọ CV** — Awọn imọran fun CV to dara\n- **Awọn iṣẹrọ** — Ṣetọ fun awọn iṣẹrọ agbaye\n\nBeebeere mi ni pato ki n le ran ọ lọwọ dara!`
      : lang === 'pt'
      ? `Estou aqui para ajudá-lo! Entendi sua pergunta: "${input}".\n\nPosso ajudá-lo com:\n- **Empregos** — Encontre a vaga certa\n- **Salários** — Saiba sobre salários em diferentes países\n- **Vistos e imigração** — Entenda o processo de patrocínio\n- **Escrita de CV** — Dicas para um bom CV\n- **Entrevistas** — Prepare-se para entrevistas internacionais\n- **Custos de realocação** — Planeie sua mudança\n\nFaça-me uma pergunta específica para que eu possa ajudá-lo melhor!`
      : lang === 'es'
      ? `¡Estoy aquí para ayudarte! Entendí tu pregunta: "${input}".\n\nPuedo ayudarte con:\n- **Empleos** — Encuentra el puesto adecuado\n- **Salarios** — Conoce los salarios en diferentes países\n- **Visados e inmigración** — Entiende el proceso de patrocinio\n- **Escritura de CV** — Consejos para un buen CV\n- **Entrevistas** — Prepárate para entrevistas internacionales\n- **Costos de reubicación** — Planifica tu mudanza\n\n¡Hazme una pregunta específica para que pueda ayudarte mejor!`
      : lang === 'zh'
      ? `我在这里帮助你！我理解你的问题："${input}"。\n\n我可以帮助你：\n- **工作** — 找到合适的职位\n- **薪资** — 了解不同国家的薪资\n- **签证和移民** — 了解担保流程\n- **简历撰写** — 好简历的技巧\n- **面试** — 准备国际面试\n- **搬迁费用** — 计划你的搬迁\n\n请提出具体问题，我可以更好地帮助你！`
      : `I'm here to help! I understand you asked: "${input}".\n\nI can help you with:\n- **Jobs** — Find the right overseas job for your skills\n- **Salary information** — Know what to expect in different countries\n- **Visa & immigration** — Understand the sponsorship process\n- **CV writing** — Tips to make your application stand out\n- **Interview preparation** — Get ready for your international job interview\n- **Relocation costs** — Plan your move abroad\n- **Employer information** — Learn about verified employers\n\nFeel free to ask me anything in your own language — I'll respond in the same language!`,
  };
}

export function getSuggestedPrompts(): string[] {
  return suggestedPrompts;
}

export function getWelcomeMessage(): string {
  return `Hello! I'm your **GlobalHire AI Recruitment Assistant** 👋\n\nI'm here to help you with:\n- Finding the right overseas job\n- Understanding visa & immigration processes\n- Salary information across countries\n- CV writing and interview preparation\n- Relocation planning\n\n**You can ask me anything in your own language** — Swahili, French, Arabic, Amharic, Hausa, Yoruba, Portuguese, Spanish, Chinese, or English — and I'll respond in the same language!\n\nWhat can I help you with today?`;
}

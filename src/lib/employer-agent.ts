import type { Job } from './supabase';

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

const visaInfo: Record<string, { process: string; documents: string[]; timeline: string; cost: string; notes: string }> = {
  'UAE': {
    process: 'We apply for your work permit through the Ministry of Human Resources and Emiratisation (MOHRE). Once approved, the entry permit is issued, and you travel to UAE to complete medical tests and get the residence visa stamped.',
    documents: ['Valid passport (6+ months)', 'Passport-size photos (white background)', 'Attested educational certificates', 'Medical fitness certificate', 'Signed employment contract', 'Police clearance certificate'],
    timeline: '2-4 weeks for work permit approval, 1-2 weeks for visa stamping after arrival',
    cost: 'We cover visa fees (~$300-500). Medical test (~$90) is also covered by us.',
    notes: 'UAE work visas are valid for 2 years. Your passport will be held briefly during visa processing (1-2 weeks).',
  },
  'Saudi Arabia': {
    process: 'We obtain a block visa quota, then apply for your work visa through the Ministry of Foreign Affairs. You submit documents to the Saudi embassy in your country, then travel after visa stamping.',
    documents: ['Valid passport (6+ months)', 'Passport photos', 'Attested degrees/certificates', 'Police clearance (attested by Saudi embassy)', 'Medical report (GAMCA approved)', 'Employment contract'],
    timeline: '3-6 weeks for block visa approval, 2-3 weeks for embassy stamping',
    cost: 'We cover the work visa (~$270). GAMCA medical (~$80) and police clearance (~$30) are your responsibility.',
    notes: 'Saudi work visas (Iqama) are valid for 1-2 years, renewable. You cannot travel without the visa being stamped in your passport.',
  },
  'Qatar': {
    process: 'We apply for your work visa through the Ministry of Interior. After approval, you travel to Qatar, complete medical and biometric, and receive your Qatari ID (QID).',
    documents: ['Valid passport (6+ months)', 'Passport photos', 'Attested educational certificates', 'Police clearance certificate', 'Medical fitness report', 'Signed employment contract'],
    timeline: '2-5 weeks for visa approval, 1-2 weeks for QID after arrival',
    cost: 'We cover all visa costs (~$250-400). Medical in Qatar is covered by us.',
    notes: 'Qatar work visas are valid for 1-2 years. We handle the entire visa process for you.',
  },
  'Canada': {
    process: 'We obtain a Labour Market Impact Assessment (LMIA) or use an LMIA-exempt program, then you apply for a work permit through IRCC. Biometrics are required.',
    documents: ['Valid passport', 'Passport photos', 'Job offer letter', 'LMIA copy (if applicable)', 'Educational credential assessment (ECA)', 'Police clearance', 'Medical exam (panel physician)', 'Proof of funds', 'Biometrics appointment confirmation'],
    timeline: 'LMIA: 2-4 months. Work permit: 1-3 months after LMIA. Total: 3-7 months.',
    cost: 'Work permit fee: CAD $155 (~$115). Biometrics: CAD $85 (~$63). Medical: ~$200-300. We cover the LMIA fee ($1,000 CAD).',
    notes: 'Caregiver programs offer a direct PR pathway. Work permits are employer-specific. You may need to complete biometrics at a VFS office in your country.',
  },
  'United Kingdom': {
    process: 'We are a licensed sponsor. We issue a Certificate of Sponsorship (CoS), then you apply for a Skilled Worker Visa online, attend a visa application center for biometrics, and receive a vignette in your passport.',
    documents: ['Valid passport', 'Certificate of Sponsorship (CoS) reference number', 'English language proof (IELTS or exempt)', 'Bank statements (proof of funds)', 'Tuberculosis test result (if from listed country)', 'Criminal record certificate'],
    timeline: '3-8 weeks for visa decision after biometrics. Priority service available (5 days) for extra fee.',
    cost: 'Skilled Worker Visa: £719 (~$910) for up to 3 years. Healthcare surcharge: £1,035/year. We cover the CoS cost (£239).',
    notes: 'Skilled Worker Visa leads to Indefinite Leave to Remain (ILR) after 5 years. You can bring dependents.',
  },
  'Germany': {
    process: 'We apply for a work permit approval from the Federal Employment Agency. You then apply for a work visa at the German embassy. After arrival, you register your address and apply for a residence permit.',
    documents: ['Valid passport', 'Passport photos (biometric)', 'Job offer/contract', 'University degree (recognized/annotated)', 'Health insurance proof', 'Proof of accommodation', 'Biometrics'],
    timeline: 'Work permit pre-approval: 1-6 weeks. Visa processing: 4-12 weeks. Residence permit after arrival: 2-4 weeks.',
    cost: 'Visa fee: €75 (~$82). Residence permit: €100-110. We cover some costs.',
    notes: 'EU Blue Card available if salary meets threshold (~€45,300/year). Blue Card holders can get PR in 21-33 months.',
  },
  'Japan': {
    process: 'We apply for a Certificate of Eligibility (CoE) at the Regional Immigration Bureau in Japan. You then apply for a visa at the Japanese embassy with the CoE. After arrival, you get a Residence Card.',
    documents: ['Valid passport', 'Passport photos', 'Certificate of Eligibility (CoE)', 'Employment contract', 'Educational certificates', 'Curriculum vitae'],
    timeline: 'CoE: 1-3 months. Visa stamping: 5-10 business days. Total: 2-4 months.',
    cost: 'Visa fee: ~$30. We cover the CoE fee (¥4,000). Residence Card after arrival: ~$20.',
    notes: 'Specified Skilled Worker (SSW) visa requires passing skill test and Japanese language test (JLPT N4). SSW Type 1 valid up to 5 years.',
  },
  'South Korea': {
    process: 'For EPS: pass EPS-TOPIK language test and skill test in your country, then we select you. We apply for the employment permit, you get a visa at the Korean embassy.',
    documents: ['Valid passport', 'EPS-TOPIK certificate', 'Skill test certificate', 'Employment contract (signed)', 'Medical exam (Korean embassy approved)', 'Police clearance'],
    timeline: 'EPS-TOPIK: held 1-2 times/year. After selection: 2-6 weeks for visa. Total process: 3-8 months.',
    cost: 'EPS-TOPIK fee: ~$20. Visa fee: ~$30-50. Medical: ~$50-80. We cover employment permit fees.',
    notes: 'EPS work permits valid for 4 years 10 months, renewable once. You must pass TOPIK to apply.',
  },
  'Singapore': {
    process: 'We apply for a Work Pass (S Pass or Work Permit) through the Ministry of Manpower. Once approved, an In-Principle Approval (IPA) letter is issued. You travel to Singapore and complete formalities.',
    documents: ['Valid passport', 'IPA letter', 'Employment contract', 'Educational certificates', 'Medical exam (if required)', 'Security bond (for Work Permit)'],
    timeline: 'Work Pass approval: 1-3 weeks. IPA valid for 3 months. Must arrive within 60 days.',
    cost: 'S Pass: $105 SGD (~$78). Work Permit: $35 SGD (~$26). We cover the security bond ($3,000-5,000 SGD).',
    notes: 'S Pass requires minimum salary of $3,150 SGD. Work Permit holders have sector restrictions.',
  },
  'Oman': {
    process: 'We apply for your work visa through the Ministry of Labour. After approval, you travel to Oman, complete medical, and get your residency card.',
    documents: ['Valid passport (6+ months)', 'Passport photos', 'Attested certificates', 'Employment contract', 'Medical fitness certificate'],
    timeline: '1-3 weeks for visa approval, 1 week for residency card after arrival',
    cost: 'We cover visa costs (~$130-260). Medical: ~$65.',
    notes: 'Oman work visas valid for 1-2 years. We hold your passport briefly during processing.',
  },
  'Kuwait': {
    process: 'We apply for a work permit through the Ministry of Social Affairs and Labour. After approval, visa is stamped at the Kuwaiti embassy, then you travel and get your Civil ID.',
    documents: ['Valid passport (6+ months)', 'Passport photos', 'Attested educational certificates', 'Police clearance (attested by Kuwaiti embassy)', 'Medical report (GAMCA)', 'Employment contract'],
    timeline: '2-4 weeks for work permit, 1-2 weeks for embassy stamping',
    cost: 'We cover visa (~$170). GAMCA medical: ~$80.',
    notes: 'Kuwait work visas valid for 1-2 years. Article 18 (work visa) is the standard for private sector.',
  },
  'Bahrain': {
    process: 'We apply for your work visa through the Labour Market Regulatory Authority (LMRA). After approval, you travel to Bahrain and get your CPR card.',
    documents: ['Valid passport (6+ months)', 'Passport photos', 'Attested certificates', 'Medical fitness certificate', 'Employment contract'],
    timeline: '1-3 weeks for visa approval, 1 week for CPR after arrival',
    cost: 'We cover visa fees (~$200-300). Medical: ~$65.',
    notes: 'Bahrain work visas valid for 1-2 years. Flexible visa option also available for job seekers.',
  },
  'Australia': {
    process: 'We sponsor you for a Temporary Skill Shortage (TSS) visa (subclass 482). We must be an approved sponsor. You apply online, provide biometrics, and complete health checks.',
    documents: ['Valid passport', 'Skills assessment', 'English language proof (IELTS)', 'Health examination', 'Character certificate (police check)', 'Employer sponsorship nomination'],
    timeline: 'Nomination: 1-3 months. Visa: 2-6 months. Total: 3-9 months.',
    cost: 'TSS visa: AUD $1,495 (~$980). Health check: ~$300-500. English test: ~$250.',
    notes: 'TSS visa valid for 2-4 years. Path to PR via Employer Nomination Scheme (subclass 186) after 3 years.',
  },
  'New Zealand': {
    process: 'We apply for an Accredited Employer Work Visa (AEWV) job check, then you apply for the work visa. Requires health check, police certificate, and English proof.',
    documents: ['Valid passport', 'Job offer from accredited employer', 'Qualifications/skills assessment', 'English proof (IELTS/PTE)', 'Health certificate', 'Police certificate'],
    timeline: 'Job check: 1-2 months. Visa: 2-4 months. Total: 3-6 months.',
    cost: 'AEWV visa: NZD $750 (~$460). Health: ~$200-400.',
    notes: 'AEWV valid for up to 3 years. Path to PR via Skilled Migrant Category.',
  },
  'Ireland': {
    process: 'We apply for a Critical Skills Employment Permit or General Employment Permit through the Department of Enterprise. You then apply for a visa (if required) and register with INIS after arrival.',
    documents: ['Valid passport', 'Employment permit', 'Passport photos', 'Proof of qualifications', 'Police clearance', 'Biometrics'],
    timeline: 'Permit: 2-4 months. Visa: 4-8 weeks. Total: 3-6 months.',
    cost: 'Critical Skills Permit: €1,000 (~$1,090). General Permit: €500 (~$545). We may reimburse.',
    notes: 'Critical Skills Permit leads to PR after 2 years. Spouse can work immediately.',
  },
  'Poland': {
    process: 'We apply for a work permit through the Voivode Office. You then apply for a D-type work visa at the Polish embassy. After arrival, you apply for a temporary residence permit.',
    documents: ['Valid passport', 'Work permit', 'Passport photos', 'Proof of accommodation', 'Health insurance', 'Employment contract'],
    timeline: 'Work permit: 1-3 months. Visa: 2-4 weeks. Total: 2-5 months.',
    cost: 'Work permit: ~€50-100. Visa: €80. Residence permit: ~€100.',
    notes: 'Poland work visas valid for 1-3 years. EU Blue Card available for qualified workers.',
  },
};

const travelInfo: Record<string, { flight: string; tips: string[] }> = {
  'UAE': { flight: 'Direct flights to Dubai/Abu Dhabi from most African capitals. Flight time: 5-8 hours. Cost: $300-600.', tips: ['Dress modestly upon arrival', 'Keep your visa copy handy at immigration', 'We typically arrange airport pickup'] },
  'Saudi Arabia': { flight: 'Direct flights to Riyadh/Jeddah from major African cities. Flight time: 5-7 hours. Cost: $350-650.', tips: ['You must have visa stamped before travel', 'No alcohol in luggage', 'Bring warm clothes for winter'] },
  'Qatar': { flight: 'Direct flights to Doha. Flight time: 5-7 hours. Cost: $350-600.', tips: ['Keep IPA/visa copy with you', 'Hamad International Airport is very efficient', 'We arrange pickup'] },
  'Canada': { flight: 'Connecting flights via Europe or Middle East. Flight time: 15-25 hours. Cost: $600-1,200.', tips: ['Bring warm clothing — winters are harsh', 'Carry all original documents', 'Register with your embassy on arrival'] },
  'United Kingdom': { flight: 'Direct flights to London from some African capitals. Flight time: 8-11 hours. Cost: $500-900.', tips: ['Carry your vignette and decision letter', 'Register with a GP within first week', 'Open a UK bank account early'] },
  'Germany': { flight: 'Direct flights to Frankfurt/Munich. Flight time: 9-12 hours. Cost: $500-900.', tips: ['Register your address within 14 days', 'Get health insurance immediately', 'Learn basic German for daily life'] },
  'Japan': { flight: 'Connecting flights via Middle East or Asia. Flight time: 16-22 hours. Cost: $700-1,300.', tips: ['Carry your CoE and visa', 'Register at the ward office within 14 days', 'Get a Residence Card at the airport'] },
  'South Korea': { flight: 'Connecting flights. Flight time: 14-20 hours. Cost: $600-1,100.', tips: ['Carry your EPS certificate', 'Get ARC within 90 days', 'Download necessary Korean apps'] },
};

function detectLang(text: string): string {
  const lower = text.toLowerCase();
  if (/[\u1200-\u137F]/.test(text)) return 'am';
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  if (/\b(le|la|les|de|une|un|est|je|tu|comment|pourquoi|avec)\b/i.test(lower)) return 'fr';
  if (/\b(ni|na|ya|wa|ku|la|sana|habari|tafadhali|asante)\b/i.test(lower)) return 'sw';
  return 'en';
}

function getGreeting(lang: string, name: string, company: string, title: string): string {
  const greetings: Record<string, string> = {
    en: `Hi there! I'm ${name} from ${company}. I posted this ${title} position and I'm happy to answer any questions you have about the job, visa, travel, accommodation, or anything else. What would you like to know?`,
    sw: `Habari! Mimi ni ${name} kutoka ${company}. Nilichapisha nafasi hii ya ${title} na niko tayari kujibu maswali yako yote kuhusu kazi, visa, safari, malazi, au chochote. Ungependa kujua nini?`,
    fr: `Bonjour ! Je suis ${name} de ${company}. J'ai publié ce poste de ${title} et je suis là pour répondre à toutes vos questions sur le travail, le visa, le voyage, le logement ou autre chose. Que voulez-vous savoir ?`,
    ar: `مرحباً! أنا ${name} من ${company}. لقد نشرت هذا المنصب (${title}) وأنا سعيد بالإجابة على أي أسئلة لديك حول الوظيفة أو التأشيرة أو السفر أو السكن أو أي شيء آخر. ماذا تريد أن تعرف؟`,
    am: `ሰላም! እኔ ${name} ከ${company} ነኝ። ይህን ${title} ስራ ልወጣለሁ እና ስለ ስራው፣ ቪዛ፣ ጉዞ፣ መኖሪያ ወይም ሌላ ማንኛውም ጥያቄ ልመልስልዎት እወዳለሁ። ምን ማወቅ ይፈልጋሉ?`,
    ha: `Sannu! Ni ne ${name} daga ${company}. Na buga wannan matsayin ${title} kuma na fi son amsa duk tambayoyinku game da aikin, biza, tafiya, zama, ko kome. Me kuna so ku sani?`,
    yo: `Ẹ n lẹ! Emi ni ${name} láti ${company}. Mo ṣe atẹjade ipo ${title} yii mo si wà lati dáhun gbogbo ibeere rẹ nipa iṣẹ naa, vísà, ìrìn-àjò, ibùgbé tabi ohunkóhun. Kini o fẹ́ mọ̀?`,
    pt: `Olá! Sou ${name} da ${company}. Publiquei esta vaga de ${title} e estou aqui para responder quaisquer perguntas que você tenha sobre o trabalho, visto, viagem, alojamento ou qualquer outra coisa. O que gostaria de saber?`,
    es: `¡Hola! Soy ${name} de ${company}. Publiqué esta posición de ${title} y estoy aquí para responder cualquier pregunta que tengas sobre el trabajo, visa, viaje, alojamiento o cualquier otra cosa. ¿Qué te gustaría saber?`,
    zh: `你好！我是${company}的${name}。我发布了这个${title}职位，很高兴回答你关于工作、签证、旅行、住宿或任何其他问题。你想了解什么？`,
  };
  return greetings[lang] || greetings.en;
}

export function getAgentResponse(input: string, job: Job): string {
  const lang = detectLang(input);
  const lower = input.toLowerCase();
  const country = job.country;
  const visaData = visaInfo[country] || visaInfo['UAE'];
  const travelData = travelInfo[country];
  const name = job.agent_name || 'the employer';

  if (lower.match(/\b(hi|hello|hey|habari|hujambo|jambo|sannu|salut|bonjour|你好|مرحبا|hola|olá|ola)\b/i) || lower.length < 5) {
    return `${getGreeting(lang, name, job.company, job.title)}\n\nI can answer questions about the role, salary, visa process, documents, accommodation, and travel. What would you like to know?`;
  }

  const isVisaQ = lower.match(/\b(visa|work permit|work visa|sponsorship|biza|تأشيرة|visto|visado|签证|ruhusa)\b/i);
  const isPassportQ = lower.match(/\b(passport|pasipoti|passeport|جواز السفر|passaporte|паспорт)\b/i);
  const isTravelQ = lower.match(/\b(travel|flight|fly|airline|airport|safari|ndege|رحلة|vol|viaje|viagem|旅行|航班)\b/i);
  const isSalaryQ = lower.match(/\b(salary|pay|wage|money|mshahara|salaire|راتب|salario|薪水|工资|albashi)\b/i);
  const isAccomQ = lower.match(/\b(accommodation|housing|room|live|stay|malazi|logement|سكن|alojamento|alojamiento|住宿|屋企)\b/i);
  const isContractQ = lower.match(/\b(contract|duration|how long|years|mkataba|contrat|عقد|contrato|contrato|合同|kwangila)\b/i);
  const isDocsQ = lower.match(/\b(document|certificate|papers|nyaraka|documents|وثائق|documentos|文件|takarda)\b/i);
  const isProcessQ = lower.match(/\b(process|how|steps|procedure|mchakato|process|كيف|proceso|processo|如何|yaya)\b/i);
  const isApplyQ = lower.match(/\b(apply|application|how do i|can i|join|start|ombi|تقديم|inscrever|申请|报名)\b/i);

  if (isApplyQ) {
    return lang === 'sw'
      ? `Kuomba, nenda kwenye ukurasa wa kazi na ubonyeze "Apply Now". Utahitaji kujaza fomu yako ya kibinafsi, pakitia nyaraka, na kisha kusanya. Baada ya kuomba, nitapitia maombi yako na nikujulisha haraka.`
      : lang === 'ar'
      ? `للتقديم، انتقل إلى صفحة الوظيفة واضغط على "Apply Now". ستحتاج إلى ملء بياناتك الشخصية، تحميل المستندات، ثم التقديم. بعد التقديم، سأراجع طلبك وأرد عليك بسرعة.`
      : `To apply, go to the job page and click "Apply Now". You'll need to fill in your personal details, upload documents, and submit. After you apply, I'll review your application and get back to you quickly.`;
  }

  if (isVisaQ || (isProcessQ && lower.includes('visa'))) {
    return formatVisaResponse(visaData, country, lang);
  }

  if (isPassportQ) {
    if (lower.includes('renew') || lower.includes('expire')) {
      return lang === 'sw'
        ? `Kwa ajili ya kuomba pasipoti mpya au kuirenew, nenda ofisi ya passport na: passport ya sasa, picha mpya, na ada. Ikiwa passport yako ina muda chini ya miezi 6, nchi nyingi hazikubali — renew kabla ya kuomba visa.`
        : `For passport renewal, visit your passport office with: your current passport, new photos, and the fee. If your passport has less than 6 months validity, most countries will reject your application — renew before applying.`;
    }
    return lang === 'sw'
      ? `Kuomba passport, tembelea ofisi yako ya passport na: cheti cha kuzaliwa, kitambulisho cha kitaifa, picha, na ada. Inachukua wiki 2-6.\n\nKwa ${country}, unahitaji: ${visaData.documents.find(d => d.toLowerCase().includes('passport')) || 'Passport halali (miezi 6+)'}.`
      : `To apply for a passport, visit your local passport office with: birth certificate, national ID, passport photos, and the fee. Processing takes 2-6 weeks.\n\nFor ${country}, you need: ${visaData.documents.find(d => d.toLowerCase().includes('passport')) || 'Valid passport (6+ months)'}.`;
  }

  if (isTravelQ && travelData) {
    return lang === 'sw'
      ? `Kuhusu safari kwenda ${country}:\n\n✈️ ${travelData.flight}\n\n**Vidokezo:**\n${travelData.tips.map(t => `• ${t}`).join('\n')}`
      : `About travel to ${country}:\n\n✈️ ${travelData.flight}\n\n**Tips:**\n${travelData.tips.map(t => `• ${t}`).join('\n')}`;
  }

  if (isSalaryQ) {
    const min = job.salary_min;
    const max = job.salary_max || min;
    return lang === 'sw'
      ? `Mshahara wa kazi hii ni kati ya $${min} hadi $${max} kwa mwezi. Tutakuonyesha kwa sarafu yako. Pia tunatoa faida kama: ${job.benefits?.join(', ') || 'malazi, chakula, na bima'}.`
      : `The salary for this position ranges from $${min} to $${max} per month. We also provide benefits like: ${job.benefits?.join(', ') || 'accommodation, meals, and insurance'}.`;
  }

  if (isAccomQ) {
    if (job.accommodation) {
      return lang === 'sw'
        ? `Ndiyo! Tunatoa malazi bila malipo kwa wafanyakazi. Ni chumba karibu na eneo la kazi. Hakuna gharama za ziada.`
        : `Yes! We provide free accommodation for employees. It's a room near the workplace. No additional cost to you.`;
    }
    return lang === 'sw'
      ? `Samahani, hatutoi malazi. Utahitaji kupanga mwenyewe. Ninashauri kutafuta chumba karibu na eneo la kazi.`
      : `Unfortunately we don't provide accommodation. You'll need to arrange your own housing. I recommend finding a place near the workplace.`;
  }

  if (isContractQ) {
    return lang === 'sw'
      ? `Mkataba wa kazi hii ni wa ${job.contract}. Baada ya hapo, unaweza kusasishwa. Aina ya kazi: ${job.type}.`
      : `The contract for this position is ${job.contract}. After that, it may be renewed. Job type: ${job.type}.`;
  }

  if (isDocsQ) {
    return lang === 'sw'
      ? `**Nyaraka zinazohitajika kwa ${country}:**\n\n${visaData.documents.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\nTafadhali hakikisha nyaraka zote zimehakikishwa na ubalozi husika.`
      : `**Required documents for ${country}:**\n\n${visaData.documents.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\nMake sure all documents are attested by the relevant embassy.`;
  }

  if (isProcessQ) {
    return formatVisaResponse(visaData, country, lang);
  }

  if (lower.match(/\b(what|tell|about|describe|info|information|details|nini|habari|maelezo|ما|qué|o que|什么)\b/i)) {
    return lang === 'sw'
      ? `Hii kazi ya **${job.title}** katika **${job.company}** huko **${job.city}, ${country}**.\n\n**Mshahara:** $${job.salary_min} - $${job.salary_max || job.salary_min}/mo\n**Aina:** ${job.type}\n**Mkataba:** ${job.contract}\n\nNiulize kuhusu visa, passport, safari, malazi, au chochote!`
      : `This is a **${job.title}** position at **${job.company}** in **${job.city}, ${country}**.\n\n**Salary:** $${job.salary_min} - $${job.salary_max || job.salary_min}/mo\n**Type:** ${job.type}\n**Contract:** ${job.contract}\n\nAsk me about visa, passport, travel, accommodation, or anything!`;
  }

  const generic: Record<string, string> = {
    en: `Thanks for your message! I'm ${name} from ${company}. I'm here to help with any questions about the ${job.title} position in ${job.city}, ${country}. You can ask me about:\n\n• Visa and work permit\n• Passport requirements\n• Travel arrangements\n• Salary and benefits\n• Accommodation\n• Contract details\n• Required documents\n\nFeel free to ask in your own language!`,
    sw: `Asante kwa ujumbe wako! Mimi ni ${name} kutoka ${company}. Niko hapa kusaidia na maswali kuhusu kazi ya ${job.title} huko ${job.city}, ${country}. Unaweza kuniuliza kuhusu:\n\n• Visa\n• Passport\n• Safari\n• Mshahara na faida\n• Malazi\n• Mkataba\n• Nyaraka\n\nUliza kwa lugha yako!`,
    ar: `شكراً على رسالتك! أنا ${name} من ${company}. أنا هنا لمساعدتك في أي أسئلة حول وظيفة ${job.title} في ${job.city}, ${country}. يمكنك سؤالي عن:\n\n• التأشيرة\n• جواز السفر\n• ترتيبات السفر\n• الراتب والمزايا\n• السكن\n• تفاصيل العقد\n• المستندات\n\nاسأل بلغتك!`,
    fr: `Merci pour votre message ! Je suis ${name} de ${company}. Je suis là pour vous aider avec des questions sur le poste de ${job.title} à ${job.city}, ${country}. Vous pouvez me demander :\n\n• Le visa\n• Le passeport\n• Le voyage\n• Le salaire et les avantages\n• Le logement\n• Le contrat\n• Les documents\n\nPosez vos questions dans votre langue !`,
  };
  return generic[lang] || generic.en;
}

function formatVisaResponse(visaData: typeof visaInfo['UAE'], country: string, lang: string): string {
  if (lang === 'sw') {
    return `**Mchakato wa Visa — ${country}:**\n\n📋 ${visaData.process}\n\n📄 **Nyaraka:**\n${visaData.documents.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n⏱️ **Muda:** ${visaData.timeline}\n\n💰 **Gharama:** ${visaData.cost}\n\nℹ️ ${visaData.notes}`;
  }
  if (lang === 'ar') {
    return `**عملية التأشيرة — ${country}:**\n\n📋 ${visaData.process}\n\n📄 **المستندات:**\n${visaData.documents.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n⏱️ **الوقت:** ${visaData.timeline}\n\n💰 **التكلفة:** ${visaData.cost}\n\nℹ️ ${visaData.notes}`;
  }
  if (lang === 'fr') {
    return `**Visa — ${country}:**\n\n📋 ${visaData.process}\n\n📄 **Documents :**\n${visaData.documents.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n⏱️ **Délai :** ${visaData.timeline}\n\n💰 **Coût :** ${visaData.cost}\n\nℹ️ ${visaData.notes}`;
  }
  return `**Visa Process — ${country}:**\n\n📋 ${visaData.process}\n\n📄 **Documents:**\n${visaData.documents.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n⏱️ **Timeline:** ${visaData.timeline}\n\n💰 **Cost:** ${visaData.cost}\n\nℹ️ ${visaData.notes}`;
}

export function getAgentSuggestions(job: Job): string[] {
  return [
    `What is the visa process for ${job.country}?`,
    `What documents do I need?`,
    `How much is the salary?`,
    `Is accommodation provided?`,
    `What are the travel arrangements?`,
    `How do I apply?`,
  ];
}

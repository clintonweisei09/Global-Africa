import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  MapPin,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Briefcase,
  X,
  Plane,
  Wallet,
  Mail,
  Clock,
  ShieldCheck,
  Download,
  Printer,
  Stamp,
  Smartphone,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { kenyaJobs } from '../data/kenyaJobs';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { eastAfricanCountries } from '../lib/currency';
import type { TravelDocument } from '../lib/supabase';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

type Phase = 'form' | 'submitting' | 'reviewing' | 'accepted' | 'error';

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50"
      />
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read the file.'));
    reader.readAsDataURL(file);
  });
}

const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '').slice(0, 10);
const normalizeIdNumber = (value: string) => value.replace(/\D/g, '').slice(0, 8);
const isValidPhoneNumber = (value: string) => /^\d{10}$/.test(value);
const isValidIdNumber = (value: string) => /^\d{8}$/.test(value);

async function triggerMpesaStkPush({
  phone,
  amount,
  description,
  reference,
}: {
  phone?: string;
  amount: number;
  description: string;
  reference: string;
}) {
  const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
    body: { phone, amount, description, reference },
  });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || 'Unable to start the M-Pesa STK push.');
  return data;
}

const passportAuthorityNames: Record<string, string> = {
  KE: 'Directorate of Immigration Services',
  RW: 'Directorate General of Immigration and Emigration',
  UG: 'Directorate of Citizenship and Immigration Control',
  TZ: 'Immigration Services Department',
  BI: 'General Commissariat for Migration',
  SS: 'Directorate of Nationality, Passports and Immigration',
  ET: 'Main Department for Immigration and Nationality Affairs',
  SO: 'Directorate of Immigration and Citizenship',
  CD: 'General Directorate of Migration',
  NG: 'Nigeria Immigration Service',
  GH: 'Passport Office',
  US: 'U.S. Department of State',
  CA: 'Immigration, Refugees and Citizenship Canada',
  GB: 'His Majesty\'s Passport Office',
  AU: 'Australian Passport Office',
  NZ: 'Department of Internal Affairs',
  DE: 'Federal Foreign Office',
  FR: 'Ministry for Europe and Foreign Affairs',
  JP: 'Ministry of Foreign Affairs',
  KR: 'Ministry of Foreign Affairs',
};

const passportCountryCodes: Record<string, string> = {
  KE: 'KEN', UG: 'UGA', TZ: 'TZA', RW: 'RWA', BI: 'BDI', SS: 'SSD', ET: 'ETH', SO: 'SOM',
  CD: 'COD', NG: 'NGA', GH: 'GHA', US: 'USA', CA: 'CAN', GB: 'GBR', AU: 'AUS', NZ: 'NZL',
  DE: 'DEU', FR: 'FRA', JP: 'JPN', KR: 'KOR', AE: 'ARE', QA: 'QAT', SA: 'SAU',
};

const getPassportCountryCode = (code?: string) => passportCountryCodes[code || 'KE'] || (code || 'KE').slice(0, 3).toUpperCase();

function getPassportCountry(form: any) {
  const country = eastAfricanCountries.find((item) => item.code === form?.nationality) || eastAfricanCountries.find((item) => item.code === 'KE')!;
  return {
    ...country,
    government: `Government of ${country.name}`,
    authority: passportAuthorityNames[country.code] || 'National Passport Authority',
  };
}

function generatePassportPDFHTML(
  doc: TravelDocument,
  form: any,
  passportPhotoData?: string,
  issueDate?: string,
  expiryDate?: string,
): string {
  const safePhoto = passportPhotoData ? passportPhotoData.replace(/"/g, '&quot;') : '';
  const passportCountry = getPassportCountry(form);

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Passport - ${doc.document_number}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body {
        margin: 0;
        background: #f7f7f5;
        font-family: Arial, Helvetica, sans-serif;
        color: #111827;
      }
      .page {
        max-width: 900px;
        margin: 0 auto;
        background: #ffffff;
        border: 3px solid #d4af37;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      }
      .header {
        background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #d4af37 100%);
        color: #fff;
        padding: 18px 26px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header-left { display: flex; flex-direction: column; gap: 4px; }
      .header-label {
        font-size: 9px;
        letter-spacing: 2px;
        text-transform: uppercase;
        opacity: 0.8;
      }
      .header-title {
        font-size: 27px;
        font-weight: 900;
        letter-spacing: 1px;
      }
      .header-right {
        text-align: right;
        font-weight: 700;
      }
      .main {
        position: relative;
        padding: 22px 26px 16px;
      }
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-28deg);
        font-size: 72px;
        font-weight: 900;
        letter-spacing: 10px;
        color: rgba(234, 179, 8, 0.08);
        pointer-events: none;
      }
      .content {
        position: relative;
        z-index: 1;
        display: flex;
        gap: 24px;
        align-items: flex-start;
      }
      .photo-box {
        width: 130px;
        height: 150px;
        border: 2px solid #d1d5db;
        background: #f8fafc;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        flex-shrink: 0;
      }
      .photo-box img { width: 100%; height: 100%; object-fit: cover; }
      .grid {
        flex: 1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px 20px;
      }
      .field {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 6px;
      }
      .label {
        display: block;
        font-size: 9px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .value {
        display: block;
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.4;
      }
      .footer {
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        padding: 12px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9px;
        color: #64748b;
      }
      .badge {
        border: 2px solid #b45309;
        padding: 5px 8px;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #b45309;
        background: #fff7ed;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div class="header-left">
          <div class="header-label">${passportCountry.government}</div>
          <div class="header-title">PASSPORT</div>
        </div>
        <div class="header-right">
          <div class="header-label">${passportCountry.authority}</div>
          <div>Official Travel Document</div>
        </div>
      </div>

      <div class="main">
        <div class="watermark">PASSPORT</div>
        <div class="content">
          <div class="photo-box">${safePhoto ? `<img src="${safePhoto}" alt="Applicant photo" />` : 'Photo'}</div>
          <div class="grid">
            <div class="field"><span class="label">Document No.</span><span class="value">${doc.document_number}</span></div>
            <div class="field"><span class="label">Country</span><span class="value">${passportCountry.flag} ${passportCountry.name}</span></div>
            <div class="field"><span class="label">Full Name</span><span class="value">${doc.full_name}</span></div>
            <div class="field"><span class="label">Nationality</span><span class="value">${passportCountry.name}</span></div>
            <div class="field"><span class="label">Date of Birth</span><span class="value">${form?.dateOfBirth || '—'}</span></div>
            <div class="field"><span class="label">Sex</span><span class="value">${form?.gender || '—'}</span></div>
            <div class="field"><span class="label">Issue Date</span><span class="value">${issueDate || '—'}</span></div>
            <div class="field"><span class="label">Expiry Date</span><span class="value">${expiryDate || '—'}</span></div>
            <div class="field"><span class="label">Type</span><span class="value">Ordinary</span></div>
            <div class="field"><span class="label">Authority</span><span class="value">${passportCountry.authority}</span></div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div>Applicant travel-document preview generated for GlobalHire Africa. This is a non-government visual template.</div>
        <div class="badge">NOT VALID FOR TRAVEL</div>
      </div>
    </div>
  </body>
  </html>`;
}

function generateVisaPDFHTML(
  doc: TravelDocument,
  job: any,
  form: any,
  nationality: string,
  issueDate: string,
  expiryDate: string,
  passportPhotoData?: string,
): string {
  const safePassportPhoto = passportPhotoData ? passportPhotoData.replace(/"/g, '&quot;') : '';

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Kenya Work Visa - ${doc.document_number}</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body {
        margin: 0;
        background: #f8fafc;
        font-family: 'Times New Roman', Georgia, serif;
        color: #0f172a;
      }
      .visa-doc {
        max-width: 920px;
        margin: 0 auto;
        background: #fff;
        border: 3px solid #991b1b;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
      }
      .header {
        background: linear-gradient(135deg, #7f1d1d, #991b1b 55%, #b91c1c 100%);
        color: #fff;
        padding: 18px 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header h1 { margin: 0; font-size: 26px; letter-spacing: 2px; }
      .header .sub {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #fecaca;
      }
      .body {
        position: relative;
        padding: 28px 28px 20px;
      }
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-28deg);
        font-size: 94px;
        font-weight: 900;
        color: rgba(148, 163, 184, 0.18);
        pointer-events: none;
        z-index: 0;
      }
      .doc-row, .section, .stamp-area, .applicant {
        position: relative;
        z-index: 1;
      }
      .doc-row {
        display: flex;
        justify-content: space-between;
        padding-bottom: 12px;
        margin-bottom: 16px;
        border-bottom: 2px dashed #cbd5e1;
      }
      .doc-row label, .field label, .stamp-area label {
        display: block;
        font-size: 8px;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 700;
        letter-spacing: 1.2px;
      }
      .doc-row span, .field span {
        display: block;
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
      }
      .applicant {
        display: flex;
        gap: 20px;
        margin-bottom: 18px;
      }
      .photo {
        width: 96px;
        height: 118px;
        border: 2px solid #cbd5e1;
        background: #f8fafc;
        overflow: hidden;
        flex-shrink: 0;
      }
      .photo img { width: 100%; height: 100%; object-fit: cover; }
      .details {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 18px;
      }
      .field {
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
      }
      .section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 18px;
        border-top: 1px solid #e2e8f0;
        padding-top: 12px;
        margin-top: 12px;
      }
      .stamp-area {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-top: 2px solid #e2e8f0;
        margin-top: 16px;
        padding-top: 18px;
      }
      .sig {
        font-size: 26px;
        font-weight: 900;
        color: #64748b;
        font-family: cursive;
      }
      .stamp {
        width: 92px;
        height: 92px;
        border: 3px double #dc2626;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        transform: rotate(-8deg);
        background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(254,226,226,1) 55%, rgba(254,202,202,1) 100%);
      }
      .stamp-inner {
        font-size: 7px;
        font-weight: 900;
        color: #dc2626;
        line-height: 1.3;
        text-transform: uppercase;
      }
      .footer {
        background: #f8fafc;
        padding: 10px 24px;
        font-size: 8px;
        color: #64748b;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #e2e8f0;
      }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <div class="visa-doc">
      <div class="header">
        <div>
          <div class="sub">Republic of Kenya</div>
          <h1>DEPARTMENT OF IMMIGRATION</h1>
        </div>
        <div style="text-align:right;">
          <div class="sub">Official Work Visa</div>
          <div style="font-size:12px;font-weight:700;letter-spacing:1px;">OFFICIAL COPY</div>
        </div>
      </div>

      <div class="body">
        <div class="watermark">VISA</div>
        <div class="doc-row">
          <div>
            <label>Visa Number</label>
            <span style="font-family:monospace;font-size:16px;">${doc.document_number}</span>
          </div>
          <div style="text-align:right;">
            <label>Entry Type</label>
            <span>Employment / Work</span>
          </div>
        </div>

        <div class="applicant">
          <div class="photo">${safePassportPhoto ? `<img src="${safePassportPhoto}" alt="Passport photo" />` : 'PHOTO'}</div>
          <div class="details">
            <div class="field"><label>Full Name</label><span>${doc.full_name}</span></div>
            <div class="field"><label>Nationality</label><span>${nationality || '—'}</span></div>
            <div class="field"><label>Date of Birth</label><span>${form?.dateOfBirth || '—'}</span></div>
            <div class="field"><label>Gender</label><span style="text-transform:capitalize;">${form?.gender || '—'}</span></div>
            <div class="field"><label>Passport / ID No.</label><span>${form?.idNumber || '—'}</span></div>
            <div class="field"><label>Phone</label><span>${form?.phone || '—'}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="field"><label>Employer</label><span>${job?.company || ''}</span></div>
          <div class="field"><label>Position</label><span>${job?.title || ''}</span></div>
          <div class="field"><label>Workplace</label><span>${job?.city || ''}, ${doc.country}</span></div>
          <div class="field"><label>Salary / Month</label><span>${formatJobSalary(job?.salary_min ?? 0, job?.country)}${job?.salary_max ? ` - ${formatJobSalary(job.salary_max, job?.country)}` : ''}</span></div>
          <div class="field"><label>Processing Fee</label><span>USD $150</span></div>
          <div class="field"><label>Purpose</label><span>Employment</span></div>
        </div>

        <div class="section">
          <div class="field"><label>Issue Date</label><span>${issueDate}</span></div>
          <div class="field"><label>Expiry Date</label><span>${expiryDate}</span></div>
        </div>

        <div class="stamp-area">
          <div>
            <label>Authorized Signature</label>
            <div class="sig">J.M. Njeri</div>
            <div style="font-size:10px;color:#64748b;">Immigration Officer</div>
          </div>
          <div class="stamp">
            <div class="stamp-inner">Kenya<br>Immigration<br>Approved<br>${new Date(doc.issue_date).toLocaleDateString('en-GB')}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div>Official visa document generated for review. Not valid for travel unless government-issued.</div>
        <div style="font-family:monospace; font-size:9px; color:#0f172a;">${doc.id.slice(0, 8).toUpperCase()}</div>
      </div>
    </div>
  </body>
  </html>`;
}

function generateKenyaCertificateHTML(docType: 'Good Conduct' | 'Police Clearance', doc: TravelDocument, job: any, form: any): string {
  const safeFullName = (form.fullName || doc.full_name || 'Applicant').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeEmployer = (job?.company || 'Employer').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const issueDate = new Date(doc.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>${docType} - ${doc.document_number}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px; }
      .sheet { max-width: 900px; margin: 0 auto; background: white; border: 3px solid #0f172a; border-radius: 18px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #0f172a, #1d4ed8); color: white; padding: 24px 36px; }
      .header h1 { margin: 0; font-size: 30px; letter-spacing: 1px; }
      .header p { margin: 6px 0 0; opacity: 0.8; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; }
      .body { padding: 28px 36px 18px; }
      .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 24px; margin-top: 20px; }
      .label { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; }
      .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
      .seal { border: 3px solid #1d4ed8; border-radius: 50%; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; font-weight: 900; color: #1d4ed8; transform: rotate(-15deg); }
      .footer { padding: 18px 36px 30px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; }
      .sign { font-size: 18px; font-weight: 700; }
      .stamp-row { display: flex; justify-content: space-between; align-items: center; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <p>Republic of Kenya</p>
        <h1>${docType.toUpperCase()}</h1>
      </div>
      <div class="body">
        <p style="margin:0; font-size: 16px; line-height: 1.7;">This is to certify that <strong>${safeFullName}</strong> has applied for employment with <strong>${safeEmployer}</strong> and has complied with the required suitability checks as presented by the employer and the relevant Kenyan authorities.</p>
        <div class="meta">
          <div><div class="label">Document Number</div><div class="value">${doc.document_number}</div></div>
          <div><div class="label">Applicant Name</div><div class="value">${safeFullName}</div></div>
          <div><div class="label">National ID / Passport</div><div class="value">${form.idNumber || 'N/A'}</div></div>
          <div><div class="label">Telephone</div><div class="value">${form.phone || 'N/A'}</div></div>
          <div><div class="label">Date of Birth</div><div class="value">${form.dateOfBirth || 'N/A'}</div></div>
          <div><div class="label">Nationality</div><div class="value">${form.nationality ? form.nationality.toUpperCase() : 'KE'}</div></div>
          <div><div class="label">Issue Date</div><div class="value">${issueDate}</div></div>
          <div><div class="label">Purpose</div><div class="value">Employment Screening</div></div>
        </div>
      </div>
      <div class="footer">
        <div>
          <div class="label">Authorized Signature</div>
          <div class="sign">Commissioner for Oaths / Police Desk</div>
        </div>
        <div class="seal">KENYA<br />AUTHORITY</div>
      </div>
    </div>
  </body>
  </html>`;
}

function KenyaDocumentPopup({
  doc,
  job,
  form,
}: {
  doc: TravelDocument;
  job: any;
  form: any;
}) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paid, setPaid] = useState(doc.status === 'paid');
  const feeAmount = doc.document_type === 'Good Conduct' ? 2500 : 3000;
  const issueDate = new Date(doc.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleDownload = () => {
    if (!paid) {
      setShowPayModal(true);
      return;
    }

    const html = generateKenyaCertificateHTML(doc.document_type as 'Good Conduct' | 'Police Clearance', doc, job, form);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.document_type.replace(/\s+/g, '_')}_${doc.document_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!paid) {
      setShowPayModal(true);
      return;
    }

    const html = generateKenyaCertificateHTML(doc.document_type as 'Good Conduct' | 'Police Clearance', doc, job, form);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 500);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setPayError('');
    setPaymentMessage('');

    try {
      const reference = `${doc.document_type.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
      await triggerMpesaStkPush({
        phone: form.phone || '',
        amount: feeAmount,
        description: `${doc.document_type} document fee - ${doc.document_number}`,
        reference,
      });
      setPaid(true);
      setPaymentMessage('STK Push sent successfully. Please approve the payment on your phone, then download the document.');
      setShowPayModal(false);
    } catch (err: any) {
      setPayError(err?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">{doc.document_type}</div>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{doc.document_type}</h3>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{paid ? 'Ready to download' : 'Payment required'}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-800/70">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Applicant</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{form.fullName || doc.full_name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Document number</div>
              <div className="mt-1 font-mono text-base font-black text-slate-900 dark:text-white">{doc.document_number}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Employer</div>
              <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">{job?.company || 'Employer'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Issue date</div>
              <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">{issueDate}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={handleDownload} className="flex-1 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:-translate-y-0.5 transition-all">
            {paid ? 'Download Document' : `Pay KES ${feeAmount} & Download`}
          </button>
          <button onClick={handlePrint} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200">
            Print
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">{paymentMessage || (paid ? 'Payment received. Document is ready.' : `Processing fee: KES ${feeAmount}`)}</p>
      </motion.div>

      <AnimatePresence>
        {showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => !processing && setShowPayModal(false)}>
            <motion.div initial={{ scale: 0.92, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 18 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Pay for document</h4>
                <button onClick={() => !processing && setShowPayModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="mt-5 rounded-2xl bg-brand-50 p-4 dark:bg-brand-500/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Document</div>
                    <div className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">{doc.document_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Fee</div>
                    <div className="mt-1 text-2xl font-black text-brand-700 dark:text-brand-300">KES {feeAmount}</div>
                  </div>
                </div>
              </div>

              {payError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{payError}</div>}

              <button onClick={handlePay} disabled={processing} className="mt-5 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {processing ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Processing...</> : `Pay KES ${feeAmount} via M-Pesa`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function VisaDocumentPopup({
  doc,
  job,
  form,
  passportPhoto,
}: {
  doc: TravelDocument;
  job: any;
  form: any;
  passportPhoto?: UploadedFile | null;
}) {
  const [paid] = useState(doc.status === 'paid');
  const [showPayModal, setShowPayModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  const feeAmount = 51;
  const nationality = form.nationality ? eastAfricanCountries.find((c) => c.code === form.nationality)?.name || '' : '';
  const issueDate = new Date(doc.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const expiryDate = doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const handleDownloadPDF = () => {
    if (!paid) {
      setShowPayModal(true);
      return;
    }

    const html = generateVisaPDFHTML(doc, job, form, nationality, issueDate, expiryDate, passportPhoto?.dataUrl);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Visa_${doc.country}_${doc.document_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!paid) {
      setShowPayModal(true);
      return;
    }

    const html = generateVisaPDFHTML(doc, job, form, nationality, issueDate, expiryDate, passportPhoto?.dataUrl);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 500);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setPayError('');
    setPaymentMessage('');

    try {
      const reference = `visa_tx_${Date.now()}`;
      await triggerMpesaStkPush({
        phone: form.phone || '',
        amount: feeAmount,
        description: `Visa document fee - ${doc.document_number}`,
        reference,
      });

      setPaymentMessage('STK Push sent. Enter your M-Pesa PIN, then refresh your dashboard after confirmation.');
      setShowPayModal(false);
    } catch (err: any) {
      setPayError(err?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-6"
      >
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <Stamp className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-red-700 dark:text-red-400">Your Visa Has Been Generated</span>
          </div>
        </div>

        <div className="relative mx-auto max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-slate-100 dark:text-slate-800/30 select-none pointer-events-none rotate-[-30deg]">VISA</div>
          <div className="relative bg-gradient-to-r from-red-700 via-red-800 to-red-900 px-6 py-4 flex items-center justify-between">
            <div className="text-white">
              <div className="text-[10px] uppercase tracking-widest text-red-200">Republic of Kenya</div>
              <div className="text-lg font-black">DEPARTMENT OF IMMIGRATION</div>
            </div>
            <div className="text-right text-white">
              <div className="text-[10px] uppercase tracking-widest text-red-200">Official Work Visa</div>
              <div className="text-xs font-bold">{job?.flag} OFFICIAL COPY</div>
            </div>
          </div>

          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3">
              <div>
                <div className="text-[9px] uppercase text-slate-400 font-semibold">Visa Number</div>
                <div className="font-mono text-base font-black text-slate-900">{doc.document_number}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase text-slate-400 font-semibold">Entry Type</div>
                <div className="text-sm font-bold text-slate-900">Employment / Work</div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-24 h-28 rounded-xl border-2 border-slate-300 bg-slate-100 overflow-hidden shrink-0 shadow-inner">
                {passportPhoto?.dataUrl ? (
                  <img src={passportPhoto.dataUrl} alt="Passport photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-slate-300" /></div>
                )}
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Full Name</div><div className="font-bold text-slate-900">{doc.full_name}</div></div>
                <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Nationality</div><div className="font-bold text-slate-900">{nationality || '—'}</div></div>
                <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Date of Birth</div><div className="font-bold text-slate-900">{form.dateOfBirth || '—'}</div></div>
                <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Gender</div><div className="font-bold text-slate-900 capitalize">{form.gender || '—'}</div></div>
                <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Passport / ID No.</div><div className="font-bold text-slate-900">{form.idNumber || '—'}</div></div>
                <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Phone</div><div className="font-bold text-slate-900">{form.phone || '—'}</div></div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Employer</div><div className="font-bold text-slate-900">{job?.company}</div></div>
              <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Position</div><div className="font-bold text-slate-900">{job?.title}</div></div>
              <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Workplace</div><div className="font-bold text-slate-900">{job?.city}, {doc.country}</div></div>
              <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Salary / Month</div><div className="font-bold text-slate-900">${formatJobSalary(job?.salary_min ?? 0, job?.country)}${job?.salary_max ? ` - ${formatJobSalary(job.salary_max, job?.country)}` : ''}</div></div>
              <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Processing Fee</div><div className="font-bold text-slate-900">USD ${feeAmount}</div></div>
              <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Purpose</div><div className="font-bold text-slate-900">Employment</div></div>
            </div>

            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Issue Date</div><div className="font-bold text-slate-900">{issueDate}</div></div>
              <div><div className="text-[9px] uppercase text-slate-400 font-semibold">Expiry Date</div><div className="font-bold text-slate-900">{expiryDate}</div></div>
            </div>

            <div className="flex items-end justify-between border-t-2 border-slate-200 pt-4">
              <div>
                <div className="text-[9px] uppercase text-slate-400 font-semibold">Authorized Signature</div>
                <div className="mt-1 text-2xl font-black text-slate-600" style={{ fontFamily: 'cursive' }}>J.M. Njeri</div>
                <div className="text-[10px] text-slate-500">Immigration Officer</div>
                <div className="mt-2 text-[8px] font-bold uppercase tracking-[0.2em] text-red-700">Approved • Visa Issued</div>
              </div>
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-[3px] border-red-600 flex items-center justify-center shadow-inner" style={{ borderStyle: 'double', background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(254,226,226,1) 55%, rgba(254,202,202,1) 100%)' }}>
                  <div className="text-center -rotate-12">
                    <div className="text-[7px] font-black text-red-600 uppercase">Kenya</div>
                    <div className="text-[6px] font-bold text-red-600">Immigration</div>
                    <div className="text-[6px] font-bold text-red-600">APPROVED</div>
                    <div className="text-[6px] text-red-600 mt-0.5">{new Date(doc.issue_date).toLocaleDateString('en-GB')}</div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full border-2 border-red-500/40 rotate-12" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-2 flex items-center justify-between">
            <div className="text-[9px] text-slate-400">Official visa document generated for review. Not valid for travel unless government-issued.</div>
            <div className="border-2 border-red-700 px-2 py-1 text-[8px] font-black tracking-wider text-red-700">OFFICIAL COPY</div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleDownloadPDF} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:-translate-y-0.5 transition-all">
            <Download className="w-5 h-5" /> {paid ? 'Download Visa' : 'Pay $51 & Download'}
          </button>
          <button onClick={handlePrint} disabled={!paid} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Printer className="w-5 h-5" /> Print Visa
          </button>
        </div>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">{paymentMessage || (paid ? 'Payment received! You can now download and print your visa preview.' : 'Visa preview processing fee: $51.')}</p>
      </motion.div>

      <AnimatePresence>
        {showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => !processing && setShowPayModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pay Visa Processing Fee</h3>
                <button onClick={() => !processing && setShowPayModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Visa Document</div>
                    <div className="font-mono text-xs text-slate-400">{doc.document_number}</div>
                  </div>
                  <div className="text-2xl font-extrabold text-red-600">${feeAmount}</div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-500/10">
                  <Smartphone className="w-5 h-5 text-red-600" />
                  <div className="flex-1"><div className="text-sm font-semibold text-slate-900 dark:text-white">M-Pesa</div><div className="text-xs text-slate-500">STK Push payment</div></div>
                  <Check className="w-4 h-4 text-red-600" />
                </div>
              </div>
              {payError && <p className="text-sm text-red-600 mb-3">{payError}</p>}
              <button onClick={handlePay} disabled={processing} className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {processing ? <><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Processing...</> : `Pay $${feeAmount} Now`}
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">Secure payment via M-Pesa. You will receive a confirmation once payment is processed.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PassportDocumentPopup({
  doc,
  form,
  passportPhoto,
}: {
  doc: TravelDocument;
  form: any;
  passportPhoto?: UploadedFile | null;
}) {
  const [paid] = useState(doc.status === 'paid');
  const [showPayModal, setShowPayModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const { formatPrice } = useCurrency();

  const feeAmount = 7550;
  const feeDisplay = formatPrice(feeAmount / 129);
  const issueDate = new Date(doc.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const expiryDate = doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const handleDownload = () => {
    if (!paid) {
      setShowPayModal(true);
      return;
    }

    const html = generatePassportPDFHTML(doc, form, passportPhoto?.dataUrl, issueDate, expiryDate);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Passport_${doc.document_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!paid) {
      setShowPayModal(true);
      return;
    }

    const html = generatePassportPDFHTML(doc, form, passportPhoto?.dataUrl, issueDate, expiryDate);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 500);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setPayError('');
    setPaymentMessage('');
    try {
      const reference = `passport_tx_${Date.now()}`;
      await triggerMpesaStkPush({
        phone: form.phone || '',
        amount: feeAmount,
        description: `Passport document fee - ${doc.document_number}`,
        reference,
      });

      setPaymentMessage('STK Push sent. Enter your M-Pesa PIN, then refresh your dashboard after confirmation.');
      setShowPayModal(false);
    } catch (err: any) {
      setPayError(err?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const demoTraveler = {
    surname: (form.fullName?.split(' ').slice(-1)[0] || 'NJOROGE').toUpperCase(),
    givenNames: (form.fullName?.split(' ').slice(0, -1).join(' ') || 'ACHIENG NJERI').toUpperCase(),
    nationality: getPassportCountry(form).name.toUpperCase(),
    countryCode: getPassportCountryCode(form.nationality),
    dateOfBirth: form.dateOfBirth || '—',
    sex: form.gender === 'male' ? 'M' : form.gender === 'female' ? 'F' : 'X',
    placeOfBirth: (form.address || '—').toUpperCase(),
    docNumber: doc.document_number || form.idNumber || '—',
    passportType: 'P',
    issueDate: issueDate || '14 AUG 2024',
    expiryDate: expiryDate || '13 AUG 2034',
    authority: getPassportCountry(form).authority.toUpperCase(),
    signature: (form.fullName || 'Applicant').toUpperCase(),
  };

  const mrzLine1 = `P<${demoTraveler.countryCode}<${demoTraveler.surname}<<${demoTraveler.givenNames.replace(/\s+/g, '<')}`.slice(0, 44).padEnd(44, '<');
  const mrzLine2 = `${demoTraveler.docNumber.replace(/\s/g, '').slice(0, 9).padEnd(9, '<')}<${demoTraveler.dateOfBirth.replace(/-/g, '').slice(2)}${demoTraveler.sex}<${'2501016'}${demoTraveler.countryCode}<<<<<<<<<<<<<2`;

  const visaEntries = [
    { title: 'UK Visitor Permit', country: 'London, UK', status: 'Approved', stamp: 'ENTRY', color: 'emerald' },
    { title: 'UAE Employment Visa', country: 'Dubai, UAE', status: 'Granted', stamp: 'VISA', color: 'amber' },
    { title: 'Schengen Tourist Visa', country: 'Paris, France', status: 'Stamped', stamp: 'ENTRY', color: 'sky' },
  ];

  const passportMeta = [
    { label: 'Type', value: 'P' },
    { label: 'Country code', value: demoTraveler.countryCode },
    { label: 'Booklet', value: '04' },
    { label: 'Pages', value: '32' },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
            <FileText className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Applicant Travel Document</span>
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 shadow-[0_35px_80px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,116,144,0.18),_transparent_38%)]" />
          <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_center,_rgba(15,23,42,0.15)_0%,transparent_60%)]" />

          <div className="relative p-3 sm:p-5">
            <div className="mb-4 flex items-center justify-between rounded-[20px] border border-amber-200/80 bg-gradient-to-r from-amber-800 via-amber-600 to-yellow-500 px-4 py-4 text-white shadow-inner sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/10 text-xl font-black shadow-inner">K</div>
                <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.34em] text-amber-100">{getPassportCountry(form).government}</div>
                  <div className="mt-1 text-xl font-black tracking-[0.28em] sm:text-2xl">PASSPORT</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8px] font-semibold uppercase tracking-[0.28em] text-amber-100">Biometric ePassport</div>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <div className="h-4 w-4 rounded border-2 border-white/80 bg-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.22em]">P</span>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#fffef7_0%,#ffffff_42%,#f8fafc_100%)] p-4 shadow-inner sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                  <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">APPLICANT PREVIEW</div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[0.22em] text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live Preview
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-3 shadow-inner">
                  <div className="relative mx-auto flex h-44 w-32 items-center justify-center overflow-hidden rounded-[16px] border border-slate-300 bg-gradient-to-b from-slate-200 via-slate-100 to-white shadow-inner">
                    {passportPhoto?.dataUrl ? (
                      <img src={passportPhoto.dataUrl} alt="Passport portrait" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-slate-400">
                        <User className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 rounded-[12px] border border-amber-200 bg-amber-50 p-2 text-center">
                    <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-amber-700">Chip</div>
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm border border-amber-700 bg-amber-200" />
                      <div className="h-2.5 w-2.5 rounded-sm border border-amber-700 bg-amber-100" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Surname</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.surname}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Given names</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.givenNames}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Nationality</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.nationality}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Date of birth</div>
                    <div className="mt-1 text-base font-black text-slate-900">{new Date(demoTraveler.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Sex</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.sex}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Place of birth</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.placeOfBirth}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Passport / Doc No.</div>
                    <div className="mt-1 font-mono text-sm font-black text-slate-900">{demoTraveler.docNumber}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Passport type</div>
                    <div className="mt-1 text-base font-black text-slate-900">P</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Date of issue</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.issueDate}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Date of expiry</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.expiryDate}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:col-span-2">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Issuing authority</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.authority}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Issuer code</div>
                    <div className="mt-1 text-base font-black text-slate-900">{demoTraveler.countryCode}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Holder signature</div>
                    <div className="mt-3 text-2xl font-black text-slate-600" style={{ fontFamily: 'cursive' }}>{demoTraveler.signature}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[18px] border border-slate-200 bg-slate-950 p-3 text-[10px] text-slate-200 shadow-inner">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">Machine Readable Zone</div>
                  <div className="text-[8px] uppercase tracking-[0.2em] text-slate-400">Applicant data format</div>
                </div>
                <div className="font-mono text-[10px] leading-6 sm:text-[11px]">{mrzLine1}</div>
                <div className="font-mono text-[10px] leading-6 sm:text-[11px]">{mrzLine2}</div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {passportMeta.map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center shadow-sm">
                    <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
                    <div className="mt-1 text-sm font-black text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">ePassport chip</div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl border-2 border-slate-300 bg-[radial-gradient(circle,_rgba(14,165,233,0.16),_rgba(255,255,255,1)_60%)]" />
                  <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">Secure</div>
                </div>
              </div>
            </div>

            <div className="relative mt-6 rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-inner sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">Travel record</div>
                  <div className="mt-1 text-xl font-black text-slate-900">Visa pages & travel stamps</div>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">Page 2 of 4</div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {visaEntries.map((entry, index) => (
                  <div key={index} className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_100%)] p-4 shadow-sm">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-slate-500">Visa {index + 1}</div>
                        <div className={`rounded-full border px-2 py-1 text-[7px] font-black uppercase tracking-[0.18em] ${entry.color === 'emerald' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : entry.color === 'amber' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-sky-300 bg-sky-50 text-sky-700'}`}>
                          {entry.status}
                        </div>
                      </div>
                      <div className="mt-4 text-lg font-black text-slate-900">{entry.title}</div>
                      <div className="mt-1 text-sm font-medium text-slate-600">{entry.country}</div>

                      <div className="mt-4 grid gap-2 text-[10px] text-slate-600">
                        <div className="flex justify-between border-b border-slate-200 pb-1"><span>Issued</span><span className="font-bold text-slate-800">14 Aug 2024</span></div>
                        <div className="flex justify-between border-b border-slate-200 pb-1"><span>Expires</span><span className="font-bold text-slate-800">14 Aug 2028</span></div>
                        <div className="flex justify-between"><span>Code</span><span className="font-bold text-slate-800">{index === 0 ? 'UKV' : index === 1 ? 'UAE' : 'SCH'}</span></div>
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Permit no.</div>
                        <div className="font-mono text-[10px] font-black text-slate-800">TP{index + 1012}</div>
                      </div>

                      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-center">
                        <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">Verification</div>
                        <div className="mt-1 text-[12px] font-black text-slate-800">{entry.stamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Travel record examples</div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Nairobi', code: 'KEN', color: 'text-emerald-700 border-emerald-400 bg-emerald-50' },
                    { label: 'Dubai', code: 'UAE', color: 'text-amber-700 border-amber-400 bg-amber-50' },
                    { label: 'London', code: 'GBR', color: 'text-sky-700 border-sky-400 bg-sky-50' },
                  ].map((stamp) => (
                    <div key={stamp.label} className="relative flex min-h-[110px] items-center justify-center overflow-hidden rounded-[18px] border border-slate-200 bg-white">
                      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                      <div className="relative flex h-20 w-20 rotate-[-12deg] items-center justify-center rounded-full border-[3px] border-dashed border-slate-400 bg-white text-center">
                        <div className={`rounded-full border-2 px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] ${stamp.color}`}>
                          {stamp.code}
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">{stamp.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={handleDownload} className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg transition hover:-translate-y-0.5">
                <span className="inline-flex items-center gap-2"><Download className="h-4 w-4" /> {paid ? 'Download Passport' : `Pay ${feeDisplay} & Download`}</span>
              </button>
              <button onClick={handlePrint} disabled={!paid} className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
                <span className="inline-flex items-center gap-2"><Printer className="h-4 w-4" /> Print</span>
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
              {paymentMessage || (paid ? 'Payment received — applicant passport preview ready for download' : `Passport download fee: ${feeDisplay}`)}
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => !processing && setShowPayModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">Pay Passport Fee</h3><button onClick={() => !processing && setShowPayModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-4">
                <div className="flex items-center justify-between"><div><div className="text-sm text-slate-600 dark:text-slate-300">Passport Document</div><div className="font-mono text-xs text-slate-400">{doc.document_number}</div></div><div className="text-right"><div className="text-2xl font-extrabold text-amber-600">{feeDisplay}</div><div className="text-[10px] text-slate-500">KES 7,550 base fee</div></div></div>
              </div>
              {payError && <p className="text-sm text-red-600 mb-3">{payError}</p>}
              <button onClick={handlePay} disabled={processing} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60">{processing ? <><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Processing...</> : `Pay ${feeDisplay} & Download`}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Application() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { country, formatPrice } = useCurrency();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [job, setJob] = useState<any>(null);
  const [generatedDocs, setGeneratedDocs] = useState<TravelDocument[]>([]);
  const [reviewProgress, setReviewProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passportPhotoInputRef = useRef<HTMLInputElement>(null);
  const isKenyaJob = String(job?.country || '').toLowerCase().includes('kenya');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    currentCountry: country.code,
    gender: '',
    dateOfBirth: '',
    idNumber: '',
    address: '',
    education: '',
    experience: '',
    coverLetter: '',
    emergencyContact: '',
    emergencyPhone: '',
    preferredCurrency: country.code,
  });
  const [phoneCountry, setPhoneCountry] = useState(country.code);
  const [emergencyPhoneCountry, setEmergencyPhoneCountry] = useState(country.code);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [passportPhoto, setPassportPhoto] = useState<UploadedFile | null>(null);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!id) return;

    const localJob = kenyaJobs.find((entry) => entry.id === id);
    if (localJob) {
      setJob(localJob);
      return;
    }

    supabase.from('jobs').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      setJob(data);
    });
  }, [id]);

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || profile.full_name || '',
      email: prev.email || profile.email || user?.email || '',
      phone: prev.phone || profile.phone || user?.phone || '',
      currentCountry: prev.currentCountry || profile.country || country.code,
      nationality: prev.nationality || profile.country || '',
    }));
  }, [profile, user, country.code]);

  useEffect(() => {
    if (authLoading) return;
    if (!user && phase === 'form') {
      navigate('/login?redirect=' + encodeURIComponent('/apply/' + id));
    }
  }, [authLoading, user, phase, id, navigate]);

  const canProceed = () => {
    if (step === 0) {
      return !!(
        form.fullName &&
        form.email &&
        isValidPhoneNumber(form.phone) &&
        form.nationality &&
        form.gender &&
        form.dateOfBirth &&
        isValidIdNumber(form.idNumber)
      );
    }
    if (step === 1) {
      return !!(form.address && form.education && form.experience && form.emergencyContact && form.emergencyPhone);
    }
    return true;
  };

  const handlePassportPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setPassportPhoto({ name: file.name, size: file.size, type: file.type, dataUrl });
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const mapped = await Promise.all(
      selectedFiles.map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: await readFileAsDataUrl(file),
      })),
    );
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setPhase('submitting');
    setErrorMsg('');

    if (!user?.id) {
      setErrorMsg('Please sign in before submitting your application.');
      setPhase('error');
      return;
    }

    if (!isValidPhoneNumber(form.phone)) {
      setErrorMsg('Phone number must be 10 digits without the country code.');
      setPhase('error');
      return;
    }

    if (!isValidIdNumber(form.idNumber)) {
      setErrorMsg('ID number must be exactly 8 digits. Please enter a valid ID.');
      setPhase('error');
      return;
    }

    try {
      const basePayload = {
        user_id: user.id,
        full_name: form.fullName || profile?.full_name || 'Applicant',
        country: isKenyaJob ? 'Kenya' : (form.currentCountry || country.code),
        job_id: id || null,
        issue_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const payload = isKenyaJob
        ? [
            { ...basePayload, document_type: 'Good Conduct', document_number: `GC-${Date.now().toString().slice(-8)}`, status: 'pending_payment', fee_amount: 2500, email: form.email || user.email || profile?.email || null, phone: form.phone || profile?.phone || null },
            { ...basePayload, document_type: 'Police Clearance', document_number: `PC-${Date.now().toString().slice(-8)}`, status: 'pending_payment', fee_amount: 3000, email: form.email || user.email || profile?.email || null, phone: form.phone || profile?.phone || null },
          ]
        : [{ ...basePayload, document_type: 'Visa', document_number: `KEN-${Date.now().toString().slice(-8)}`, status: 'generated', fee_amount: 15000 }];

      const { data, error } = await supabase.from('travel_documents').insert(payload).select();
      if (error) throw error;

      const docs = Array.isArray(data) ? data : [data].filter(Boolean) as TravelDocument[];
      setPhase('reviewing');
      setReviewProgress(3);
      const processingDuration = 45_000;
      const processingStartedAt = Date.now();

      while (Date.now() - processingStartedAt < processingDuration) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const elapsed = Date.now() - processingStartedAt;
        setReviewProgress(Math.min(98, 3 + Math.round((elapsed / processingDuration) * 95)));
      }

      setGeneratedDocs(docs);
      setPhase('accepted');
      setReviewProgress(100);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not generate documents. Please try again.');
      setPhase('error');
    }
  };

  const renderGeneratedDocuments = () => {
    if (!generatedDocs.length) return null;

    return (
      <div className="space-y-6">
        {generatedDocs.map((doc) => (
          <div key={doc.id} className="space-y-6">
            {isKenyaJob ? (
              <KenyaDocumentPopup doc={doc} job={job} form={form} />
            ) : (
              <>
                <VisaDocumentPopup doc={doc} job={job} form={form} passportPhoto={passportPhoto} />
                <PassportDocumentPopup doc={doc} form={form} passportPhoto={passportPhoto} />
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wide">
              <Briefcase className="w-3.5 h-3.5" /> Global Connect
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight">Application & Document Generation</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} disabled={phase === 'submitting' || phase === 'reviewing'} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:pointer-events-none disabled:opacity-40">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8">
            {phase === 'accepted' ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Application submitted successfully</h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">Documents are ready to download.</p>
                  </div>
                </div>

                {renderGeneratedDocuments()}
              </div>
            ) : phase === 'reviewing' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[420px] flex items-center justify-center"
              >
                <div className="w-full max-w-xl text-center">
                  <div className="relative mx-auto mb-8 h-28 w-28">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-4 border-brand-100 border-t-brand-600"
                    />
                    <div className="absolute inset-4 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                      <FileText className="h-9 w-9 text-brand-600 animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your documents are being processed</h2>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Please do not close this page. We are checking your application and preparing your official documents.</p>
                  <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 via-cyan-500 to-emerald-500"
                      animate={{ width: `${reviewProgress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Application review in progress</span>
                    <span>{reviewProgress}%</span>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {['Checking details', 'Preparing documents', 'Finalizing files'].map((label, index) => (
                      <motion.div
                        key={label}
                        animate={{ opacity: [0.45, 1, 0.45] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.25 }}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-3"
                      >
                        {label}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span>Personal Details</span>
                    <span>Documents</span>
                    <span>Review</span>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500" style={{ width: `${(step + 1) / 3 * 100}%` }} />
                  </div>
                </div>

                {step === 0 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><User className="w-5 h-5 text-brand-600" /> Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Full Name" value={form.fullName} onChange={(v) => updateForm('fullName', v)} placeholder="Jane Doe" />
                      <Field label="Email Address" type="email" value={form.email} onChange={(v) => updateForm('email', v)} placeholder="jane@example.com" />
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Phone Number</label>
                        <div className="flex gap-2">
                          <select value={phoneCountry} onChange={(e) => setPhoneCountry(e.target.value)} className="w-28 px-2 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            {eastAfricanCountries.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.dialCode}</option>)}
                          </select>
                          <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', normalizePhoneNumber(e.target.value))} placeholder="0700000000" className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Nationality</label>
                        <select value={form.nationality} onChange={(e) => updateForm('nationality', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <option value="">Select country</option>
                          {eastAfricanCountries.map((country) => (
                            <option key={country.code} value={country.code}>{country.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Gender</label>
                        <select value={form.gender} onChange={(e) => updateForm('gender', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <option value="">Select</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => updateForm('dateOfBirth', v)} />
                      <Field label="ID / Passport Number" value={form.idNumber} onChange={(v) => updateForm('idNumber', normalizeIdNumber(v))} placeholder="12345678" />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-brand-600" /> Location & Employment</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Current Address" value={form.address} onChange={(v) => updateForm('address', v)} placeholder="Kampala, Uganda" />
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Education Level</label>
                        <select value={form.education} onChange={(e) => updateForm('education', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <option value="">Select education</option><option>Primary school</option><option>Secondary school</option><option>Certificate</option><option>Diploma</option><option>Bachelor's degree</option><option>Master's degree</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Work Experience</label>
                        <select value={form.experience} onChange={(e) => updateForm('experience', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                          <option value="">Select experience</option><option>No experience</option><option>Less than 1 year</option><option>1-2 years</option><option>3-5 years</option><option>6-10 years</option><option>More than 10 years</option>
                        </select>
                      </div>
                      <Field label="Emergency Contact Name" value={form.emergencyContact} onChange={(v) => updateForm('emergencyContact', v)} placeholder="Jane Doe" />
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Emergency Contact Phone</label>
                        <div className="flex gap-2">
                          <select value={emergencyPhoneCountry} onChange={(e) => setEmergencyPhoneCountry(e.target.value)} className="w-28 px-2 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            {eastAfricanCountries.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.dialCode}</option>)}
                          </select>
                          <input type="tel" value={form.emergencyPhone} onChange={(e) => updateForm('emergencyPhone', e.target.value)} placeholder="0700000000" className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-brand-500/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-5 h-5 text-brand-600" /> Documents & Review</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">Upload Passport Photo</label>
                        <div onClick={() => passportPhotoInputRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-brand-400 dark:hover:border-brand-500/40 transition-colors">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload passport photo</p>
                          <p className="text-xs text-slate-400 mt-1">JPG/PNG up to 2MB</p>
                          <input ref={passportPhotoInputRef} type="file" className="hidden" onChange={handlePassportPhotoUpload} accept=".jpg,.jpeg,.png" />
                        </div>
                        {passportPhoto && (
                          <div className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100">
                              <img src={passportPhoto.dataUrl} alt="Applicant passport" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{passportPhoto.name}</div>
                              <div className="text-xs text-slate-400">{(passportPhoto.size / 1024).toFixed(1)} KB</div>
                            </div>
                            <button onClick={() => setPassportPhoto(null)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">Upload Documents (CV, Certificates, ID, Passport)</label>
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 dark:hover:border-brand-500/40 transition-colors">
                          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload files</p>
                          <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DOC up to 5MB each</p>
                          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                        </div>
                        {files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {files.map((file, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <FileText className="w-5 h-5 text-brand-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</div>
                                  <div className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</div>
                                </div>
                                <button onClick={() => removeFile(i)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">Cover Letter (optional)</label>
                      <textarea value={form.coverLetter} onChange={(e) => updateForm('coverLetter', e.target.value)} rows={4} placeholder="Tell the employer why you're a great fit..." className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 ring-brand-500/50 resize-none" />
                    </div>

                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Application Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <div><span className="text-slate-400">Name:</span> {form.fullName || '—'}</div>
                        <div><span className="text-slate-400">Email:</span> {form.email || '—'}</div>
                        <div><span className="text-slate-400">Phone:</span> {form.phone || '—'}</div>
                        <div><span className="text-slate-400">Nationality:</span> {form.nationality ? eastAfricanCountries.find((c) => c.code === form.nationality)?.name : '—'}</div>
                        <div><span className="text-slate-400">Country:</span> {eastAfricanCountries.find((c) => c.code === form.currentCountry)?.name || '—'}</div>
                        <div><span className="text-slate-400">Education:</span> {form.education || '—'}</div>
                        <div><span className="text-slate-400">Documents:</span> {files.length} file(s)</div>
                        <div><span className="text-slate-400">Currency:</span> {eastAfricanCountries.find((c) => c.code === form.preferredCurrency)?.currency || '—'}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                      <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> What happens after you submit?
                      </h4>
                      <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1.5">
                        <li className="flex items-start gap-2"><Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" /> You'll receive a confirmation email immediately</li>
                        <li className="flex items-start gap-2"><Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Your application goes through an automated review process</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" /> You'll receive an acceptance email once approved</li>
                        <li className="flex items-start gap-2"><Plane className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Your visa & passport documents are auto-generated</li>
                      </ul>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{errorMsg}</div>
                )}

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  {step < 2 ? (
                    <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={phase === 'submitting' || phase === 'reviewing'} className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl shadow-lg shadow-green-500/30 hover:-translate-y-0.5 transition-all disabled:cursor-not-allowed disabled:opacity-60">
                      {phase === 'submitting' ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Check className="w-4 h-4" /> Submit Application</>}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {phase === 'reviewing' && (
          <div className="mt-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
              <span>Reviewing application</span>
              <span>{reviewProgress}%</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-300" style={{ width: `${reviewProgress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 flex items-center gap-3">
            <Wallet className="w-5 h-5 text-green-600" />
            <div><div className="font-bold">Visa Fee</div><div className="text-slate-500">$150</div></div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 flex items-center gap-3">
            <Wallet className="w-5 h-5 text-amber-600" />
            <div><div className="font-bold">Passport Fee</div><div className="text-slate-500">{formatPrice(7550 / 129)}</div></div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 flex items-center gap-3">
            <Plane className="w-5 h-5 text-brand-600" />
            <div><div className="font-bold">Travel Docs</div><div className="text-slate-500">Applicant preview + print</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

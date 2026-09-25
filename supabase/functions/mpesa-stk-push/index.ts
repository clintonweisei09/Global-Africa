import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const tillNumber = Deno.env.get("MPESA_TILL_NUMBER") || "1712962";

interface StkPushRequest {
  phone: string;
  amount: number;
  description: string;
  reference: string;
}

const jsonResponse = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
);

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
};

const getAccessToken = async () => {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
  const environment = Deno.env.get("MPESA_ENVIRONMENT") || "sandbox";
  const baseUrl = environment === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials are not configured.");
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.errorMessage || "Unable to authenticate with M-Pesa.");
  }

  return { accessToken: data.access_token as string, baseUrl };
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");
    if (!supabaseUrl || !serviceRoleKey || !authHeader) {
      return jsonResponse({ error: "Authentication is required." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return jsonResponse({ error: "Authentication is required." }, 401);

    const payload = await req.json() as StkPushRequest;
    const phone = formatPhone(payload.phone || "");
    const amount = Math.round(Number(payload.amount));
    if (!/^254[17]\d{8}$/.test(phone)) return jsonResponse({ error: "Enter a valid Kenyan M-Pesa phone number." }, 400);
    if (!Number.isFinite(amount) || amount < 1) return jsonResponse({ error: "Payment amount must be greater than zero." }, 400);
    if (!payload.reference || !payload.description) return jsonResponse({ error: "Payment reference and description are required." }, 400);

    const passkey = Deno.env.get("MPESA_PASSKEY");
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL");
    if (!passkey || !callbackUrl) throw new Error("M-Pesa passkey or callback URL is not configured.");

    const { accessToken, baseUrl } = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const password = btoa(`${tillNumber}${passkey}${timestamp}`);
    const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: tillNumber,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: tillNumber,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: payload.reference.slice(0, 12),
        TransactionDesc: payload.description.slice(0, 20),
      }),
    });
    const result = await response.json();

    const status = response.ok && result.ResponseCode === "0" ? "pending" : "failed";
    const checkoutRequestId = result.CheckoutRequestID || "";
    const { error: transactionError } = await admin.from("payment_transactions").insert({
      user_id: user.id,
      user_email: user.email || "",
      amount,
      currency: "KES",
      gateway: "mpesa",
      description: `${payload.description} | Till ${tillNumber} | STK push to ${phone}`,
      status,
      reference: `${payload.reference}:${checkoutRequestId}`,
    });
    if (transactionError) console.error("Payment transaction log error:", transactionError);

    if (!response.ok || result.ResponseCode !== "0") {
      return jsonResponse({ error: result.errorMessage || result.ResponseDescription || "M-Pesa could not start the STK push." }, 502);
    }

    return jsonResponse({
      success: true,
      checkoutRequestId: result.CheckoutRequestID,
      customerMessage: result.CustomerMessage,
      tillNumber,
    });
  } catch (error) {
    console.error("M-Pesa STK push error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unable to start M-Pesa payment." }, 500);
  }
});
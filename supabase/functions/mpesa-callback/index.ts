import { createClient } from "npm:@supabase/supabase-js@2";

const jsonHeaders = { "Content-Type": "application/json" };

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders });

  try {
    const body = await req.json();
    const callback = body?.Body?.stkCallback;
    if (!callback?.CheckoutRequestID) return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), { headers: jsonHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const success = Number(callback.ResultCode) === 0;
    const description = success ? "M-Pesa payment completed" : `M-Pesa payment failed: ${callback.ResultDesc || "Unknown error"}`;

    const transactionQuery = supabase
      .from("payment_transactions")
      .select("id, user_id, description, reference")
      .eq("status", "pending")
      .ilike("reference", `%${callback.CheckoutRequestID}%`)
      .order("created_at", { ascending: false })
      .limit(1);
    const { data: transactions } = await transactionQuery;
    const transaction = transactions?.[0];

    if (transaction) {
      await supabase.from("payment_transactions").update({
        status: success ? "completed" : "failed",
        description: `${transaction.description} | ${description} | Checkout ${callback.CheckoutRequestID}`,
        reference: `${transaction.reference}:${callback.CheckoutRequestID}`,
      }).eq("id", transaction.id);

      if (success) {
        const documentNumber = transaction.description.split(" - ")[1]?.split(" | ")[0];
        if (documentNumber) {
          await supabase.from("travel_documents").update({
            status: "paid",
            paid_at: new Date().toISOString(),
          }).eq("user_id", transaction.user_id).eq("document_number", documentNumber);
          await supabase.from("payments").update({
            status: "completed",
            method: "mpesa",
          }).eq("user_id", transaction.user_id).eq("status", "pending").ilike("description", `%${documentNumber}%`);
        }
      }
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), { headers: jsonHeaders });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), { headers: jsonHeaders });
  }
});
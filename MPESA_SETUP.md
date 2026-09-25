# M-Pesa STK Push setup

The document payment flow uses two Supabase Edge Functions:

- `mpesa-stk-push` starts the Daraja STK prompt.
- `mpesa-callback` receives Safaricom confirmation and unlocks the document.

Set these Supabase Function secrets before deploying:

```text
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_PASSKEY=your_lipa_na_mpesa_online_passkey
MPESA_TILL_NUMBER=1712962
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/mpesa-callback
```

Deploy with the Supabase CLI:

```bash
supabase functions deploy mpesa-stk-push
supabase functions deploy mpesa-callback --no-verify-jwt
supabase secrets set MPESA_CONSUMER_KEY=... MPESA_CONSUMER_SECRET=... MPESA_PASSKEY=... MPESA_TILL_NUMBER=1712962 MPESA_ENVIRONMENT=production MPESA_CALLBACK_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/mpesa-callback
```

Use Daraja sandbox credentials and `MPESA_ENVIRONMENT=sandbox` while testing. The till must be enabled for the Daraja Lipa na M-Pesa Online product; a normal till number alone is not enough to create STK pushes.

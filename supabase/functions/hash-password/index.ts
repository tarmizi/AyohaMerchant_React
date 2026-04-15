import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string" || password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use SubtleCrypto SHA-256 for hashing (sufficient for internal portal users)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = new Uint8Array(hashBuffer);
    const hash = new TextDecoder().decode(hexEncode(hashArray));

    return new Response(
      JSON.stringify({ hash }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to hash password" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Stripe price IDs to product keys
const PRICE_TO_PRODUCT_KEY: Record<string, string> = {
  'price_1SjGMKPhXS410TO5XQcZm9fZ': 'basic',
  'price_1SjGMYPhXS410TO5bGu1kSSZ': 'performance',
  'price_1SjGMhPhXS410TO59WKiE81b': 'elite',
  'price_1SqEGAPhXS410TO5ZIx2g0RZ': 'longevity_beta',
  'price_1SqEGCPhXS410TO5iCsokNpV': 'transfer_beta',
  'price_1SqEGEPhXS410TO5DeHOuqVH': 'small_org_license',
  'price_1SqEGIPhXS410TO5JUNSsTCq': 'org_quick_start',
  'price_1SqEGGPhXS410TO52G0rlmEk': 'velocity_12week',
  'price_1SqEW4PhXS410TO51a1fzsw1': 'velocity_accelerator',
  'price_1SqEGKPhXS410TO5JALh4Imp': 'velo_check',
  'price_1SqEGMPhXS410TO5PNwPNJOe': 'recruitment_audit',
  'price_1SqEGOPhXS410TO5XtSbPx0v': 'certified_coach',
  'price_1SqEW6PhXS410TO5GbLVm4te': 'velocity_max_pack',
  'price_1SqEW8PhXS410TO5A7WuQgc6': 'recruiting_edge_pack',
  'price_1SqEW9PhXS410TO5detPNFap': 'coach_authority_pack',
};

// Map product keys to course IDs they grant access to
const PRODUCT_TO_COURSES: Record<string, string[]> = {
  'velocity_12week': ['velocity-system'],
  'velocity_accelerator': ['velocity-system'], // Access to velocity content
  'longevity_beta': ['arm-health-workload'],
  'transfer_beta': ['transfer-system'],
  'velocity_max_pack': ['velocity-system', 'speed-agility'],
  'basic': ['speed-agility'],
  'performance': ['velocity-system', 'strength-conditioning', 'speed-agility', 'arm-health-workload'],
  'elite': ['velocity-system', 'strength-conditioning', 'speed-agility', 'arm-health-workload', 'strength-power-system', 'organizational-development'],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role to insert purchases
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error("User not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        verified: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if purchase already recorded
    const { data: existingPurchase } = await supabaseAdmin
      .from('user_purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingPurchase) {
      return new Response(JSON.stringify({ 
        verified: true, 
        message: "Purchase already recorded",
        alreadyProcessed: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get product info from line items
    const lineItems = session.line_items?.data || [];
    const purchasedProducts: string[] = [];
    const coursesToEnroll: string[] = [];

    for (const item of lineItems) {
      const priceId = item.price?.id;
      if (priceId && PRICE_TO_PRODUCT_KEY[priceId]) {
        const productKey = PRICE_TO_PRODUCT_KEY[priceId];
        purchasedProducts.push(productKey);
        
        // Get courses this product grants access to
        const courses = PRODUCT_TO_COURSES[productKey] || [];
        coursesToEnroll.push(...courses);

        // Record the purchase
        await supabaseAdmin
          .from('user_purchases')
          .insert({
            user_id: user.id,
            product_key: productKey,
            stripe_session_id: sessionId,
            stripe_payment_intent_id: typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent?.id,
            amount_cents: item.amount_total || 0,
            status: 'completed',
          });
      }
    }

    // Auto-enroll user in purchased courses
    const uniqueCourses = [...new Set(coursesToEnroll)];
    for (const courseId of uniqueCourses) {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabaseAdmin
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (!existingEnrollment) {
        await supabaseAdmin
          .from('course_enrollments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            status: 'active',
          });
      }
    }

    return new Response(JSON.stringify({ 
      verified: true,
      products: purchasedProducts,
      coursesUnlocked: uniqueCourses,
      message: "Purchase verified and access granted!",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Verify purchase error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Explicit OPTIONS handler for CORS preflight
app.options("/*", (c) => {
  return c.text("", 204);
});

// Health check endpoint
app.get("/make-server-d427d5bf/health", (c) => {
  return c.json({ status: "ok" });
});

// Submit questionnaire responses
app.post("/make-server-d427d5bf/submit-questionnaire", async (c) => {
  try {
    const body = await c.req.json();
    const { responses, timestamp } = body;

    if (!responses || !Array.isArray(responses)) {
      console.log("Error submitting questionnaire: Invalid responses format");
      return c.json({ error: "Invalid responses format" }, 400);
    }

    // Calculate PHQ-9 score
    const score = responses.reduce((sum, val) => sum + val, 0);

    // Generate unique ID
    const id = crypto.randomUUID();
    const key = `response:${id}`;

    // Store response
    await kv.set(key, {
      id,
      responses,
      score,
      timestamp: timestamp || new Date().toISOString(),
    });

    console.log(`Questionnaire submitted successfully: ID ${id}, Score ${score}`);

    return c.json({
      success: true,
      id,
      score
    });
  } catch (error) {
    console.log(`Error submitting questionnaire: ${error.message}`);
    return c.json({ error: "Failed to submit questionnaire", details: error.message }, 500);
  }
});

// Admin signup
app.post("/make-server-d427d5bf/signup", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    );

    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      console.log("Error during signup: Missing email or password");
      return c.json({ error: "Email and password are required" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || 'Admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error during signup for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${email}`);
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Error during signup: ${error.message}`);
    return c.json({ error: "Failed to create user", details: error.message }, 500);
  }
});

// Get statistics (protected route)
app.get("/make-server-d427d5bf/statistics", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      console.log(`Unauthorized access to statistics: ${error?.message || 'No user found'}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all responses
    const responses = await kv.getByPrefix("response:");

    if (!responses || responses.length === 0) {
      return c.json({
        total: 0,
        averageScore: 0,
        riskDistribution: {
          minimal: 0,
          mild: 0,
          moderate: 0,
          moderatelySevere: 0,
          severe: 0
        }
      });
    }

    // Calculate statistics
    const total = responses.length;
    const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = total > 0 ? totalScore / total : 0;

    // Risk distribution based on PHQ-9 scoring
    const riskDistribution = {
      minimal: 0,          // 0-4
      mild: 0,             // 5-9
      moderate: 0,         // 10-14
      moderatelySevere: 0, // 15-19
      severe: 0            // 20-27
    };

    responses.forEach(r => {
      const score = r.score || 0;
      if (score <= 4) riskDistribution.minimal++;
      else if (score <= 9) riskDistribution.mild++;
      else if (score <= 14) riskDistribution.moderate++;
      else if (score <= 19) riskDistribution.moderatelySevere++;
      else riskDistribution.severe++;
    });

    console.log(`Statistics retrieved successfully: ${total} responses`);

    return c.json({
      total,
      averageScore: Math.round(averageScore * 10) / 10,
      riskDistribution
    });
  } catch (error) {
    console.log(`Error retrieving statistics: ${error.message}`);
    return c.json({ error: "Failed to get statistics", details: error.message }, 500);
  }
});

Deno.serve(app.fetch);
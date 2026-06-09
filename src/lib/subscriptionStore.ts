import { supabase } from "./supabase";

export type PlanType = "free" | "pro" | "premium" | "creator" | "advance";

export interface UsageStats {
  chatCount: number;
  codingCount: number;
  imageCount: number;
  videoCount: number;
  dailyResetDate: string;
  monthlyResetDate: string;
}

export interface SubscriptionState {
  plan: PlanType;
  usage: UsageStats;
  isActive: boolean;
  expiryDate?: string;
}

export const PLAN_LIMITS = {
  free: {
    name: "Free",
    chat: 30, // daily
    coding: 5, // daily
    image: 10, // monthly
    video: 2, // monthly
    price: 0,
  },
  pro: {
    name: "Pro",
    chat: Infinity,
    coding: Infinity,
    image: 100,
    video: 10,
    price: 599,
  },
  premium: {
    name: "Premium",
    chat: Infinity,
    coding: Infinity,
    image: 250,
    video: 25,
    price: 999,
  },
  creator: {
    name: "Creator",
    chat: Infinity,
    coding: Infinity,
    image: 500,
    video: 50,
    price: 1999,
  },
  advance: {
    name: "Advance",
    chat: Infinity,
    coding: Infinity,
    image: 2000,
    video: 200,
    price: 4999,
  },
};

const defaultUsage: UsageStats = {
  chatCount: 0,
  codingCount: 0,
  imageCount: 0,
  videoCount: 0,
  dailyResetDate: new Date().toISOString(),
  monthlyResetDate: new Date().toISOString(),
};

const defaultState: SubscriptionState = {
  plan: "free",
  usage: defaultUsage,
  isActive: true,
};

let syncTimeout: any;

async function syncToSupabase(state: SubscriptionState) {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || "anonymous-user";

      // Best effort sync - DO NOT sync plan from frontend to prevent tampering
      const { data: existing } = await supabase.from("user_subscriptions").select("plan").eq("user_id", userId).single();
      
      if (existing) {
        await supabase.from("user_subscriptions").update({
          chat_count: state.usage.chatCount,
          coding_count: state.usage.codingCount,
          image_count: state.usage.imageCount,
          video_count: state.usage.videoCount,
          daily_reset_date: state.usage.dailyResetDate,
          monthly_reset_date: state.usage.monthlyResetDate,
          expiry_date: state.expiryDate || null,
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId);
      } else {
        await supabase.from("user_subscriptions").insert({
          user_id: userId,
          plan: "free",
          chat_count: state.usage.chatCount,
          coding_count: state.usage.codingCount,
          image_count: state.usage.imageCount,
          video_count: state.usage.videoCount,
          daily_reset_date: state.usage.dailyResetDate,
          monthly_reset_date: state.usage.monthlyResetDate,
          expiry_date: state.expiryDate || null,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Ignore errors for unconfigured backend
    }
  }, 1000);
}

export async function fetchSubscriptionFromSupabase() {
  try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || "anonymous-user";
      const { data, error } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).single();
      
      if (data && !error) {
         const state: SubscriptionState = {
            plan: data.plan as PlanType,
            usage: {
              chatCount: data.chat_count || 0,
              codingCount: data.coding_count || 0,
              imageCount: data.image_count || 0,
              videoCount: data.video_count || 0,
              dailyResetDate: data.daily_reset_date || new Date().toISOString(),
              monthlyResetDate: data.monthly_reset_date || new Date().toISOString(),
            },
            isActive: true,
            expiryDate: data.expiry_date || undefined,
         };
         localStorage.setItem("jerox_subscription", JSON.stringify(state));
      }
  } catch(e) { }
}

export function getSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem("jerox_subscription");
    if (!raw) return defaultState;
    const state = JSON.parse(raw) as SubscriptionState;
    
    // Safety check for old stats
    if (state.usage.codingCount === undefined) state.usage.codingCount = 0;
    if (!state.usage.dailyResetDate) state.usage.dailyResetDate = new Date().toISOString();
    if (!state.usage.monthlyResetDate) state.usage.monthlyResetDate = (state.usage as any).lastResetDate || new Date().toISOString();

    const now = new Date();
    let needsSave = false;

    // Check expiry
    if (state.plan !== "free" && state.expiryDate) {
      const expiry = new Date(state.expiryDate);
      if (now > expiry) {
        state.plan = "free";
        state.expiryDate = undefined;
        // Reset limits based on free plan
        state.usage.imageCount = 0;
        state.usage.videoCount = 0;
        state.usage.monthlyResetDate = now.toISOString();
        needsSave = true;
      }
    }
    
    // Check daily resets (Chat & Coding)
    const lastDaily = new Date(state.usage.dailyResetDate);
    const msInDay = 24 * 60 * 60 * 1000;
    if (now.getTime() - lastDaily.getTime() >= msInDay) {
      state.usage.chatCount = 0;
      state.usage.codingCount = 0;
      state.usage.dailyResetDate = now.toISOString();
      needsSave = true;
    }

    // Check monthly resets (Image & Video)
    const lastMonthly = new Date(state.usage.monthlyResetDate);
    if (now.getMonth() !== lastMonthly.getMonth() || now.getFullYear() !== lastMonthly.getFullYear()) {
      state.usage.imageCount = 0;
      state.usage.videoCount = 0;
      state.usage.monthlyResetDate = now.toISOString();
      needsSave = true;
    }
    
    if (needsSave) {
      saveSubscription(state);
    }
    
    return state;
  } catch (e) {
    return defaultState;
  }
}

export function saveSubscription(state: SubscriptionState) {
  localStorage.setItem("jerox_subscription", JSON.stringify(state));
  syncToSupabase(state);
}

export function trackUsage(type: "chat" | "coding" | "image" | "video") {
  const state = getSubscription();
  if (type === "chat") state.usage.chatCount += 1;
  if (type === "coding") state.usage.codingCount += 1;
  if (type === "image") state.usage.imageCount += 1;
  if (type === "video") state.usage.videoCount += 1;
  saveSubscription(state);
}

export function canUse(type: "chat" | "coding" | "image" | "video"): boolean {
  const state = getSubscription();
  const limits = PLAN_LIMITS[state.plan];
  
  if (defaultState.plan === "free" && state.plan === undefined) state.plan = "free"; // fallback
  
  if (type === "chat") return state.usage.chatCount < limits.chat;
  if (type === "coding") return state.usage.codingCount < limits.coding;
  if (type === "image") return state.usage.imageCount < limits.image;
  if (type === "video") return state.usage.videoCount < limits.video;
  return false;
}

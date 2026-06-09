import React from "react";
import { Check } from "lucide-react";
import { getSubscription, PLAN_LIMITS } from "../lib/subscriptionStore";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useAuth } from "../lib/useAuth";
import { useAuthModal } from "../lib/authModalStore";

const PLANS = [
  { name: "Free", price: 0, limit: "10 Images, 2 Videos", features: ["30 Chats / day", "5 Coding Requests / day", "Standard Generation Speed", "Basic Support"] },
  { name: "Pro", price: 599, limit: "100 Images, 10 Videos", features: ["Unlimited Chat (Fair Usage)", "Unlimited Coding (Fair Usage)", "Standard Processing"] },
  { name: "Premium", price: 999, limit: "250 Images, 25 Videos", popular: true, features: ["Unlimited Chat", "Unlimited Coding", "Faster Processing"] },
  { name: "Creator", price: 1999, limit: "500 Images, 50 Videos", features: ["Unlimited Chat", "Unlimited Coding", "Priority Queue"] },
  { name: "Advance", price: 4999, limit: "2000 Images, 200 Videos", features: ["Unlimited Chat", "Unlimited Coding", "Highest Priority Queue & Early Access"] },
];

export default function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLimit = new URLSearchParams(location.search).get("limit") === "true";
  
  const state = getSubscription();
  const currentPlan = PLAN_LIMITS[state.plan as keyof typeof PLAN_LIMITS];
  const { user } = useAuth();
  const { openModal } = useAuthModal();

  const getRemainingDays = () => {
    if (!state.expiryDate || state.plan === "free") return null;
    const diff = new Date(state.expiryDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  const remainingDays = getRemainingDays();

  const handleSubscribe = async (planName: string, price: number) => {
    if (!user) {
      openModal(() => handleSubscribe(planName, price));
      return;
    }
    if (price === 0) {
      if (state.plan !== 'free') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;
          
          await fetch("/api/payment/verify-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: "free", plan: "free", userId })
          });
          
          const s = getSubscription();
          s.plan = 'free';
          localStorage.setItem("jerox_subscription", JSON.stringify(s));
          window.location.reload();
        } catch(e) {}
      }
      return;
    }
  
    // This is where Razorpay Checkout would be initialized with razorpay.com/v1/checkout.js
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, plan: planName }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Payment system is not configured yet.");
        return;
      }
      
      // Since Razorpay is not fully configured, even if we create an order,
      // we should alert that integration is pending if we rely on a mock callback
      alert("Payment system is not configured yet.");
    } catch (e) {
      console.error("Payment error:", e);
      alert("Payment system is not configured yet.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#111] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <BackButton />

      <div className="max-w-7xl mx-auto py-8 mt-8 md:mt-0">
        <div className="text-center mb-12">
          {isLimit && (
            <div className="inline-block bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              You have reached your current plan limit. Upgrade to continue.
            </div>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Upgrade to a premium plan to continue generating content and unlock full features.</p>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/5 mb-12 w-full max-w-4xl mx-auto hidden md:block">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Current Usage</h3>
              {remainingDays !== null && (
                 <div className="text-sm text-gray-400">
                    <span className="text-green-400 font-medium">{remainingDays} days remaining</span>
                    {" • "}
                    Renewal Date: {new Date(state.expiryDate!).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                 </div>
              )}
           </div>
           <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#2a2a2a] p-4 rounded-xl border border-white/5">
                 <div className="text-gray-400 text-sm mb-1">Chat (Daily)</div>
                 <div className="text-xl font-bold text-white">{state.usage.chatCount} <span className="text-gray-500 text-sm font-normal">/ {currentPlan.chat === Infinity ? 'Unlimited' : currentPlan.chat}</span></div>
              </div>
              <div className="bg-[#2a2a2a] p-4 rounded-xl border border-white/5">
                 <div className="text-gray-400 text-sm mb-1">Coding (Daily)</div>
                 <div className="text-xl font-bold text-white">{state.usage.codingCount} <span className="text-gray-500 text-sm font-normal">/ {currentPlan.coding === Infinity ? 'Unlimited' : currentPlan.coding}</span></div>
              </div>
              <div className="bg-[#2a2a2a] p-4 rounded-xl border border-white/5">
                 <div className="text-gray-400 text-sm mb-1">Images (Monthly)</div>
                 <div className="text-xl font-bold text-white">{state.usage.imageCount} <span className="text-gray-500 text-sm font-normal">/ {currentPlan.image}</span></div>
              </div>
              <div className="bg-[#2a2a2a] p-4 rounded-xl border border-white/5">
                 <div className="text-gray-400 text-sm mb-1">Videos (Monthly)</div>
                 <div className="text-xl font-bold text-white">{state.usage.videoCount} <span className="text-gray-500 text-sm font-normal">/ {currentPlan.video}</span></div>
              </div>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative flex flex-col p-6 bg-[#1e1e1e] rounded-3xl border ${plan.popular ? 'border-brand-500 shadow-[0_0_25px_rgba(var(--brand-500),0.15)] scale-105 z-10' : 'border-white/5 mt-4'} hover:border-white/20 transition-all`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              <h4 className="text-xl font-semibold text-white mb-2">{plan.name}</h4>
              <div className="flex items-baseline mb-6 text-white">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-gray-400 ml-1">/mo</span>
              </div>
              
              <div className="flex-1 space-y-4 mb-8">
                {plan.features.slice(0, 2).map((feat, i) => (
                   <div key={i} className="flex items-start text-sm text-gray-300">
                     <Check className="w-5 h-5 text-green-400 mr-3 shrink-0 mt-0.5" />
                     {feat}
                   </div>
                ))}
                
                <div className="flex items-start text-sm text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mr-3 shrink-0 mt-0.5" />
                  {plan.limit.split(', ')[0]} / month
                </div>
                <div className="flex items-start text-sm text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mr-3 shrink-0 mt-0.5" />
                  {plan.limit.split(', ')[1]} / month
                </div>
                
                {plan.features.slice(2).map((feat, i) => (
                   <div key={i} className="flex items-start text-sm text-gray-300">
                     <Check className="w-5 h-5 text-green-400 mr-3 shrink-0 mt-0.5" />
                     {feat}
                   </div>
                ))}
              </div>
              
              <button 
                onClick={() => handleSubscribe(plan.name, plan.price)}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${plan.popular ? 'bg-white text-black hover:bg-gray-200 shadow-lg' : 'bg-[#424242] text-white hover:bg-[#525252]'}`}
              >
                {state.plan.toLowerCase() === plan.name.toLowerCase() ? "Current Plan" : (plan.price === 0 ? "Get Started Free" : "Subscribe Now")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

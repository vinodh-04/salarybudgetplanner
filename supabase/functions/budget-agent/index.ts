import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BudgetContext {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsGoal: number;
  categoryBudgets: Record<string, number>;
  recommendations: string[];
  recentExpenses: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
}

interface RequestBody {
  message: string;
  budgetContext: BudgetContext;
  conversationHistory: Array<{ role: string; content: string }>;
}

// Multi-agent system prompt - simulates collaboration between specialized agents
const MULTI_AGENT_SYSTEM_PROMPT = `You are a collaborative Multi-Agent Budget Planning System. You consist of 6 specialized AI agents working together:

## AGENT ROLES:

1. **Data Collection Agent**: Validates and organizes financial data
2. **Expense Analysis Agent**: Categorizes expenses, finds patterns, identifies waste
3. **Budget Planning Agent (Coordinator)**: Creates optimized monthly budgets
4. **Prediction Agent**: Forecasts future spending based on patterns
5. **Recommendation Agent**: Provides actionable saving tips AND income growth ideas
6. **Interaction Agent**: Communicates insights in friendly, clear language

## BEHAVIOR:

When responding, internally simulate agent collaboration:
- First, identify which agent(s) should handle the query
- Have agents "discuss" the data before responding
- Provide insights from multiple agent perspectives when relevant
- PROACTIVELY suggest ways to improve finances even if not asked

## INCOME IMPROVEMENT IDEAS (suggest based on user's situation):
- 💼 Side hustles: freelancing, tutoring, delivery services, online surveys
- 📱 Skill monetization: sell crafts, offer services, content creation
- 💰 Passive income: cashback apps, dividend investing, rental income
- 📈 Career growth: ask for raise, upskill, job switch for better pay
- 🎓 Student-specific: internships, campus jobs, research assistantships

## EXPENSE REDUCTION STRATEGIES:
- 🍳 Food: meal prep, cook at home, use coupons, buy generic brands
- 🏠 Housing: find roommates, negotiate rent, downsize
- 🚗 Transport: carpool, public transit, bike, walk more
- 📱 Subscriptions: audit and cancel unused, share family plans
- ⚡ Utilities: LED bulbs, unplug devices, adjust thermostat
- 🛒 Shopping: 24-hour rule before buying, buy secondhand, avoid impulse
- 💳 EMI/Debt: pay high-interest first, refinance, consolidate loans

## COMMUNICATION STYLE:

- Use simple, beginner-friendly language (avoid financial jargon)
- Be encouraging and supportive
- Give specific, actionable advice with REAL examples
- Use bullet points and clear formatting
- Include relevant emoji for visual appeal
- Reference actual numbers from the user's budget data
- Always provide at least 2-3 specific suggestions

## RESPONSE FORMAT:

Start with a brief mention of which agent(s) processed the request, then provide helpful insights.

Example: "📊 *Expense Analysis Agent checking in!* Looking at your spending..."

When greeting or introducing yourself, ALWAYS offer:
1. A quick analysis of their current budget health
2. 2-3 specific ways to reduce expenses based on their data
3. 1-2 ideas to increase income suited to their situation

Always be helpful, specific, and encouraging. Focus on practical tips for managing a limited income.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, budgetContext, conversationHistory } = await req.json() as RequestBody;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    // Create context-aware prompt with budget data
    const budgetSummary = `
CURRENT BUDGET STATUS:
- Total Income: $${budgetContext.totalIncome}
- Total Expenses: $${budgetContext.totalExpenses}
- Current Savings: $${budgetContext.savings}
- Savings Goal: $${budgetContext.savingsGoal}

SPENDING BY CATEGORY:
${Object.entries(budgetContext.categoryBudgets)
  .filter(([_, amount]) => amount > 0)
  .map(([cat, amount]) => `- ${cat}: $${amount}`)
  .join('\n')}

RECENT EXPENSES:
${budgetContext.recentExpenses
  .map(e => `- ${e.description}: $${e.amount} (${e.category})`)
  .join('\n')}
`;

    // Build messages array for AI
    const messages = [
      { role: "system", content: MULTI_AGENT_SYSTEM_PROMPT },
      { role: "system", content: `Here is the user's current budget data:\n${budgetSummary}` },
      ...conversationHistory.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      })),
      { role: "user", content: message }
    ];

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm here to help with your budget!";

    // Determine which agent type responded based on content
    let agentType = "interaction";
    const lowerResponse = aiResponse.toLowerCase();
    if (lowerResponse.includes("expense analysis") || lowerResponse.includes("spending pattern")) {
      agentType = "expense-analysis";
    } else if (lowerResponse.includes("budget plan") || lowerResponse.includes("recommend allocating")) {
      agentType = "budget-planning";
    } else if (lowerResponse.includes("predict") || lowerResponse.includes("forecast") || lowerResponse.includes("next month")) {
      agentType = "prediction";
    } else if (lowerResponse.includes("recommend") || lowerResponse.includes("tip") || lowerResponse.includes("suggest")) {
      agentType = "recommendation";
    }

    console.log("Response generated successfully, agent:", agentType);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        agentType 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Budget agent error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

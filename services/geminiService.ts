
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, SavingsGoal, Budget, AIInsight, UserPersona, Bill } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  transactions: Transaction[],
  goals: SavingsGoal[],
  budgets: Budget[],
  persona: UserPersona,
  bills: Bill[]
): Promise<AIInsight[]> => {
  try {
    const prompt = `
      You are a world-class Family Financial Advisor for ${persona.name}.
      
      USER CONTEXT:
      - Monthly Salary: $${persona.salary}
      - Family Size: ${persona.familySize} members
      - Total Outstanding Loans: $${persona.totalLoans}
      - Investment Interest: ${persona.investmentNiche}
      
      FINANCIAL DATA:
      - Current Budgets: ${JSON.stringify(budgets)}
      - Savings Goals: ${JSON.stringify(goals)}
      - Recent Transactions: ${JSON.stringify(transactions.slice(0, 15))}
      - Upcoming Bills: ${JSON.stringify(bills.filter(b => !b.isPaid))}
      
      TASKS:
      1. Analyze the Debt-to-Income ratio and provide a specific plan for the $${persona.totalLoans} loan.
      2. Detect unusual patterns in spending relative to a family of ${persona.familySize}.
      3. Provide 2 specific investment steps for ${persona.investmentNiche} based on their current $${persona.salary} salary and leftovers.
      4. Alert the user if upcoming bills ($${bills.reduce((a,b) => a + (b.isPaid ? 0 : b.amount), 0)}) threaten their monthly budget.

      Return the response as a JSON array of AIInsight objects.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: 'One of: alert, advice, investment' },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              severity: { type: Type.STRING, description: 'One of: low, medium, high' }
            },
            required: ['type', 'title', 'content', 'severity']
          }
        }
      }
    });

    if (!response.text) return [];
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [{
      type: 'alert',
      title: 'Advisor Offline',
      content: 'Could not sync with AI Advisor. Please verify your financial profile.',
      severity: 'medium'
    }];
  }
};

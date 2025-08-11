
'use server';

/**
 * @fileOverview An AI agent that provides market analysis for agricultural products.
 * This flow uses the model's internal knowledge to generate market insights.
 */

import { ai } from '@/ai/genkit';
import {
  MarketAnalysisInputSchema,
  MarketAnalysisOutputSchema,
  type MarketAnalysisInput,
  type MarketAnalysisOutput,
} from '@/ai/schemas/market-analysis-schemas';


export type { MarketAnalysisInput, MarketAnalysisOutput };

export async function marketAnalysis(input: MarketAnalysisInput): Promise<MarketAnalysisOutput> {
  return marketAnalysisFlow(input);
}

const marketAnalysisPrompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  input: { schema: MarketAnalysisInputSchema },
  output: { schema: MarketAnalysisOutputSchema },
  system: `You are an expert agricultural market analyst for Indian farmers. Your goal is to provide clear, actionable intelligence based on your general knowledge of market trends and publicly available data from sources like data.gov.in. You will not have access to real-time data, so base your analysis on historical trends and known seasonal patterns. The current date is ${new Date().toISOString().split('T')[0]}.`,
  prompt: `
    Generate the entire response in the following language: {{language}}.

    **Analyze Inputs:**
    - User's Core Question: "{{query}}"
    - Commodity of Interest: {{#if commodity}}{{commodity}}{{else}}Not specified{{/if}}
    - Location for Analysis: {{#if location}}{{location}}{{else}}Not specified{{/if}}
    - Specific Market (Mandi): {{#if market}}{{market}}{{else}}Not specified{{/if}}
    - Additional User Notes: {{#if userNotes}}{{userNotes}}{{else}}None{{/if}}

    **Your Task:**
    Based on your general knowledge, provide a comprehensive market analysis for the user. Synthesize the provided inputs to create a coherent response that fills all the fields in the output schema.

    **Output Requirements:**
    -   **marketSummary:** A concise overview of your findings, including the most significant trends.
    -   **corePriceInfo:**
        -   **currentPrice:** Estimate the most likely current price, unit, and market.
        -   **dailyPriceRange:** Provide a plausible daily low and high price range.
    -   **historicalTrendAnalysis:**
        -   **previousDayPrice:** Estimate the price from the previous day.
        -   **priceChange:** Calculate the change in price and percentage.
        -   **priceTrend:** Analyze the recent trend (e.g., Upward, Downward) and the period (e.g., "last week").
    -   **marketDynamics:**
        -   **supplyStatus & demandStatus:** Infer the likely supply and demand status and explain its impact.
    -   **actionableInsight:**
        -   **recommendation:** Give a clear, actionable recommendation (e.g., "Sell now," "Hold").
        -   **reasoning:** Briefly justify your recommendation.
    -   **additionalInfo:**
        -   **lastUpdated:** Provide today's date.
        -   **dataSource:** State that the data is based on "General Market Trend Analysis and data.gov.in".

    Strictly adhere to the JSON output schema.
  `,
});

const marketAnalysisFlow = ai.defineFlow(
  {
    name: 'marketAnalysisFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await marketAnalysisPrompt(input);

    if (!output) {
      throw new Error('The AI model failed to generate a market analysis.');
    }

    return output;
  }
);


'use server';

/**
 * @fileOverview A conversational agent that can chat and use tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { findSchemes } from './government-schemes-flow';
import { marketAnalysis } from './market-analysis-flow';
import { recommendCrops } from './crop-recommender-flow';
import { languages } from '@/lib/i18n';
import { getEnvironmentalDataForLocation } from '../tools/location-data-tool';
import { type ChatInput, ChatInputSchema, type Message } from '@/ai/schemas/conversational-agent-schemas';

// Exporting the type for client-side usage
export type { Message };

const marketAnalysisTool = ai.defineTool(
  {
    name: 'marketAnalysis',
    description: 'Use for questions about crop prices, market trends, and commodity markets. Keywords: price, rate, market, mandi, cost, sell.',
    inputSchema: z.object({
      commodity: z.string().optional(),
      location: z.string().optional(),
      query: z.string(),
    }),
    outputSchema: z.any(),
  },
  async (input) => marketAnalysis({
    query: input.query,
    commodity: input.commodity,
    location: input.location
  })
);

const cropRecommenderTool = ai.defineTool(
  {
    name: 'cropRecommender',
    description: 'Use for questions about which crops to plant, what to grow, or crop selection. Keywords: grow, plant, sow, cultivate, which crop.',
    inputSchema: z.object({
      location: z.string(),
      userGoal: z.string().optional(),
      lastCropGrown: z.string().optional(),
    }),
    outputSchema: z.any(),
  },
  async (input) => recommendCrops({
      location: input.location,
      userGoal: input.userGoal || "Based on the user query",
      lastCropGrown: input.lastCropGrown,
  })
);

const governmentSchemesTool = ai.defineTool(
  {
    name: 'governmentSchemes',
    description: 'Use for questions about government support, subsidies, or agricultural schemes. Keywords: scheme, government, subsidy, loan, help, PM Kisan, bima, insurance.',
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.any(),
  },
  async (input) => findSchemes({ query: input.query })
);

export async function startChat(input: ChatInput): Promise<string> {
  return conversationalAgentFlow(input);
}

const conversationalAgentFlow = ai.defineFlow(
  {
    name: 'conversationalAgentFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const currentLanguageName = languages.find(l => l.code === input.language)?.name.split(' ')[0] || 'English';

    const prompt = `You are NeerVaani, a friendly and expert AI routing assistant for Indian farmers. Your primary language for this conversation is ${currentLanguageName}.
    Your key capability is to use tools to answer farmer's questions. You do not have knowledge of your own.

    Current User Query: "${input.query}"
    
    Instructions:
    1.  Analyze the user's query in the context of the conversation history.
    2.  If the query is a greeting, a simple question, or a follow-up that doesn't require specific data, respond conversationally.
    3.  If the query requires specific data (like crop prices, scheme details, or crop recommendations), you MUST call the appropriate tool to get the information.
    4.  If a tool requires a location and you don't have one from the query or history, ask the user for it.
    5.  If you cannot answer a question, apologize and explain that you cannot fulfill the request at this moment.`;

    try {
        const result = await ai.generate({
          model: 'googleai/gemini-2.0-flash',
          prompt: prompt,
          history: input.history,
          tools: [marketAnalysisTool, cropRecommenderTool, governmentSchemesTool, getEnvironmentalDataForLocation],
          config: { temperature: 0.2 },
        });
        
        const toolRequest = result.toolRequest;
        const textOutput = result.text;

        // If the model wants to call a tool
        if (toolRequest) {
          console.log(`Conversational agent is calling tool: ${toolRequest.name}`);
          const toolResponse = await toolRequest.run();

          // Now, summarize the tool's response, providing the full chat history for context.
          const summarizationResult = await ai.generate({
              model: 'googleai/gemini-2.0-flash',
              prompt: `You are NeerVaani, an expert farmer's assistant. A user asked: "${input.query}". You used the '${toolRequest.name}' tool and received the following JSON data. Synthesize this data into a clear, detailed, and easy-to-understand conversational response in ${currentLanguageName}. Use the provided chat history to understand the context of the conversation and answer any follow-up questions. Do not just repeat the JSON data. Provide a helpful summary.\n\nJSON Data:\n\`\`\`json\n${JSON.stringify(toolResponse, null, 2)}\n\`\`\``,
              history: input.history,
          });

          const summarizedText = summarizationResult.text;

          if (summarizedText && summarizedText.trim()) {
              return summarizedText;
          }
          // Fallback if summarization fails
          return "I was able to fetch some information, but I'm having trouble summarizing it. Could you please rephrase your question?";
        }

        // If the model just returned a text response
        if (textOutput && textOutput.trim()) {
          return textOutput;
        }

        // Fallback if there's no text and no tool call
        return "I'm not sure how to respond to that. Could you please rephrase your question?";

    } catch (error: any) {
        console.error("Error in conversationalAgentFlow:", error);

        // Check for the specific location error
        if (error.message && error.message.includes('Could not retrieve environmental data')) {
            return `I'm sorry, I don't have environmental data for the location you provided. Currently, I have detailed data for Pune and Bangalore. Please try one of those locations, or use the full agent in the NeerHub to enter the data manually.`;
        }

        // Generic fallback error message for other issues
        return "I'm sorry, I encountered an unexpected error and can't respond right now. Please try again in a moment.";
    }
  }
);

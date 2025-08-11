
'use server';

/**
 * @fileOverview An AI agent that provides contextual advice about a user's currently selected crop.
 */

import { ai } from '@/ai/genkit';
import { localSchemeSearchTool } from '@/ai/tools/local-scheme-search-tool';
import { z } from 'zod';
import { marketAnalysis } from './market-analysis-flow';
import { CurrentCropAgentInputSchema, CurrentCropAgentOutputSchema, type CurrentCropAgentInput, type CurrentCropAgentOutput } from '../schemas/current-crop-agent-schemas';
import { languages } from '@/lib/i18n';

export type { CurrentCropAgentInput, CurrentCropAgentOutput };

// Define tools this agent can use
const marketAnalysisTool = ai.defineTool(
  {
    name: 'marketAnalysis',
    description: 'Provides market analysis for a given commodity and location. Use for any questions related to market price, trends, demand, or when to sell.',
    inputSchema: z.object({
      commodity: z.string().describe("The crop to analyze."),
      location: z.string().describe("The user's location for market context."),
      query: z.string().describe("The user's original query."),
    }),
    outputSchema: z.any(),
  },
  async (input) => marketAnalysis({
      commodity: input.commodity,
      location: input.location,
      query: input.query
  })
);

export async function askCurrentCropAgent(input: CurrentCropAgentInput): Promise<CurrentCropAgentOutput> {
  return currentCropAgentFlow(input);
}

const currentCropAgentPrompt = ai.definePrompt({
  name: 'currentCropAgentPrompt',
  input: { schema: CurrentCropAgentInputSchema },
  output: { schema: CurrentCropAgentOutputSchema },
  tools: [marketAnalysisTool, localSchemeSearchTool],
  system: 'You are an expert agronomist providing tailored advice to a farmer. Your goal is to answer their query by leveraging the specific context of the crop they are growing. You MUST use your tools when the query involves market prices or government schemes.',
  prompt: `
    Generate the entire response in the following language: {{language}}.

    A farmer has a question about a crop they are currently growing. Use the provided context and tools to give a comprehensive, structured response.

    **FARMER'S CROP CONTEXT:**
    - Crop Name: {{cropContext.cropName}}
    - Field Size: {{cropContext.fieldSize}}
    - Location: {{cropContext.location}}
    - Sowing Date: {{cropContext.sowingDate}}
    - Additional Info: {{#if cropContext.additionalInfo}}{{cropContext.additionalInfo}}{{else}}None{{/if}}

    **FARMER'S QUESTION:**
    "{{query}}"

    **YOUR TASK:**
    1.  **Analyze the Query:** Understand the farmer's intent. Is it about market price, fertilizer, disease, or something else?
    2.  **Use Tools if Necessary:**
        - If the query is about **price, market, or selling**, you MUST use the \`marketAnalysis\` tool with the crop name and location as context.
        - If the query is about **subsidies, government help, or schemes**, you MUST use the \`localSchemeSearchTool\`.
        - For other topics like **fertilizer recommendations, pest control, or general advice**, use your internal knowledge.
    3.  **Synthesize and Structure:** Based on the tool output or your own knowledge, formulate a response.
    4.  **Provide a Summary:** Start with a brief, encouraging summary that directly answers the farmer's question.
    5.  **Create Structured Advice:** Break down your detailed advice into logical sections. For each section, provide a clear title, detailed content, and select an appropriate icon from the provided enum list. Example sections could be "Market Analysis", "Fertilizer Schedule", "Pest Alert", "Relevant Government Scheme", etc.
    
    Structure your entire response strictly according to the provided JSON output schema.
  `,
});


const currentCropAgentFlow = ai.defineFlow(
  {
    name: 'currentCropAgentFlow',
    inputSchema: CurrentCropAgentInputSchema,
    outputSchema: CurrentCropAgentOutputSchema,
  },
  async (input) => {
    const { output } = await currentCropAgentPrompt(input);

    if (!output) {
      throw new Error('The AI model failed to generate a response for the current crop agent.');
    }
    
    // If the model calls a tool, it will automatically handle it and the result will be in the output.
    // We can add logic here to process the tool's raw output if needed, but for now, we trust the prompt to summarize it.

    return output;
  }
);

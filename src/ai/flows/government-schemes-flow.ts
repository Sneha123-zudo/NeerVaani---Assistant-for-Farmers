
'use server';

/**
 * @fileOverview An AI agent for navigating government agricultural schemes from a local database.
 *
 * - findSchemes - A function that uses a tool to search for and then summarize government schemes.
 * - GovernmentSchemesInput - The input type for the findSchemes function.
 * - GovernmentSchemesOutput - The return type for the findSchemes function.
 */

import { ai } from '@/ai/genkit';
import { localSchemeSearchTool } from '@/ai/tools/local-scheme-search-tool';
import {
  GovernmentSchemesInputSchema,
  GovernmentSchemesOutputSchema,
  type GovernmentSchemesInput,
  type GovernmentSchemesOutput,
} from '@/ai/schemas/government-schemes-schemas';

export type { GovernmentSchemesInput, GovernmentSchemesOutput };

export async function findSchemes(input: GovernmentSchemesInput): Promise<GovernmentSchemesOutput> {
  return governmentSchemesFlow(input);
}

const governmentSchemesPrompt = ai.definePrompt({
  name: 'governmentSchemesPrompt',
  input: { schema: GovernmentSchemesInputSchema },
  output: { schema: GovernmentSchemesOutputSchema },
  tools: [localSchemeSearchTool],
  system: 'You are an expert assistant for Indian farmers. Your goal is to help them understand and access government agricultural schemes. You MUST ONLY use information from the `localSchemeSearchTool` tool. Do not use your own knowledge. If the tool returns no relevant schemes, you MUST return an empty array for the `schemes` field and explain that no matching schemes were found in the `summary` field.',
  prompt: `
    Generate the entire response in the following language: {{language}}.
    
    A farmer has asked for help with the following topic: "{{query}}".

    **Your Task:**
    1.  **CRITICAL:** First, you MUST use the \`localSchemeSearchTool\` to search the local database for official information related to the farmer's query.
    2.  Carefully analyze ONLY the search results provided by the tool. The tool will provide a rich JSON object with all details.
    3.  From the search results, identify the most relevant government schemes.
    4.  For each identified scheme, **summarize** the information from the tool's output into the required fields (details, benefits, eligibility, applicationProcess, documentsRequired).
    5.  Extract the official URL from the "Apply Now" section of the tool's data and place it in the \`sourceLink\` field.
    6.  If you find multiple relevant schemes, list them all in the 'schemes' array. If the tool returns no relevant schemes, the 'schemes' array MUST be empty.
    7.  Finally, write a brief, encouraging overall summary of your findings.

    Structure your entire response according to the provided JSON output schema.
  `,
});

const governmentSchemesFlow = ai.defineFlow(
  {
    name: 'governmentSchemesFlow',
    inputSchema: GovernmentSchemesInputSchema,
    outputSchema: GovernmentSchemesOutputSchema,
  },
  async (input) => {
    const { output } = await governmentSchemesPrompt(input);

    if (!output) {
      throw new Error('The AI model failed to generate a response for the government schemes query.');
    }
    
    return output;
  }
);

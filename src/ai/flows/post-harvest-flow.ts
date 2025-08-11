
'use server';

/**
 * @fileOverview An AI agent that provides post-harvest guidance for a specific crop.
 */

import { ai } from '@/ai/genkit';
import {
  PostHarvestInputSchema,
  PostHarvestOutputSchema,
  type PostHarvestInput,
  type PostHarvestOutput,
} from '@/ai/schemas/post-harvest-schemas';

export type { PostHarvestInput, PostHarvestOutput };

export async function getPostHarvestAdvice(input: PostHarvestInput): Promise<PostHarvestOutput> {
  return postHarvestFlow(input);
}

const postHarvestPrompt = ai.definePrompt({
  name: 'postHarvestPrompt',
  input: { schema: PostHarvestInputSchema },
  output: { schema: PostHarvestOutputSchema },
  system: `You are an expert in post-harvest management for agricultural products in India. Your task is to provide comprehensive and actionable advice to farmers based on their specific crop and situation. The current date is ${new Date().toISOString().split('T')[0]}.`,
  prompt: `
    Generate the entire response in the following language: {{language}}.

    A farmer needs post-harvest advice. Analyze the following context and provide detailed recommendations for all 8 fields in the output schema.

    **FARMER'S CROP CONTEXT:**
    - Crop Name: {{cropContext.cropName}}
    - Field Size: {{cropContext.fieldSize}}
    - Location: {{cropContext.location}}
    - Sowing Date: {{cropContext.sowingDate}}
    - Estimated Yield: {{#if estimatedYield}}{{estimatedYield}}{{else}}Not provided{{/if}}
    - Additional Info: {{#if cropContext.additionalInfo}}{{cropContext.additionalInfo}}{{else}}None{{/if}}

    **YOUR TASK (Provide detailed, actionable advice for each point):**

    1.  **Storage Recommendations**: Suggest optimal storage conditions (temperature, humidity). Mention specific types of storage facilities (e.g., cold storage, ventilated warehouses, traditional granaries) suitable for the crop and location. Include pest control measures for storage.

    2.  **Transportation Options**: Recommend suitable transportation methods (e.g., refrigerated trucks, open-body trucks, local tempos). Mention appropriate containers (crates, gunny bags, plastic bins) and logistics providers if possible, considering the location.

    3.  **Market Linkages**: Suggest potential markets (local mandis, APMCs, direct-to-consumer, food processing units). Provide a brief analysis of demand and competition based on the location and crop type.

    4.  **Value Addition Opportunities**: Identify potential value-added products. Examples:
        - For tomatoes: making puree, sauce, or sun-dried tomatoes.
        - For grains: milling into flour, grading, and branding.
        - For fruits: making juices, jams, or pickles.
        Suggest processing, packaging, or grading opportunities.

    5.  **Pricing Strategy**: Recommend pricing strategies. Discuss setting optimal prices based on quality, market rates, and demand. Include negotiation tactics for dealing with buyers and the importance of contract management if applicable.

    6.  **Quality Control Measures**: Suggest key quality control steps. This should include inspection for defects, testing for quality parameters (e.g., moisture content, size, color), and information on relevant certifications (like AGMARK, organic certification).

    7.  **Post-Harvest Handling**: Recommend best practices for handling immediately after harvest. Include specific advice on cleaning, drying, sorting, and packaging to minimize losses and maintain quality.

    8.  **Waste Management**: Suggest practical ways to manage crop waste. This could include composting stalks and leaves, using waste for animal feed, or other recycling/disposal methods suitable for a farm setting.

    Structure your entire response strictly according to the provided JSON output schema.
  `,
});


const postHarvestFlow = ai.defineFlow(
  {
    name: 'postHarvestFlow',
    inputSchema: PostHarvestInputSchema,
    outputSchema: PostHarvestOutputSchema,
  },
  async (input) => {
    const { output } = await postHarvestPrompt(input);

    if (!output) {
      throw new Error('The AI model failed to generate post-harvest advice.');
    }

    return output;
  }
);

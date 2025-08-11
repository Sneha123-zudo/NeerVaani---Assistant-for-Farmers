
'use server';

/**
 * @fileOverview Crop recommendation AI agent.
 *
 * - recommendCrops - A function that recommends crops based on various agricultural parameters.
 * - CropRecommenderInput - The input type for the recommendCrops function.
 * - CropRecommenderOutput - The return type for the recommendCrops function.
 */

import { ai } from '@/ai/genkit';
import { getEnvironmentalDataForLocation } from '@/ai/tools/location-data-tool';
import { CropRecommenderInputSchema, CropRecommenderOutputSchema, type CropRecommenderInput, type CropRecommenderOutput } from '@/ai/schemas/crop-recommender-schemas';

export type { CropRecommenderInput, CropRecommenderOutput };

export async function recommendCrops(input: CropRecommenderInput): Promise<CropRecommenderOutput> {
  return cropRecommenderFlow(input);
}

const cropRecommenderPrompt = ai.definePrompt({
  name: 'cropRecommenderPrompt',
  input: { schema: CropRecommenderInputSchema },
  output: { schema: CropRecommenderOutputSchema },
  system: `You are an expert agricultural scientist and agronomist. Your task is to recommend the best crops to grow based on the user's specific conditions. The current date is ${new Date().toISOString().split("T")[0]}.`,
  prompt: `
    Generate the entire response in the following language: {{language}}.

    Based on the following inputs, generate a list of at least three suitable crop recommendations.
    - Location: {{location}}
    - Land Size: {{landSize}}
    - Soil Type: {{soilType}}
    - Soil pH: {{soilPh}}
    - Temperature: {{temperature}}
    - Humidity: {{humidity}}
    - Rainfall: {{rainfall}}
    - Last Crop Grown: {{lastCropGrown}}
    - Available Term Period: {{termPeriod}} months
    - User's Goal: {{userGoal}}
    {{#if soilPhotoDataUri}}
    - Soil Image: {{media url=soilPhotoDataUri}} (Analyze this image to determine soil properties like type, texture, and potential quality if not provided elsewhere.)
    {{/if}}

    For each recommendation, provide a comprehensive analysis covering all fields in the output schema.
    - **Crop Information**: Provide the crop name and a detailed description.
    - **Agricultural Guidance**: Specify the optimal sowing time, irrigation/rainfall dependency, and typical resource allocation (fertilizers, pesticides).
    - **Environmental Factors**: Detail the ideal soil and weather conditions.
    - **Economic Insights**: Estimate yield potential, analyze market trends, and project profitability.
    - **Regional Specificity**: Explain why the crop is suitable for the location and its historical performance in the region.
    - **Risk Management**: Outline potential pests, diseases, and climate risks, along with mitigation strategies.
  
    Tailor your recommendations to the user's goal (e.g., if the goal is 'maximize profit', prioritize high-value crops that suit the conditions).
    Ensure your response is structured exactly according to the JSON output schema.
  `,
});


const cropRecommenderFlow = ai.defineFlow(
  {
    name: 'cropRecommenderFlow',
    inputSchema: CropRecommenderInputSchema,
    outputSchema: CropRecommenderOutputSchema,
  },
  async (input) => {
    let environmentalData = {
        temperature: input.temperature,
        humidity: input.humidity,
        rainfall: input.rainfall,
        soilType: input.soilType,
    };

    // If critical environmental data is missing, fetch it with the tool.
    if (input.location && (!input.temperature || !input.humidity || !input.rainfall)) {
        console.log(`Missing environmental data for ${input.location}. Fetching...`);
        const toolOutput = await getEnvironmentalDataForLocation({ location: input.location });

        if (!toolOutput) {
            throw new Error(`Could not retrieve environmental data for the location: "${input.location}". Please provide a valid location or specify environmental conditions manually.`);
        }
        
        environmentalData = { ...environmentalData, ...toolOutput };
    }

    const finalInput = {
        ...input,
        ...environmentalData,
    };

    const { output } = await cropRecommenderPrompt(finalInput);
    
    if (!output) {
      throw new Error('Failed to get crop recommendations.');
    }
    return output;
  }
);


'use server';

/**
 * @fileOverview Irrigation scheduling AI agent.
 *
 * - getIrrigationSchedule - A function that recommends an irrigation schedule.
 * - IrrigationSchedulerInput - The input type for the getIrrigationSchedule function.
 * - IrrigationSchedulerOutput - The return type for the getIrrigationSchedule function.
 */

import { ai } from '@/ai/genkit';
import { getEnvironmentalDataForLocation } from '@/ai/tools/location-data-tool';
import {
  IrrigationSchedulerInputSchema,
  IrrigationSchedulerOutputSchema,
  type IrrigationSchedulerInput,
  type IrrigationSchedulerOutput,
} from '@/ai/schemas/irrigation-scheduler-schemas';

export type { IrrigationSchedulerInput, IrrigationSchedulerOutput };

export async function getIrrigationSchedule(
  input: IrrigationSchedulerInput
): Promise<IrrigationSchedulerOutput> {
  return irrigationSchedulerFlow(input);
}

const irrigationSchedulerPrompt = ai.definePrompt({
  name: 'irrigationSchedulerPrompt',
  input: { schema: IrrigationSchedulerInputSchema },
  output: { schema: IrrigationSchedulerOutputSchema },
  system: `You are an expert agronomist and irrigation specialist. Your task is to generate a precise and optimal irrigation schedule for a farmer. The schedule must start from today (${
    new Date().toISOString().split('T')[0]
  }) and all dates in the schedule must be in the future.`,
  prompt: `
    Generate the entire response in the following language: {{language}}.

    Please generate an optimal irrigation schedule based on the following details.
    - Crop to be irrigated: {{selectedCrop}}
    - Location: {{location}}
    - Land Size: {{landSize}} {{landUnit}}
    - Last Crop Grown on this land: {{lastCrop}}
    - Total Cultivation Period: {{termPeriod}} months
    - Recent/Expected Rainfall: {{rainfall}} mm
    - Soil Type: {{soilType}}
    - Soil pH: {{soilPh}}

    Your task is to create a schedule as an array of JSON objects. Each object must have a "date", "startTime", "endTime", and "message" field.
    - The schedule should be reasonable and factor in the water requirements of the selected crop, the provided soil type and rainfall data, and general weather patterns for the location.
    - The "message" for each entry should be a detailed, actionable instruction for the farmer on that day. Explain what to do and why it's important. For example: "Irrigate for 1 hour. This is a critical growth stage, and consistent moisture is key to ensuring a healthy yield."
    - If no specific action is needed, provide a general check-in message (e.g., "Check soil moisture levels today. If the top 2 inches are dry, consider a light watering in the evening.").
    - Provide a clear start and end time for the irrigation window, for example, "06:00" to "07:00".

    Strict Instruction: Your entire response must be ONLY a raw JSON object matching the output schema, with no other text, formatting, or code blocks.
  `,
});

const irrigationSchedulerFlow = ai.defineFlow(
  {
    name: 'irrigationSchedulerFlow',
    inputSchema: IrrigationSchedulerInputSchema,
    outputSchema: IrrigationSchedulerOutputSchema,
  },
  async (input) => {
    let environmentalData = {
      rainfall: input.rainfall,
      soilType: input.soilType,
    };

    // If rainfall or soil type data is missing, fetch it with the tool.
    if (input.location && (!input.rainfall || !input.soilType)) {
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

    const { output } = await irrigationSchedulerPrompt(finalInput);

    if (!output) {
      throw new Error('Failed to get irrigation schedule.');
    }
    return output;
  }
);

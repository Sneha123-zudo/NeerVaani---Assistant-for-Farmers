
import { z } from 'zod';

// This defines the data structure for a single crop
// that is passed to the agent as context.
const CurrentCropContextSchema = z.object({
  id: z.string(),
  cropName: z.string(),
  fieldSize: z.string(),
  location: z.string(),
  sowingDate: z.string(), // ISO string date
  additionalInfo: z.string().optional(),
});

// This is the main input schema for the agent flow.
export const CurrentCropAgentInputSchema = z.object({
  query: z.string().describe("The user's question about their selected crop."),
  cropContext: CurrentCropContextSchema.describe("The context of the user's currently selected crop."),
  language: z.string().optional().describe('The language for the response.'),
});
export type CurrentCropAgentInput = z.infer<typeof CurrentCropAgentInputSchema>;

// This schema defines the structured response from the agent.
const AdviceSectionSchema = z.object({
    title: z.string().describe("The title of the advice section (e.g., 'Fertilizer Recommendation', 'Pest Alert')."),
    content: z.string().describe("The detailed advice or information for this section. Can include bullet points."),
    icon: z.enum([
      'Bot', 'TrendingUp', 'Landmark', 'FlaskConical', 'ShieldAlert', 'Droplet', 'Info'
    ]).describe("An appropriate icon name to visually represent the section.")
});

export const CurrentCropAgentOutputSchema = z.object({
  summary: z.string().describe('A brief, conversational summary of the agent\'s findings.'),
  structuredAdvice: z.array(AdviceSectionSchema).describe('An array of structured advice sections.'),
});
export type CurrentCropAgentOutput = z.infer<typeof CurrentCropAgentOutputSchema>;

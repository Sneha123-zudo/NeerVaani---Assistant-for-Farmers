
'use server';

/**
 * @fileOverview A crop disease diagnosis AI agent.
 *
 * - diagnoseCrop - A function that handles the crop diagnosis process.
 * - CropDiagnosisInput - The input type for the diagnoseCrop function.
 * - CropDiagnosisOutput - The return type for the diagnoseCrop function.
 */

import { ai } from '@/ai/genkit';
import { CropDiagnosisInputSchema, CropDiagnosisOutputSchema, type CropDiagnosisInput, type CropDiagnosisOutput } from '@/ai/schemas/crop-diagnosis-schemas';

export type { CropDiagnosisInput, CropDiagnosisOutput };

export async function diagnoseCrop(input: CropDiagnosisInput): Promise<CropDiagnosisOutput> {
  // The saving logic is now handled by the client-side component after the user clicks a button.
  // This flow is now only responsible for getting the diagnosis.
  const diagnosis = await cropDiagnosisFlow(input);
  return diagnosis;
}

const cropDiagnosisPrompt = ai.definePrompt({
  name: 'cropDiagnosisPrompt',
  input: { schema: CropDiagnosisInputSchema },
  output: { schema: CropDiagnosisOutputSchema },
  prompt: `
    You are an expert plant pathologist and agronomist specializing in crop diseases.
    Generate the entire response in the following language: {{language}}.

    Analyze the provided images and information to diagnose the plant's health issue.

    **User-provided Information:**
    - Land Size: {{landSize}}
    - Additional Notes: {{#if additionalNotes}}{{additionalNotes}}{{else}}None provided.{{/if}}

    **Images for Analysis:**
    {{#each photoDataUris}}
    {{media url=this}}
    {{/each}}

    **Your Task:**
    1.  **Analyze Health Status**: Examine the images to determine the plant's health.
        - Classify the health status as 'Healthy', 'Infected', or 'At Risk'.
        - Determine the severity of infection ('Low', 'Medium', 'High') if applicable.
        - Provide a concise one-sentence summary of the overall health.
    2.  **Identify Disease**: If a disease or pest is present, identify it by its common name. Provide a brief, easy-to-understand description of what it is. If the plant is healthy, state that no disease was detected.
    3.  **List Symptoms**: Describe the specific symptoms visible in the images or commonly associated with the identified disease (e.g., "yellow spots on leaves," "wilting stems," "powdery white coating").
    4.  **Recommend Remedies**: Provide clear, scannable, and actionable advice for treatment. Recommend both organic and chemical solutions where applicable. Tailor the amount of remedy needed based on the provided land size if possible. Mention locally available and affordable options if you can infer them.
    5.  **Suggest Prevention**: Offer practical tips to prevent this issue from recurring in the future.

    Structure your entire response according to the provided JSON output schema.
  `,
});


const cropDiagnosisFlow = ai.defineFlow(
  {
    name: 'cropDiagnosisFlow',
    inputSchema: CropDiagnosisInputSchema,
    outputSchema: CropDiagnosisOutputSchema,
  },
  async (input) => {
    const { output } = await cropDiagnosisPrompt(input);
    
    if (!output) {
      throw new Error('Failed to get crop diagnosis from the model.');
    }
    return output;
  }
);

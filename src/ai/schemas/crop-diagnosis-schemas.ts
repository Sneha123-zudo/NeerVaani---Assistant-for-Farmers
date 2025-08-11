
import { z } from 'zod';

export const CropDiagnosisInputSchema = z.object({
  userId: z.string().optional().describe('The ID of the user requesting the diagnosis.'),
  photoDataUris: z.array(z.string()).min(1, 'At least one photo is required.').describe("An array of photos of the diseased plant, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  landSize: z.string().optional().describe('The size of the land where the crop is planted (e.g., "2 acres").'),
  additionalNotes: z.string().optional().describe('Any additional notes or observations from the user.'),
  language: z.string().optional().describe('The language for the response (e.g., "Hindi", "Marathi"). Defaults to English if not specified.'),
});
export type CropDiagnosisInput = z.infer<typeof CropDiagnosisInputSchema>;

export const CropDiagnosisOutputSchema = z.object({
  healthStatus: z.object({
    status: z.enum(['Healthy', 'Infected', 'At Risk']).describe('The overall health status of the crop.'),
    severity: z.enum(['Low', 'Medium', 'High', 'N/A']).describe('The severity of the infection, if applicable.'),
    summary: z.string().describe('A one-sentence summary of the health status.'),
  }),
  diseaseIdentification: z.object({
    name: z.string().describe('The common name of the identified disease or pest. "N/A" if healthy.'),
    description: z.string().describe('A brief description of the disease or pest.'),
  }),
  symptoms: z.string().describe('A description of the symptoms observed or typically associated with the disease.'),
  remedies: z.string().describe('Actionable advice on locally available and affordable remedies, tailored to land size.'),
  prevention: z.string().describe('Preventive measures to avoid future occurrences.'),
});
export type CropDiagnosisOutput = z.infer<typeof CropDiagnosisOutputSchema>;


import { z } from 'zod';

export const GovernmentSchemesInputSchema = z.object({
  query: z.string().min(3, 'Please enter a more detailed query.').describe('The user\'s query about a government scheme (e.g., "subsidy for drip irrigation").'),
  language: z.string().optional().describe('The language for the response (e.g., "Hindi", "Marathi"). Defaults to English if not specified.'),
});
export type GovernmentSchemesInput = z.infer<typeof GovernmentSchemesInputSchema>;

// This schema defines the final, summarized output for the UI.
const SchemeSummarySchema = z.object({
  schemeName: z.string().describe('The official name of the government scheme.'),
  details: z.string().describe('A simple, clear explanation of the scheme, its purpose, and its objectives, summarized from the source data.'),
  benefits: z.string().describe('A summary of the key benefits provided by the scheme, formatted with bullet points if applicable.'),
  eligibility: z.string().describe('A summary of the key eligibility criteria for the scheme.'),
  applicationProcess: z.string().describe('A summarized, step-by-step description of how to apply for the scheme.'),
  documentsRequired: z.string().describe('A list of required documents for the application, formatted with bullet points.'),
  sourceLink: z.string().url().describe('The direct URL to the official government page for the scheme, extracted from the "Apply Now" section or a similar source in the data.'),
});

export const GovernmentSchemesOutputSchema = z.object({
  schemes: z.array(SchemeSummarySchema).describe('A list of summarized government schemes found for the user\'s query.'),
  summary: z.string().describe('A brief overall summary of the findings.'),
});
export type GovernmentSchemesOutput = z.infer<typeof GovernmentSchemesOutputSchema>;

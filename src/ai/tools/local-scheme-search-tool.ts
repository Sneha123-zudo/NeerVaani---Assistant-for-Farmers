
'use server';

/**
 * @fileOverview A Genkit tool for searching a local JSON database of government schemes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import schemesData from '@/ai/data/schemes.json';

// Define the detailed, nested shape of a single scheme using Zod, matching the new JSON structure.
const SectionSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  list_items: z.array(z.string()).optional(),
  sub_sections: z.lazy(() => z.array(SectionSchema)).optional(),
});

const SchemeSchema = z.object({
  scheme_name: z.string(),
  ministry: z.string(),
  keywords: z.array(z.string()),
  sections: z.array(SectionSchema),
});

// Define the output schema for the tool, which will be an array of these detailed schemes.
const LocalSchemeSearchResultsSchema = z.object({
  results: z.array(SchemeSchema).describe('A list of relevant government schemes found from the local JSON database.'),
});

/**
 * A Genkit tool that searches a local JSON file for relevant government schemes.
 * It searches based on the user's query against the scheme name and keywords.
 */
export const localSchemeSearchTool = ai.defineTool(
  {
    name: 'localSchemeSearchTool',
    description: 'Searches a local, structured database of agricultural schemes. Use this tool to find relevant scheme details based on the user\'s query.',
    inputSchema: z.object({
      query: z.string().describe("The user's query to search for (e.g., 'crop insurance', 'loan', 'pm kisan')."),
    }),
    outputSchema: LocalSchemeSearchResultsSchema,
  },
  async ({ query }) => {
    console.log(`Searching local scheme database with query: ${query}`);
    const lowerCaseQuery = query.toLowerCase();

    // Filter the schemes based on the query.
    // This search is simple but effective: it checks if the query appears in the name or keywords.
    const filteredSchemes = schemesData.filter(scheme => {
      const isNameMatch = scheme.scheme_name.toLowerCase().includes(lowerCaseQuery);
      const isKeywordMatch = scheme.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseQuery));
      return isNameMatch || isKeywordMatch;
    });

    console.log(`Found ${filteredSchemes.length} matching schemes locally.`);
    
    // Validate the filtered schemes against our Zod schema before returning.
    // This ensures data integrity.
    const validationResult = LocalSchemeSearchResultsSchema.safeParse({ results: filteredSchemes });

    if (!validationResult.success) {
        console.error("Scheme data validation failed:", validationResult.error);
        // Handle the error, e.g., by returning an empty array or throwing an error
        return { results: [] };
    }
    
    // Return the found and validated schemes.
    return validationResult.data;
  }
);

    
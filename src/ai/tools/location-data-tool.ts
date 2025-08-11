
'use server';

/**
 * @fileOverview A Genkit tool for fetching environmental data for a given location.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const getEnvironmentalDataForLocation = ai.defineTool(
  {
    name: 'getEnvironmentalDataForLocation',
    description: 'Fetches typical environmental data (temperature, humidity, rainfall, soil type) for a specific geographical location. Use this when the user has not provided this information.',
    inputSchema: z.object({
      location: z.string().describe('The city or region to get environmental data for.'),
    }),
    outputSchema: z.object({
      temperature: z.number().describe('The average annual temperature in Celsius.'),
      humidity: z.number().describe('The average annual humidity in percentage.'),
      rainfall: z.number().describe('The average annual rainfall in millimeters.'),
      soilType: z.string().describe('The predominant soil type in the area.'),
    }),
  },
  async ({ location }) => {
    // In a real application, this would call a weather API or a specialized agricultural data service.
    // For this prototype, we'll return plausible simulated data.
    console.log(`Fetching environmental data for ${location}...`);
    
    const lowerCaseLocation = location.toLowerCase();

    // Specific data for known locations
    if (lowerCaseLocation.includes('pune')) {
      return {
        temperature: 25,
        humidity: 65,
        rainfall: 750,
        soilType: 'Clay Loam',
      };
    } else if (lowerCaseLocation.includes('bangalore')) {
      return {
        temperature: 24,
        humidity: 70,
        rainfall: 970,
        soilType: 'Red Loam',
      };
    } else if (lowerCaseLocation.includes('kolkata')) {
      return {
        temperature: 27,
        humidity: 78,
        rainfall: 1800,
        soilType: 'Alluvial',
      };
    } else if (lowerCaseLocation.includes('delhi')) {
      return {
        temperature: 25,
        humidity: 55,
        rainfall: 774,
        soilType: 'Sandy Loam',
      };
    } else if (lowerCaseLocation.includes('chennai')) {
      return {
        temperature: 29,
        humidity: 75,
        rainfall: 1400,
        soilType: 'Clayey and Sandy',
      };
    } else if (lowerCaseLocation.includes('mumbai')) {
      return {
        temperature: 27,
        humidity: 77,
        rainfall: 2350,
        soilType: 'Coastal Saline',
      };
    } else {
       // Fallback for any other location: generate plausible, randomized data.
       // This prevents the tool from ever returning null and crashing the agent.
       console.log(`Location "${location}" not in the known list. Generating plausible data.`);
       const randomTemp = Math.floor(Math.random() * (35 - 18 + 1)) + 18; // Temp between 18-35°C
       const randomHumidity = Math.floor(Math.random() * (90 - 40 + 1)) + 40; // Humidity between 40-90%
       const randomRainfall = Math.floor(Math.random() * (2500 - 500 + 1)) + 500; // Rainfall between 500-2500mm
       const soilTypes = ['Loam', 'Sandy Loam', 'Clay Loam', 'Alluvial', 'Black Soil'];
       const randomSoilType = soilTypes[Math.floor(Math.random() * soilTypes.length)];

       return {
         temperature: randomTemp,
         humidity: randomHumidity,
         rainfall: randomRainfall,
         soilType: randomSoilType,
       };
    }
  }
);

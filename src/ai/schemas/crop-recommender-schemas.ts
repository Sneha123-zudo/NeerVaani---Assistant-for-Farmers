
import { z } from 'zod';

export const CropRecommenderInputSchema = z.object({
  location: z.string().min(1, 'Location is required.').describe('The geographical location for the crop recommendation (e.g., city, state). This is a required field.'),
  landSize: z.string().optional().describe('The size of the land available (e.g., "2 acres").'),
  soilType: z.string().optional().describe('The type of soil (e.g., "Loamy", "Clay", "Sandy"). If not provided, the model should infer based on location or image.'),
  soilPh: z.number().optional().describe('The pH level of the soil.'),
  temperature: z.number().optional().describe('The average ambient temperature in Celsius.'),
  humidity: z.number().optional().describe('The average humidity percentage.'),
  rainfall: z.number().optional().describe('The average annual rainfall in millimeters.'),
  userGoal: z.string().optional().describe('The user\'s primary goal (e.g., "maximize profit", "water conservation", "soil improvement").'),
  lastCropGrown: z.string().optional().describe('The last crop that was grown on this land to consider for crop rotation.'),
  termPeriod: z.number().optional().describe('The duration in months that the land is available for farming.'),
  soilPhotoDataUri: z.string().optional().describe("A photo of the soil, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. The model should analyze this to determine soil properties if not provided."),
  language: z.string().optional().describe('The language for the response (e.g., "Hindi", "Marathi"). Defaults to English if not specified.'),
});
export type CropRecommenderInput = z.infer<typeof CropRecommenderInputSchema>;

const RecommendedCropSchema = z.object({
  // Crop Information
  cropName: z.string().describe('Name of the recommended crop.'),
  cropDetails: z.string().describe('Description of the crop, its characteristics, and growth patterns.'),
  
  // Agricultural Guidance
  sowingTime: z.string().describe('Optimal time for planting the recommended crop.'),
  dependency: z.string().describe('Irrigation or rainfall requirements for the crop.'),
  resourceAllocation: z.string().describe('Recommended amounts of fertilizers, pesticides, and water.'),
  
  // Environmental Factors
  soilRequirements: z.string().describe('Suitable soil type, pH level, and nutrient requirements (N, P, K).'),
  weatherConditions: z.string().describe('Suitable temperature, humidity, and rainfall ranges.'),
  
  // Economic Insights
  yieldPotential: z.string().describe('Estimated yield of the recommended crop (e.g., in tonnes per hectare).'),
  marketTrends: z.string().describe('Current market demand and prices for the crop.'),
  profitability: z.string().describe('Estimated profit potential of the recommended crop.'),
  
  // Regional Specificity
  locationSuitability: z.string().describe('Suitability of the recommended crop for specific regions or climates.'),
  regionalCropPerformance: z.string().describe('Historical performance data of the crop in similar regions.'),
  
  // Risk Management
  pestAndDiseaseManagement: z.string().describe('Potential pests and diseases affecting the crop and recommended management strategies.'),
  climateRisk: z.string().describe('Potential climate-related risks and mitigation strategies.'),
});


export const CropRecommenderOutputSchema = z.object({
  recommendations: z.array(RecommendedCropSchema).describe('A list of at least 3 recommended crops with detailed information.'),
});
export type CropRecommenderOutput = z.infer<typeof CropRecommenderOutputSchema>;

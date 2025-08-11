
import { z } from 'zod';

export const MarketAnalysisInputSchema = z.object({
  commodity: z.string().min(3, { message: 'Commodity name must be at least 3 characters.' }).optional().or(z.literal('')),
  location: z.string().min(3, { message: 'Location must be at least 3 characters.' }).optional().or(z.literal('')),
  market: z.string().min(3, { message: 'Market name must be at least 3 characters.' }).optional().or(z.literal('')),
  userNotes: z.string().optional(),
  query: z.string().min(10, { message: 'Please provide a more detailed question for a better analysis.' }).describe('The user\'s core question about market conditions, which can be used in addition to the structured fields.'),
  language: z.string().optional().describe('The language for the response (e.g., "Hindi", "Marathi"). Defaults to English if not specified.'),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;


export const MarketAnalysisOutputSchema = z.object({
  marketSummary: z.string().describe('A concise overview of the current market situation for the requested crop and location.'),
  
  corePriceInfo: z.object({
    currentPrice: z.object({
      price: z.number().describe('The current price of the commodity.'),
      unit: z.string().describe('The unit of weight for the price (e.g., "₹/kg", "₹/quintal").'),
      date: z.string().describe('The date for which this price is valid (YYYY-MM-DD).'),
      market: z.string().describe('The specific market/mandi where the price is quoted.'),
    }),
    dailyPriceRange: z.object({
      low: z.number().describe('The lowest price recorded for the day.'),
      high: z.number().describe('The highest price recorded for the day.'),
      unit: z.string().describe('The unit of weight for the price range (e.g., "₹/kg").'),
    }),
  }).describe('The most critical, up-to-date price information.'),

  historicalTrendAnalysis: z.object({
    previousDayPrice: z.object({
      price: z.number().describe('The price from the previous day.'),
      unit: z.string().describe('The unit of weight for the price.'),
      date: z.string().describe("The previous day's date (YYYY-MM-DD)."),
    }),
    priceChange: z.object({
      change: z.number().describe("The absolute change in price from the previous day."),
      percentageChange: z.number().describe("The percentage change from the previous day."),
    }),
    priceTrend: z.object({
      direction: z.enum(["Upward", "Downward", "Stable", "Volatile"]).describe("The direction of the recent price trend."),
      period: z.string().describe("The time period over which this trend was observed (e.g., 'last 3 days', 'last week')."),
    }),
  }).describe('Analysis of price movements over time.'),

  marketDynamics: z.object({
    supplyStatus: z.object({
      status: z.enum(["High", "Moderate", "Low"]).describe("The current supply level in the market."),
      impact: z.string().describe("A brief note on how the supply is affecting the price."),
    }),
    demandStatus: z.object({
      status: z.enum(["Strong", "Moderate", "Weak"]).describe("The current demand level in the market."),
      impact: z.string().describe("A brief note on how the demand is affecting the price."),
    }),
  }).describe('Forces of supply and demand currently at play.'),

  actionableInsight: z.object({
    recommendation: z.string().describe('A concise, actionable suggestion for the farmer (e.g., "Sell now", "Hold").'),
    reasoning: z.string().describe('A brief justification for the given recommendation.'),
  }).describe('Clear advice for the farmer.'),

  additionalInfo: z.object({
    lastUpdated: z.string().datetime().describe('The timestamp of when the data was generated.'),
    dataSource: z.string().describe('The source of the data used for the analysis.'),
  }).describe('Metadata about the analysis.'),
});

export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

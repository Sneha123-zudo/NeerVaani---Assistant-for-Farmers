
import { z } from 'zod';

export const IrrigationSchedulerInputSchema = z.object({
  location: z.string().min(1, 'Location is required.').describe('The geographical location for the crop (e.g., city, state).'),
  landSize: z.string().min(1, 'Land size is required.').describe('The size of the land available (e.g., "2").'),
  landUnit: z.string().min(1, 'Land unit is required.').describe('The unit for the land size (e.g., "acres", "hectares").'),
  lastCrop: z.string().optional().describe('The last crop that was grown on this land.'),
  termPeriod: z.number().min(1, 'Term period is required.').describe('The duration in months that the crop will be cultivated.'),
  rainfall: z.number().optional().describe('The average annual rainfall in millimeters.'),
  soilType: z.string().optional().describe('The type of soil (e.g., "Loamy", "Clay", "Sandy").'),
  soilPh: z.number().optional().describe('The pH level of the soil.'),
  selectedCrop: z.string().min(1, 'A crop must be selected.').describe('The crop that requires an irrigation schedule.'),
  language: z.string().optional().describe('The language for the response (e.g., "Hindi", "Marathi"). Defaults to English if not specified.'),
});

export type IrrigationSchedulerInput = z.infer<typeof IrrigationSchedulerInputSchema>;

const IrrigationEventSchema = z.object({
  date: z.string().describe('The date for the irrigation event in YYYY-MM-DD format.'),
  startTime: z.string().describe('The recommended start time for irrigation in HH:MM format (24-hour).'),
  endTime: z.string().describe('The recommended end time for irrigation in HH:MM format (24-hour).'),
  message: z.string().describe('A detailed, actionable message for the farmer, explaining the task and its importance for that day.'),
});

export const IrrigationSchedulerOutputSchema = z.object({
  schedule: z.array(IrrigationEventSchema).describe('An array of irrigation events.'),
});

export type IrrigationSchedulerOutput = z.infer<typeof IrrigationSchedulerOutputSchema>;

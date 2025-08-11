
import { config } from 'dotenv';
config();

import '@/ai/flows/market-analysis-flow.ts';
import '@/ai/flows/crop-recommender-flow.ts';
import '@/ai/flows/crop-diagnosis-flow.ts';
import '@/ai/flows/irrigation-scheduler-flow.ts';
import '@/ai/flows/government-schemes-flow.ts';
import '@/ai/tools/local-scheme-search-tool.ts';
import '@/ai/flows/conversational-agent-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
import '@/ai/flows/current-crop-agent-flow.ts';
import '@/ai/flows/post-harvest-flow.ts';
    

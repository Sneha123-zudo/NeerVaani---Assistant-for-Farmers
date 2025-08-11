
import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ChatInputSchema = z.object({
  query: z.string().describe("The user's latest message."),
  language: z.string().optional().describe('The language for the response.'),
  history: z.array(MessageSchema).describe("The history of the conversation so far.")
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

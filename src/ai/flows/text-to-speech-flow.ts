'use server';

/**
 * @fileOverview A Text-to-Speech (TTS) flow using Genkit.
 *
 * - textToSpeech - A function that converts a string of text into playable audio data.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import wav from 'wav';

/**
 * Converts raw PCM audio data buffer to a Base64 encoded WAV string.
 * @param pcmData The raw PCM audio data from the TTS model.
 * @param channels Number of audio channels.
 * @param rate Sample rate of the audio.
 * @param sampleWidth Sample width in bytes.
 * @returns A promise that resolves to a Base64 encoded string of the WAV file.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (chunk) => {
      bufs.push(chunk);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The Base64 encoded WAV audio data URI. e.g., 'data:audio/wav;base64,...'"),
});
type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    return textToSpeechFlow(input);
}


const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text }) => {
    if (!text.trim()) {
        return { audioDataUri: '' };
    }

    try {
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
                },
            },
            prompt: text,
        });

        if (!media || !media.url) {
            throw new Error('No audio media returned from TTS model.');
        }
        
        // The media URL is a data URI with raw PCM data
        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );
        
        const wavBase64 = await toWav(audioBuffer);
        
        return {
            audioDataUri: 'data:audio/wav;base64,' + wavBase64,
        };

    } catch (error) {
        console.error("Error in textToSpeechFlow:", error);
        // In case of quota errors or other issues, return an empty audio URI
        // so the client doesn't hang. The error will be logged on the server.
        return { audioDataUri: '' };
    }
  }
);

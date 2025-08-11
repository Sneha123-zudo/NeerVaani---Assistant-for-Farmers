
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast';
import { useLanguage } from '@/context/language-context';
import { languages } from '@/lib/i18n';

interface SpeechToTextOptions {
  onTranscript: (transcript: string) => void;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useSpeechToText({ onTranscript }: SpeechToTextOptions) {
  const { locale } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'Speech recognition is not supported in this browser.',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after first final result
    recognition.interimResults = true; // Get results as they are recognized
    
    // Set language based on current locale
    recognition.lang = locale;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      // Gracefully handle the "no-speech" error, which is common.
      if (event.error === 'no-speech') {
        console.log('No speech detected. Recognition stopped.');
        setIsRecording(false);
        return;
      }
      
      console.error('Speech Recognition Error:', event.error);
      let errorMessage = `Error occurred in recognition: ${event.error}`;
      if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
      }
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description: errorMessage,
      });
      setIsRecording(false);
    };
    
    recognition.onend = () => {
        setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [onTranscript, toast, locale]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
         console.error("Speech recognition could not be started: ", error)
      }
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, startRecording, stopRecording };
}

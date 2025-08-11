
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { startChat, type Message } from '@/ai/flows/conversational-agent-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { languages } from '@/lib/i18n';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Mic, Bot, Send, User, Volume2, VolumeX } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


export function ConversationalAgent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleTranscript = (text: string) => {
    setInput(text);
  };

  const { isRecording, startRecording, stopRecording } = useSpeechToText({ onTranscript: handleTranscript });

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  const speak = async (text: string, autoPlay = false) => {
    stopCurrentAudio(); // Stop any currently playing audio

    if (!text.trim()) return;

    try {
        const { audioDataUri } = await textToSpeech({ text });
        if (audioDataUri) {
          const audio = new Audio(audioDataUri);
          setCurrentAudio(audio);
          
          audio.onplay = () => setIsPlaying(true);
          audio.onpause = () => setIsPlaying(false);
          audio.onended = () => {
            setIsPlaying(false);
            setCurrentAudio(null);
          };

          if (autoPlay) {
            audio.play().catch(e => console.error("Audio playback failed:", e));
          }
        }
    } catch (error) {
        console.error("TTS error:", error);
        toast({
            variant: "destructive",
            title: "Text-to-Speech Failed",
            description: "Could not generate audio for the response."
        });
    }
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    stopCurrentAudio();

    try {
      const currentLanguageName = languages.find(l => l.code === locale)?.name.split(' ')[0] || 'English';
      
      const history: Message[] = [...messages, userMessage];

      const response = await startChat({ 
        query: input,
        language: currentLanguageName,
        history: history.slice(0, -1) // Pass history without the current message
      });

      const aiMessage: Message = { role: 'model', content: response };
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response automatically
      await speak(response, true);

    } catch (error) {
      console.error("Conversational agent error:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t('An unexpected error occurred.'),
      });
      const errorMessage: Message = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Bot /> {t('NeerVaani Chat Assistant')}
        </CardTitle>
        <CardDescription>{t('Ask me anything about farming. I can help with market prices, crop recommendations, government schemes, and more!')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    <p>{t('Start the conversation!')}</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarImage src="/images/Neervaani.png" alt="NeerVaani" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-[75%] rounded-lg p-3 text-sm relative group", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                   {message.role === 'model' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => speak(message.content, true)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.name || 'User'} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
                <div className="flex items-start gap-3 justify-start">
                     <Avatar className="h-8 w-8 border-2 border-primary/50">
                        <AvatarImage src="/images/Neervaani.png" alt="NeerVaani" />
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                        <Loader className="h-5 w-5" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t pt-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Type your message or use the mic..."}
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
           <Button type="button" size="icon" variant="ghost" className={cn(isRecording && 'bg-destructive/20 text-destructive')} onClick={() => isRecording ? stopRecording() : startRecording()}>
            <Mic className="h-5 w-5" />
          </Button>
          {isPlaying && (
            <Button type="button" size="icon" variant="destructive" onClick={stopCurrentAudio}>
              <VolumeX className="h-5 w-5" />
            </Button>
          )}
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

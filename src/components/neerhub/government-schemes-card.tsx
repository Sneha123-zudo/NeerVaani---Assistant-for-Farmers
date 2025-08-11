
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { findSchemes, type GovernmentSchemesInput, type GovernmentSchemesOutput } from '@/ai/flows/government-schemes-flow';
import { GovernmentSchemesInputSchema } from '@/ai/schemas/government-schemes-schemas';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { MicButton } from '@/components/ui/mic-button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { ChevronsUpDown, Landmark, Sparkles, UserCheck, ListChecks, Link as LinkIcon, Bot, Info, FileText, Gift, FileSignature } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { languages } from '@/lib/i18n';

export function GovernmentSchemesCard() {
  const { toast } = useToast();
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [analysis, setAnalysis] = useState<GovernmentSchemesOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<GovernmentSchemesInput>({
    resolver: zodResolver(GovernmentSchemesInputSchema),
    defaultValues: {
      query: '',
      language: '',
    },
  });

  const { isRecording, startRecording, stopRecording } = useSpeechToText({ onTranscript: (t) => form.setValue('query', t) });

  async function onSubmit(values: GovernmentSchemesInput) {
    setLoading(true);
    setAnalysis(null);
    try {
      const currentLanguageName = languages.find(l => l.code === locale)?.name.split(' ')[0] || 'English';
      const result = await findSchemes({...values, language: currentLanguageName});
      setAnalysis(result);

      if (result.schemes.length === 0 && !result.summary.includes("Configuration Error")) {
        toast({
          title: "No Schemes Found",
          description: "The agent couldn't find any specific schemes for your query. Try rephrasing your request.",
        });
      }

    } catch (error: any) {
      console.error(error);
      const description = error.message.includes('503') || error.message.toLowerCase().includes('overloaded')
        ? 'The AI model is currently busy. Please try again in a moment.'
        : 'An unexpected error occurred while searching for schemes.';
      
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description,
      });
    } finally {
      setLoading(false);
    }
  }

  // Helper to render text with bullet points
  const renderWithBullets = (text: string) => {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {text.split(/\n-|\* /).filter(item => item.trim() !== '').map((item, index) => (
          <li key={index}>{item.trim()}</li>
        ))}
      </ul>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Landmark className="text-primary" />
              {t('Government Schemes Agent')}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('Ask about your needs (e.g., "subsidy for tractors") to find relevant government schemes.')}
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-1"><Bot size={14}/> What do you need help with?</FormLabel>
                        <div className="relative">
                            <FormControl>
                            <Textarea placeholder="e.g., I need a subsidy for drip irrigation, help with crop insurance..." {...field} className="pr-10" />
                            </FormControl>
                            <MicButton isRecording={isRecording} onClick={() => isRecording ? stopRecording() : startRecording()} className="absolute right-1 top-2" />
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    <Sparkles className="mr-2" />
                    {loading ? 'Searching...' : 'Find Schemes'}
                </Button>
              </form>
            </Form>

            {loading && (
              <div className="mt-8 flex justify-center">
                <Loader />
              </div>
            )}

            {analysis && (
              <div className="mt-8 space-y-4">
                <Card className="bg-background/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Info /> AI Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                    </CardContent>
                </Card>

                {analysis.schemes.length > 0 && (
                    <>
                        <h3 className="font-headline text-xl">Relevant Schemes Found</h3>
                        <Accordion type="single" collapsible className="w-full">
                        {analysis.schemes.map((scheme, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-3 text-lg text-left">
                                <Landmark className="h-6 w-6 text-primary shrink-0" />
                                <span className="font-semibold">{scheme.schemeName}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="prose prose-sm max-w-none pl-4 border-l-2 border-primary/20 ml-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2"><FileText size={16}/> Details</h4>
                                        <p>{scheme.details}</p>
                                    </div>
                                     <div>
                                        <h4 className="font-semibold flex items-center gap-2"><Gift size={16}/> Benefits</h4>
                                        {renderWithBullets(scheme.benefits)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2"><UserCheck size={16}/> Eligibility</h4>
                                        {renderWithBullets(scheme.eligibility)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2"><ListChecks size={16}/> Application Process</h4>
                                        <p>{scheme.applicationProcess}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2"><FileSignature size={16}/> Documents Required</h4>
                                        {renderWithBullets(scheme.documentsRequired)}
                                    </div>
                                     <div>
                                        <h4 className="font-semibold flex items-center gap-2"><LinkIcon size={16}/> Source Link</h4>
                                        <a href={scheme.sourceLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{scheme.sourceLink}</a>
                                    </div>
                                </div>
                            </AccordionContent>
                            </AccordionItem>
                        ))}
                        </Accordion>
                    </>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

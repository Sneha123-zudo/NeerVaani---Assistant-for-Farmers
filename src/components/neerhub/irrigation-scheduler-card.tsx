
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { getIrrigationSchedule, type IrrigationSchedulerInput, type IrrigationSchedulerOutput } from '@/ai/flows/irrigation-scheduler-flow';
import { IrrigationSchedulerInputSchema } from '@/ai/schemas/irrigation-scheduler-schemas';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { MicButton } from '@/components/ui/mic-button';
import { ChevronsUpDown, CalendarDays, Droplet, MapPin, Ruler, Wind, Bot, RotateCcw, CalendarClock, Leaf, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { languages } from '@/lib/i18n';

export function IrrigationSchedulerCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [analysis, setAnalysis] = useState<IrrigationSchedulerOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<IrrigationSchedulerInput>({
    resolver: zodResolver(IrrigationSchedulerInputSchema),
    defaultValues: {
      location: user?.location || '',
      landSize: '',
      landUnit: 'acres',
      lastCrop: '',
      termPeriod: 3,
      rainfall: undefined,
      soilType: '',
      soilPh: undefined,
      selectedCrop: '',
      language: '',
    },
  });

  const { isRecording: isRecordingLocation, startRecording: startRecordingLocation, stopRecording: stopRecordingLocation } = useSpeechToText({ onTranscript: (t) => form.setValue('location', t) });
  const { isRecording: isRecordingLandSize, startRecording: startRecordingLandSize, stopRecording: stopRecordingLandSize } = useSpeechToText({ onTranscript: (t) => form.setValue('landSize', t) });
  const { isRecording: isRecordingSoilType, startRecording: startRecordingSoilType, stopRecording: stopRecordingSoilType } = useSpeechToText({ onTranscript: (t) => form.setValue('soilType', t) });
  const { isRecording: isRecordingLastCrop, startRecording: startRecordingLastCrop, stopRecording: stopRecordingLastCrop } = useSpeechToText({ onTranscript: (t) => form.setValue('lastCrop', t) });
  const { isRecording: isRecordingCrop, startRecording: startRecordingCrop, stopRecording: stopRecordingCrop } = useSpeechToText({ onTranscript: (t) => form.setValue('selectedCrop', t) });

  async function onSubmit(values: IrrigationSchedulerInput) {
    setLoading(true);
    setAnalysis(null);
    try {
      const currentLanguageName = languages.find(l => l.code === locale)?.name.split(' ')[0] || 'English';
      const result = await getIrrigationSchedule({...values, language: currentLanguageName});
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Scheduling Failed',
        description: 'Could not fetch the irrigation schedule. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const generateGoogleCalendarUrl = (event: {date: string, startTime: string, endTime: string, message: string}) => {
    const createDate = (dateStr: string, timeStr: string) => {
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(Date.UTC(year, month - 1, day, hours, minutes));
    };
    
    const toGoogleISO = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };
    
    const startDate = createDate(event.date, event.startTime);
    const endDate = createDate(event.date, event.endTime);

    const startTimeStr = toGoogleISO(startDate);
    const endTimeStr = toGoogleISO(endDate);

    const eventTitle = `Irrigation: ${form.getValues('selectedCrop')}`;
    const eventDetails = event.message || `Scheduled irrigation for ${form.getValues('selectedCrop')}.`;

    const googleCalendarUrl = new URL('https://www.google.com/calendar/render');
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', eventTitle);
    googleCalendarUrl.searchParams.append('dates', `${startTimeStr}/${endTimeStr}`);
    googleCalendarUrl.searchParams.append('details', eventDetails);
    googleCalendarUrl.searchParams.append('location', form.getValues('location'));

    return googleCalendarUrl.toString();
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <CalendarDays className="text-primary" />
              {t('Irrigation Scheduler Agent')}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('Get an AI-generated irrigation schedule optimized for your farm.')}
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
                
                {/* Primary Inputs */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={form.control} name="selectedCrop" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-1"><Leaf size={14}/> Crop to Irrigate*</FormLabel>
                        <div className="relative">
                            <FormControl><Input placeholder="e.g., Rice, Wheat" {...field} /></FormControl>
                             <MicButton isRecording={isRecordingCrop} onClick={() => isRecordingCrop ? stopRecordingCrop() : startRecordingCrop()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                        </div>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-1"><MapPin size={14}/> Location*</FormLabel>
                        <div className="relative">
                            <FormControl><Input placeholder="e.g., Pune, Maharashtra" {...field} /></FormControl>
                            <MicButton isRecording={isRecordingLocation} onClick={() => isRecordingLocation ? stopRecordingLocation() : startRecordingLocation()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                        </div>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <div className="flex gap-2">
                        <FormField control={form.control} name="landSize" render={({ field }) => (
                            <FormItem className="flex-grow">
                            <FormLabel className="flex items-center gap-1"><Ruler size={14}/> Land Size*</FormLabel>
                            <div className="relative">
                                <FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl>
                                <MicButton isRecording={isRecordingLandSize} onClick={() => isRecordingLandSize ? stopRecordingLandSize() : startRecordingLandSize()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                            </div>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="landUnit" render={({ field }) => (
                            <FormItem className="w-1/3">
                                 <FormLabel>Unit</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="acres">Acres</SelectItem>
                                        <SelectItem value="hectares">Hectares</SelectItem>
                                        <SelectItem value="sqm">Sq. Meters</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="soilType" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-1"><Droplet size={14}/> Soil Type</FormLabel>
                        <div className="relative">
                            <FormControl><Input placeholder="e.g., Loamy, Clay" {...field} /></FormControl>
                            <MicButton isRecording={isRecordingSoilType} onClick={() => isRecordingSoilType ? stopRecordingSoilType() : startRecordingSoilType()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                        </div>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="lastCrop" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-1"><RotateCcw size={14}/> Last Crop Grown</FormLabel>
                        <div className="relative">
                            <FormControl><Input placeholder="e.g., Sugarcane" {...field} /></FormControl>
                            <MicButton isRecording={isRecordingLastCrop} onClick={() => isRecordingLastCrop ? stopRecordingLastCrop() : startRecordingLastCrop()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                        </div>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="termPeriod" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-1"><CalendarClock size={14}/> Cultivation Period*</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select months..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                {[...Array(12)].map((_, i) => <SelectItem key={i} value={String(i + 1)}>{i+1}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? 'Generating Schedule...' : 'Get Irrigation Schedule'}
                </Button>
              </form>
            </Form>

            {loading && (
              <div className="mt-8 flex justify-center">
                <Loader />
              </div>
            )}

            {analysis && (
              <div className="mt-8">
                <h3 className="font-headline text-xl mb-4">Your Irrigation Schedule for {form.getValues('selectedCrop')}</h3>
                 <Card className="bg-background/50">
                    <CardContent className="p-4">
                        <ul className="space-y-4">
                        {analysis.schedule.map((event, index) => (
                            <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-lg bg-card shadow-sm border">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-primary/10 text-primary w-16">
                                        <span className="font-bold text-lg">{format(new Date(event.date.split('T')[0]), 'dd')}</span>
                                        <span className="text-xs uppercase">{format(new Date(event.date.split('T')[0]), 'MMM')}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{event.message}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Recommended time: {event.startTime} - {event.endTime}
                                        </p>
                                    </div>
                                </div>

                                <a
                                  href={generateGoogleCalendarUrl(event)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full sm:w-auto"
                                >
                                  <Button size="sm" variant="outline" className="w-full">
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Add to Calendar
                                  </Button>
                                </a>
                            
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}


'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { recommendCrops, type CropRecommenderInput, type CropRecommenderOutput } from '@/ai/flows/crop-recommender-flow';
import { CropRecommenderInputSchema } from '@/ai/schemas/crop-recommender-schemas';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { MicButton } from '@/components/ui/mic-button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { ChevronsUpDown, Leaf, DollarSign, BrainCircuit, Lightbulb, MapPin, Ruler, Wind, Droplets, Bot, Image as ImageIcon, RotateCcw, CalendarClock, Sprout, TrendingUp, ShieldAlert, TestTube2, CloudSun, Target, Book, HandCoins } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { languages } from '@/lib/i18n';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, content }) => (
    <Card className="bg-muted/30 flex-1">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                {icon}
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{content}</p>
        </CardContent>
    </Card>
);

export function CropRecommenderCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [analysis, setAnalysis] = useState<CropRecommenderOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [soilImagePreview, setSoilImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CropRecommenderInput>({
    resolver: zodResolver(CropRecommenderInputSchema),
    defaultValues: {
      location: user?.location || '',
      landSize: '',
      soilType: '',
      soilPh: undefined,
      temperature: undefined,
      humidity: undefined,
      rainfall: undefined,
      userGoal: 'Maximize profit and yield',
      lastCropGrown: '',
      termPeriod: undefined,
      soilPhotoDataUri: undefined,
      language: '',
    },
  });

  const { isRecording: isRecordingLocation, startRecording: startRecordingLocation, stopRecording: stopRecordingLocation } = useSpeechToText({ onTranscript: (t) => form.setValue('location', t) });
  const { isRecording: isRecordingLandSize, startRecording: startRecordingLandSize, stopRecording: stopRecordingLandSize } = useSpeechToText({ onTranscript: (t) => form.setValue('landSize', t) });
  const { isRecording: isRecordingSoilType, startRecording: startRecordingSoilType, stopRecording: stopRecordingSoilType } = useSpeechToText({ onTranscript: (t) => form.setValue('soilType', t) });
  const { isRecording: isRecordingLastCrop, startRecording: startRecordingLastCrop, stopRecording: stopRecordingLastCrop } = useSpeechToText({ onTranscript: (t) => form.setValue('lastCropGrown', t) });
  const { isRecording: isRecordingUserGoal, startRecording: startRecordingUserGoal, stopRecording: stopRecordingUserGoal } = useSpeechToText({ onTranscript: (t) => form.setValue('userGoal', t) });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
            toast({
                variant: 'destructive',
                title: 'Image too large',
                description: `"${file.name}" is larger than 4MB and was ignored. Please select a smaller file.`,
            });
            return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setSoilImagePreview(dataUri);
        form.setValue('soilPhotoDataUri', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  async function onSubmit(values: CropRecommenderInput) {
    setLoading(true);
    setAnalysis(null);
    try {
      const currentLanguageName = languages.find(l => l.code === locale)?.name.split(' ')[0] || 'English';
      const apiValues: CropRecommenderInput = {
        ...values,
        soilPh: values.soilPh || undefined,
        temperature: values.temperature || undefined,
        humidity: values.humidity || undefined,
        rainfall: values.rainfall || undefined,
        termPeriod: values.termPeriod || undefined,
        language: currentLanguageName,
      };
      const result = await recommendCrops(apiValues);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Recommendation Failed',
        description: 'Could not fetch crop recommendations. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Leaf className="text-primary" />
              {t('Crop Recommender Agent')}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('Get personalized crop recommendations based on your unique farm conditions.')}
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
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><MapPin size={14}/> Location*</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input placeholder="e.g., Pune, Maharashtra" {...field} />
                        </FormControl>
                        <MicButton isRecording={isRecordingLocation} onClick={() => isRecordingLocation ? stopRecordingLocation() : startRecordingLocation()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="landSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Ruler size={14}/> Land Size</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input placeholder="e.g., 2 acres" {...field} />
                        </FormControl>
                        <MicButton isRecording={isRecordingLandSize} onClick={() => isRecordingLandSize ? stopRecordingLandSize() : startRecordingLandSize()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                      </div>
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="soilType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Droplets size={14}/> Soil Type</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input placeholder="e.g., Loamy, Clay" {...field} />
                        </FormControl>
                        <MicButton isRecording={isRecordingSoilType} onClick={() => isRecordingSoilType ? stopRecordingSoilType() : startRecordingSoilType()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                      </div>
                       <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="lastCropGrown" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><RotateCcw size={14}/> Last Crop Grown</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input placeholder="e.g., Sugarcane" {...field} />
                        </FormControl>
                        <MicButton isRecording={isRecordingLastCrop} onClick={() => isRecordingLastCrop ? stopRecordingLastCrop() : startRecordingLastCrop()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                      </div>
                       <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="termPeriod" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><CalendarClock size={14}/> Term Period (Months)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 6" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl>
                       <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Soil Image Upload */}
                 <FormField control={form.control} name="soilPhotoDataUri" render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><ImageIcon size={14}/> Soil Image (Optional)</FormLabel>
                      <CardDescription className="text-xs">Upload an image of your soil for more accurate analysis.</CardDescription>
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          {soilImagePreview ? 'Change Image' : 'Upload Image'}
                        </Button>
                        {soilImagePreview && (
                           <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                              <Image src={soilImagePreview} alt="Soil preview" layout="fill" objectFit="cover" />
                           </div>
                        )}
                      </div>
                      <FormControl>
                          <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />


                {/* Optional Environmental Inputs */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Optional: Provide specific conditions for higher accuracy</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <FormField control={form.control} name="temperature" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input type="number" placeholder="Temp (°C)" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="humidity" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input type="number" placeholder="Humidity (%)" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="rainfall" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input type="number" placeholder="Rainfall (mm)" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="soilPh" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input type="number" step="0.1" placeholder="Soil pH" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                   <FormMessage />
                </div>

                {/* User Goal */}
                <FormField control={form.control} name="userGoal" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Bot size={14}/> What is your primary goal?</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Textarea placeholder="e.g., Maximize profit, improve soil health, conserve water..." {...field} className="pr-10" />
                        </FormControl>
                        <MicButton isRecording={isRecordingUserGoal} onClick={() => isRecordingUserGoal ? stopRecordingUserGoal() : startRecordingUserGoal()} className="absolute right-1 top-2" />
                      </div>
                       <FormMessage />
                    </FormItem>
                  )} />
                
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? 'Thinking...' : 'Get Recommendations'}
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
                <h3 className="font-headline text-xl mb-4">Your Personalized Crop Recommendations</h3>
                <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
                      <AccordionTrigger className="p-4 bg-muted/40 hover:bg-muted/80">
                        <div className="flex items-center gap-3 text-lg">
                          <Leaf className="h-6 w-6 text-primary" />
                          <span className="font-semibold">{rec.cropName}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-6">
                        
                        <InfoCard icon={<Book size={18} />} title="Crop Details" content={rec.cropDetails} />

                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><Sprout size={18} /> Agricultural Guidance</h4>
                            <div className="flex flex-col md:flex-row gap-4">
                                <InfoCard icon={<CalendarClock size={18} />} title="Sowing Time" content={rec.sowingTime} />
                                <InfoCard icon={<Droplets size={18} />} title="Dependency" content={rec.dependency} />
                            </div>
                            <InfoCard icon={<HandCoins size={18} />} title="Resource Allocation" content={rec.resourceAllocation} />
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><TestTube2 size={18} /> Environmental Factors</h4>
                            <div className="flex flex-col md:flex-row gap-4">
                                <InfoCard icon={<Droplets size={18} />} title="Soil Requirements" content={rec.soilRequirements} />
                                <InfoCard icon={<CloudSun size={18} />} title="Weather Conditions" content={rec.weatherConditions} />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <h4 className="font-semibold flex items-center gap-2"><DollarSign size={18} /> Economic Insights</h4>
                             <div className="flex flex-col md:flex-row gap-4">
                                <InfoCard icon={<Target size={18} />} title="Yield Potential" content={rec.yieldPotential} />
                                <InfoCard icon={<TrendingUp size={18} />} title="Market Trends" content={rec.marketTrends} />
                             </div>
                             <InfoCard icon={<Lightbulb size={18} />} title="Profitability" content={rec.profitability} />
                        </div>

                         <div className="space-y-2">
                             <h4 className="font-semibold flex items-center gap-2"><MapPin size={18} /> Regional Specificity</h4>
                            <div className="flex flex-col md:flex-row gap-4">
                               <InfoCard icon={<BrainCircuit size={18} />} title="Location Suitability" content={rec.locationSuitability} />
                               <InfoCard icon={<Ruler size={18} />} title="Regional Performance" content={rec.regionalCropPerformance} />
                            </div>
                        </div>

                        <div className="space-y-2">
                           <h4 className="font-semibold flex items-center gap-2"><ShieldAlert size={18} /> Risk Management</h4>
                           <div className="flex flex-col md:flex-row gap-4">
                               <InfoCard icon={<RotateCcw size={18} />} title="Pest & Disease Management" content={rec.pestAndDiseaseManagement} />
                               <InfoCard icon={<Wind size={18} />} title="Climate Risk" content={rec.climateRisk} />
                           </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

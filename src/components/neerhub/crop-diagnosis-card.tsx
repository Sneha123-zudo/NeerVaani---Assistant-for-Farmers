
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { diagnoseCrop, type CropDiagnosisInput, type CropDiagnosisOutput } from '@/ai/flows/crop-diagnosis-flow';
import { saveDiagnosis } from '@/lib/firebase/services';
import { CropDiagnosisInputSchema } from '@/ai/schemas/crop-diagnosis-schemas';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { MicButton } from '@/components/ui/mic-button';

import { ChevronsUpDown, Microscope, Ruler, FileText, Image as ImageIcon, Sparkles, AlertTriangle, ShieldCheck, Bug, FlaskConical, CircleHelp, Library } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { languages } from '@/lib/i18n';

const HealthStatusCard = ({ status, severity, summary }: CropDiagnosisOutput['healthStatus']) => {
  const statusStyles = {
    'Healthy': 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300',
    'Infected': 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300',
    'At Risk': 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-300',
  };

  const statusIcons = {
    'Healthy': <ShieldCheck className="h-6 w-6 text-green-600" />,
    'Infected': <Bug className="h-6 w-6 text-red-600" />,
    'At Risk': <AlertTriangle className="h-6 w-6 text-yellow-600" />,
  }

  return (
    <Card className={cn('border-2', statusStyles[status])}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {statusIcons[status]}
          Health Status: {status}
        </CardTitle>
        <CardDescription className={cn('dark:!text-current !text-current/80')}>
            Severity: {severity}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-medium">{summary}</p>
      </CardContent>
    </Card>
  );
};


export function CropDiagnosisCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [diagnosis, setDiagnosis] = useState<CropDiagnosisOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CropDiagnosisInput>({
    resolver: zodResolver(CropDiagnosisInputSchema),
    defaultValues: {
      userId: user?.uid,
      photoDataUris: [],
      landSize: '',
      additionalNotes: '',
      language: '',
    },
  });

  const { isRecording: isRecordingLandSize, startRecording: startRecordingLandSize, stopRecording: stopRecordingLandSize } = useSpeechToText({ onTranscript: (t) => form.setValue('landSize', t) });
  const { isRecording: isRecordingNotes, startRecording: startRecordingNotes, stopRecording: stopRecordingNotes } = useSpeechToText({ onTranscript: (t) => form.setValue('additionalNotes', t) });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: string[] = [...imagePreviews];
      const newPhotoUris: string[] = [...form.getValues('photoDataUris')];
      
      const fileArray = Array.from(files);
      let processedFiles = 0;

      fileArray.forEach(file => {
          if (file.size > 4 * 1024 * 1024) { // 4MB limit
            toast({
                variant: 'destructive',
                title: 'Image too large',
                description: `"${file.name}" is larger than 4MB and was ignored.`,
            });
            return; // Skip this file
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUri = reader.result as string;
            newPreviews.push(dataUri);
            newPhotoUris.push(dataUri);
            
            processedFiles++;
            if (processedFiles === fileArray.length) {
                setImagePreviews(newPreviews);
                form.setValue('photoDataUris', newPhotoUris);
                if (newPhotoUris.length > 0) {
                    form.clearErrors('photoDataUris');
                }
            }
          };
          reader.readAsDataURL(file);
      });
    }
  };

  async function onSubmit(values: CropDiagnosisInput) {
    if (values.photoDataUris.length === 0) {
        form.setError('photoDataUris', { type: 'manual', message: 'At least one image of the plant is required.' });
        return;
    }

    setLoading(true);
    setDiagnosis(null);
    setSaved(false);
    try {
      const currentLanguageName = languages.find(l => l.code === locale)?.name.split(' ')[0] || 'English';
      const result = await diagnoseCrop({ ...values, userId: user?.uid, language: currentLanguageName });
      setDiagnosis(result);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || 'An unknown error occurred.';
      if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
         toast({
            variant: 'destructive',
            title: 'AI Model Busy',
            description: 'The AI model is currently overloaded. Please try again in a few moments.',
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'Diagnosis Failed',
            description: 'Could not get a diagnosis. Please check the image and try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSaveDiagnosis = async () => {
    if (!diagnosis) {
        toast({ 
            variant: 'destructive', 
            title: 'Error', 
            description: 'No diagnosis data is available to save.'
        });
        return;
    }

    setSaving(true);
    try {
        await saveDiagnosis({
            photoDataUris: form.getValues('photoDataUris'),
            landSize: form.getValues('landSize') || '',
            additionalNotes: form.getValues('additionalNotes') || '',
            diagnosis: diagnosis,
            createdAt: new Date(),
        });
        setSaved(true);
        toast({
            title: 'Diagnosis Saved!',
            description: 'This diagnosis is now available in the public Digital Library.',
        });
    } catch (error: any) {
        console.error("Failed to save diagnosis:", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: `Could not save the diagnosis to the library. Reason: ${error.message}`,
        });
    } finally {
        setSaving(false);
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Microscope className="text-primary" />
              {t('Crop Diagnosis Agent')}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('Upload photo(s) of your plant to get an instant diagnosis and treatment plan.')}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left Side - Image Upload */}
                    <FormField control={form.control} name="photoDataUris" render={() => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-1"><ImageIcon size={14}/> Plant Photos*</FormLabel>
                             <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                            <Image src={src} alt={`Plant preview ${index + 1}`} layout="fill" objectFit="cover" />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/50 flex items-center justify-center text-center p-2 cursor-pointer hover:border-primary transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
                                            <ImageIcon className="h-6 w-6" />
                                            <span>Add Image</span>
                                        </div>
                                    </button>
                                </div>
                                <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} multiple />
                                <FormMessage />
                            </div>
                        </FormItem>
                    )} />

                    {/* Right Side - Other Inputs */}
                    <div className="space-y-6">
                        <FormField control={form.control} name="landSize" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center gap-1"><Ruler size={14}/> Land Size (Optional)</FormLabel>
                            <div className="relative">
                                <FormControl><Input placeholder="e.g., 2 acres" {...field} /></FormControl>
                                <MicButton isRecording={isRecordingLandSize} onClick={() => isRecordingLandSize ? stopRecordingLandSize() : startRecordingLandSize()} className="absolute right-1 top-1/2 -translate-y-1/2" />
                            </div>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="additionalNotes" render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center gap-1"><FileText size={14}/> Additional Notes (Optional)</FormLabel>
                            <div className="relative">
                                <FormControl><Textarea placeholder="e.g., The spots appeared yesterday after heavy rain." {...field} rows={3} /></FormControl>
                                <MicButton isRecording={isRecordingNotes} onClick={() => isRecordingNotes ? stopRecordingNotes() : startRecordingNotes()} className="absolute right-1 top-2" />
                            </div>
                            </FormItem>
                        )} />
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    <Sparkles className="mr-2" />
                    {loading ? 'Diagnosing...' : 'Get Diagnosis'}
                </Button>
              </form>
            </Form>

            {loading && (
              <div className="mt-8 flex justify-center">
                <Loader />
              </div>
            )}

            {diagnosis && (
              <div className="mt-8 space-y-4">
                <h3 className="font-headline text-xl mb-4">Diagnosis Results</h3>
                
                {/* Card 1: Health Status */}
                <HealthStatusCard {...diagnosis.healthStatus} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 2: Disease Name */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><CircleHelp/> Disease / Pest</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-bold text-xl text-primary">{diagnosis.diseaseIdentification.name}</h4>
                            <p className="mt-2 text-muted-foreground">{diagnosis.diseaseIdentification.description}</p>
                        </CardContent>
                    </Card>

                    {/* Card 3: Symptoms */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><Bug/> Symptoms</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                            <p>{diagnosis.symptoms}</p>
                        </CardContent>
                    </Card>

                     {/* Card 4: Remedies */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><FlaskConical/> Recommended Remedies</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                            <p>{diagnosis.remedies}</p>
                        </CardContent>
                    </Card>

                     {/* Card 5: Prevention */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck/> Prevention Plan</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                            <p>{diagnosis.prevention}</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="pt-4 text-center">
                    <Button
                        size="lg"
                        onClick={handleSaveDiagnosis}
                        disabled={saving || saved}
                    >
                        <Library className="mr-2" />
                        {saved ? 'Saved to Library' : (saving ? 'Saving...' : 'Save Diagnosis to Library')}
                    </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

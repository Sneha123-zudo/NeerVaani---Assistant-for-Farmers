
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { getDiagnosesForUser, type DiagnosisRecord } from '@/lib/firebase/services';
import { Loader } from '@/components/ui/loader';
import { DiagnosisRecordCard } from '@/components/library/diagnosis-record-card';
import { useToast } from '@/hooks/use-toast';
import { BookOpenText, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';


export default function LibraryPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all diagnoses since the library is now public
        const allDiagnoses = await getDiagnosesForUser();
        setDiagnoses(allDiagnoses);
      } catch (error) {
        console.error("Failed to fetch diagnoses:", error);
        setError("Could not fetch the diagnosis library. This is often due to database security rules. Please check your Firebase Firestore rules to ensure the 'diagnoses' collection is publicly readable.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch the diagnosis library.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDiagnoses();
  }, [toast]);


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
              <div>
                  <div className="flex items-center gap-4 mb-4">
                      <BookOpenText className="h-10 w-10 text-primary" />
                      <h1 className="font-headline text-3xl md:text-4xl text-foreground">
                          {t('Digital Library')}
                      </h1>
                  </div>
                  <p className="text-muted-foreground text-lg max-w-3xl">
                      {t('Welcome to our community-driven Digital Library. This is a public knowledge base of past crop diagnoses, solutions, and preventive measures shared by farmers and validated by our AI. Browse through real-world cases to learn, share, and grow together.')}
                  </p>
              </div>
              <div className="hidden lg:block">
                  <Image
                      src="/images/library.png"
                      alt="An illustration of books and plants representing a digital library"
                      width={200}
                      height={200}
                      className="rounded-lg"
                      data-ai-hint="library knowledge"
                  />
              </div>
          </div>

          {loading ? (
             <div className="flex justify-center mt-16">
                <Loader />
             </div>
          ) : error ? (
            <Card className="mt-16 border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle />
                        Error Fetching Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive/90">{error}</p>
                </CardContent>
            </Card>
          ) : diagnoses.length > 0 ? (
            <div className="space-y-6">
              {diagnoses.map((record) => (
                <DiagnosisRecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center justify-center text-center gap-4 p-8 border-2 border-dashed rounded-lg">
                <Info className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Library is Empty</h2>
                <p className="text-muted-foreground max-w-md">
                    No diagnoses have been submitted yet. Be the first to contribute by using the Crop Diagnosis Agent in the NeerHub!
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

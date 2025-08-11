
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/layout/navbar';
import { Loader } from '@/components/ui/loader';
import { WeatherCard } from '@/components/dashboard/weather-card';
import { CropRecommenderCard } from '@/components/neerhub/crop-recommender-card';
import { FeaturesTimeline } from '@/components/dashboard/features-timeline';
import { useLanguage } from '@/context/language-context';
import { ConversationalAgent } from '@/components/dashboard/conversational-agent';
import { CurrentCropAgent } from '@/components/dashboard/current-crop-agent';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-headline font-bold text-3xl md:text-4xl text-foreground mb-4">
                {t('Welcome, %s!', user.name)}
              </h1>
              <h1 className="font-headline font-bold text-2xl md:text-4xl text-foreground mb-4">
                {t("Small Footprints, Big Impact")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("Transforming Agriculture with AI-Powered Sustainability AI-driven insights, smart irrigation, and real-time monitoring for sustainable and efficient agriculture.")}
              </p>
            </div>
            <div className="hidden lg:block w-1/2">
              <Image
                src="/images/Don.png"
                alt="A 3D illustration of a farm"
                width={250}
                height={250}
                className="rounded-lg"
                data-ai-hint="farm illustration"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <WeatherCard location={user.location} />
            </div>
            <div className="lg:col-span-2">
              <ConversationalAgent />
            </div>
             <div className="lg:col-span-3">
               <CurrentCropAgent />
            </div>
            <div className="lg:col-span-3">
              <CropRecommenderCard />
            </div>
          </div>
        </div>
      </main>
      <FeaturesTimeline />
    </div>
  );
}

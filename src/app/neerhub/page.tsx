
'use client';

import { Navbar } from '@/components/layout/navbar';
import { CropDiagnosisCard } from '@/components/neerhub/crop-diagnosis-card';
import { IrrigationSchedulerCard } from '@/components/neerhub/irrigation-scheduler-card';
import { GovernmentSchemesCard } from '@/components/neerhub/government-schemes-card';
import { MarketAnalysisTool } from '@/components/dashboard/market-analysis';
import { useLanguage } from '@/context/language-context';

export default function NeerHubPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-headline text-3xl md:text-4xl text-foreground mb-2">
              {t('NeerHub')}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('Your hub for advanced AI-powered agricultural tools. Select an agent below to get started.')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            <MarketAnalysisTool />
            <GovernmentSchemesCard />
            <IrrigationSchedulerCard />
            <CropDiagnosisCard />
          </div>

        </div>
      </main>
    </div>
  );
}

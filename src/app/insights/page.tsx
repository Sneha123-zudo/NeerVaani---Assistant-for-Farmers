'use client';

import { Navbar } from '@/components/layout/navbar';

export default function InsightsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container max-w-7xl mx-auto">
          <h1 className="font-headline text-3xl md:text-4xl text-foreground mb-4">
            Insights
          </h1>
          <p className="text-muted-foreground text-lg">
            Data visualizations and insights will be displayed here.
          </p>
        </div>
      </main>
    </div>
  );
}

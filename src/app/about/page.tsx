'use client';

import { Navbar } from '@/components/layout/navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container max-w-7xl mx-auto">
          <h1 className="font-headline text-3xl md:text-4xl text-foreground mb-4">
            About NeerVaani
          </h1>
          <p className="text-muted-foreground text-lg">
            Information about the project will go here.
          </p>
        </div>
      </main>
    </div>
  );
}

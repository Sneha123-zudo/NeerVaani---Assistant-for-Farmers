
'use client';

import { useLanguage } from '@/context/language-context';
import { languages } from '@/lib/i18n';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { LanguagesIcon } from 'lucide-react';

export function LanguageSelector() {
  const { setLocale } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shadow-lg">
            <LanguagesIcon className="h-6 w-6" />
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="mb-2">
          {languages.map((lang) => (
            <DropdownMenuItem key={lang.code} onSelect={() => setLocale(lang.code)}>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

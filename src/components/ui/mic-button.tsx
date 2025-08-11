'use client';

import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isRecording?: boolean;
}

export function MicButton({ className, isRecording, ...props }: MicButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn(
        'h-8 w-8 shrink-0 transition-all',
        isRecording && 'bg-destructive/20 text-destructive scale-110',
        className
      )}
      {...props}
    >
      <Mic className="h-4 w-4" />
      <span className="sr-only">Use voice input</span>
    </Button>
  );
}

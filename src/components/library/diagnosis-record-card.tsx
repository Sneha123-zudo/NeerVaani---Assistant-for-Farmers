
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type DiagnosisRecord } from '@/lib/firebase/services';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronsUpDown, Microscope, ShieldCheck, Bug, AlertTriangle, FlaskConical, CircleHelp, Calendar } from 'lucide-react';

const HealthStatusBadge = ({ status }: { status: 'Healthy' | 'Infected' | 'At Risk' }) => {
  const statusStyles = {
    'Healthy': 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300 hover:bg-green-100',
    'Infected': 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300 hover:bg-red-100',
    'At Risk': 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100',
  };

  const statusIcons = {
    'Healthy': <ShieldCheck className="h-4 w-4" />,
    'Infected': <Bug className="h-4 w-4" />,
    'At Risk': <AlertTriangle className="h-4 w-4" />,
  }

  return (
    <Badge variant="outline" className={cn('gap-1.5', statusStyles[status])}>
      {statusIcons[status]}
      {status}
    </Badge>
  )
};

export function DiagnosisRecordCard({ record }: { record: DiagnosisRecord }) {
  const [isOpen, setIsOpen] = useState(false);
  const { diagnosis, createdAt, landSize, additionalNotes } = record;

  // createdAt is now an ISO string, so we create a Date object from it
  const formattedDate = createdAt ? format(new Date(createdAt), 'MMMM d, yyyy') : 'Date not available';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="shadow-md border-primary/10 transition-all hover:border-primary/30">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-center justify-center p-3 rounded-md bg-muted text-primary">
                <Calendar className="h-6 w-6" />
             </div>
             <div>
                <CardTitle className="text-lg font-bold">
                    {diagnosis.diseaseIdentification.name}
                </CardTitle>
                <CardDescription className="text-sm flex items-center gap-2 mt-1">
                    Diagnosed on {formattedDate}
                </CardDescription>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <HealthStatusBadge status={diagnosis.healthStatus.status} />
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><CircleHelp/> Disease / Pest</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-bold text-lg text-primary">{diagnosis.diseaseIdentification.name}</h4>
                        <p className="mt-2 text-muted-foreground text-sm">{diagnosis.diseaseIdentification.description}</p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Bug/> Symptoms Observed</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        <p>{diagnosis.symptoms}</p>
                    </CardContent>
                </Card>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><FlaskConical/> Remedies</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        <p>{diagnosis.remedies}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck/> Prevention</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        <p>{diagnosis.prevention}</p>
                    </CardContent>
                </Card>
             </div>
             {(landSize || additionalNotes) && (
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-base">Your Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        {landSize && <p><strong>Land Size:</strong> {landSize}</p>}
                        {additionalNotes && <p><strong>Additional Notes:</strong> {additionalNotes}</p>}
                    </CardContent>
                </Card>
             )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

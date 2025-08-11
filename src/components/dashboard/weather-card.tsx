
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/language-context";

interface WeatherCardProps {
  location: string | null;
}

const weatherIcons: { [key: string]: React.ReactNode } = {
  Sunny: <Sun className="w-24 h-24 text-accent animate-spin-slow" />,
  "Partly Cloudy": <Cloud className="w-24 h-24 text-muted-foreground/50 animate-float" />,
  Rainy: <CloudRain className="w-24 h-24 text-blue-400 animate-float" />,
  Windy: <Wind className="w-24 h-24 text-muted-foreground/60 animate-pulse" />,
};

const forecast = [
  { day: 'Tomorrow', temp: '28°C', condition: 'Sunny' },
  { day: 'Sat', temp: '25°C', condition: 'Partly Cloudy' },
  { day: 'Sun', temp: '23°C', condition: 'Rainy' },
  { day: 'Mon', temp: '26°C', condition: 'Partly Cloudy' },
  { day: 'Tue', temp: '29°C', condition: 'Sunny' },
];

const forecastIcons: { [key: string]: React.ReactNode } = {
  Sunny: <Sun className="w-8 h-8 text-accent" />,
  "Partly Cloudy": <Cloud className="w-8 h-8 text-muted-foreground/50" />,
  Rainy: <CloudRain className="w-8 h-8 text-blue-400" />,
  Windy: <Wind className="w-8 h-8 text-muted-foreground/60" />,
};

export function WeatherCard({ location }: WeatherCardProps) {
  const { t } = useLanguage();
  const currentCondition = "Partly Cloudy";
  const currentTemp = "26°C";
  const summary = "Mild and pleasant. Good conditions for fieldwork.";
  const windSpeed = "15 km/h";
  const humidity = "68%";
  const uvIndex = "High (7)";
  const soilTemp = "19°C";

  return (
    <Card className="shadow-lg h-full overflow-hidden bg-card/50 backdrop-blur-lg border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('Current Weather')}</CardTitle>
        <CardDescription>{location || t('Your Location')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {weatherIcons[currentCondition]}
          </div>
          <div>
            <p className="text-6xl font-bold font-headline text-foreground">{currentTemp}</p>
            <p className="text-lg text-muted-foreground">{currentCondition}</p>
          </div>
          <p className="text-sm text-foreground/80 max-w-xs">{summary}</p>
        </div>

        <div className="my-6 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 p-2 bg-background/60 rounded-lg">
            <Wind className="w-6 h-6 text-primary animate-pulse"/>
            <div>
              <p className="font-semibold">Wind</p>
              <p className="text-muted-foreground">{windSpeed}</p>
            </div>
          </div>
           <div className="flex items-center gap-2 p-2 bg-background/60 rounded-lg">
            <Droplets className="w-6 h-6 text-primary animate-pulse [animation-delay:-0.5s]"/>
            <div>
              <p className="font-semibold">Humidity</p>
              <p className="text-muted-foreground">{humidity}</p>
            </div>
          </div>
           <div className="flex items-center gap-2 p-2 bg-background/60 rounded-lg">
            <Sun className="w-6 h-6 text-primary animate-spin-slow [animation-delay:-1s]"/>
            <div>
              <p className="font-semibold">UV Index</p>
              <p className="text-muted-foreground">{uvIndex}</p>
            </div>
          </div>
           <div className="flex items-center gap-2 p-2 bg-background/60 rounded-lg">
            <Thermometer className="w-6 h-6 text-primary"/>
            <div>
              <p className="font-semibold">Soil Temp</p>
              <p className="text-muted-foreground">{soilTemp}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="mt-6">
          <h3 className="font-headline text-lg mb-4 text-center">5-Day Forecast</h3>
          <div className="flex justify-around">
            {forecast.map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <p className="font-semibold text-sm">{item.day}</p>
                {forecastIcons[item.condition]}
                <p className="text-sm text-muted-foreground">{item.temp}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

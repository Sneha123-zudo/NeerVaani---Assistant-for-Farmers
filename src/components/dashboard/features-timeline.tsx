'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/context/language-context';

export function FeaturesTimeline() {
  const { t } = useLanguage();
  useEffect(() => {
    const handleScroll = () => {
      const items = document.querySelectorAll('.container-timeline');
      const triggerBottom = window.innerHeight / 5 * 4;

      items.forEach(item => {
        const boxTop = item.getBoundingClientRect().top;
        if(boxTop < triggerBottom) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on load

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      side: 'left',
      title: 'AI-Powered Crop Prediction',
      description: 'Smart Crop Recommendation System predicts the most suitable crops based on real-time environmental conditions. It uses climate data, soil properties, water availability, humidity, pH values, temperature, and topography. Our Water Scarcity Index ensures sustainable farming, and eliminates manual soil testing for N, P, K—making data-driven decisions automatic.',
    },
    {
      side: 'right',
      title: 'Market-Driven Crop Selection',
      description: 'Suggests crops based on demand forecasting for economic profitability. Uses historical pricing data, supply-demand analytics, and government policies to predict future market trends.',
    },
    {
      side: 'left',
      title: 'Regional Water Insights',
      description: 'Get detailed reports on your water usage and explore surface and groundwater availability in your region to make informed, sustainable choices.',
    },
    {
      side: 'right',
      title: 'Precision Irrigation Scheduler (A Key Differentiator)',
      description: 'Provides dynamic irrigation schedules specifying when, how often, and how much water to use. Uses real-time weather forecasts, soil moisture levels, and rainfall predictions to prevent overwatering and reduce water wastage. IoT-based smart systems enable automated irrigation control.',
    },
    {
      side: 'left',
      title: 'Sustainable Farming Practices',
      description: 'Discover eco-friendly farming techniques that boost water efficiency and increase productivity, ensuring long-term agricultural success.',
    },
    {
      side: 'right',
      title: 'Multilingual IVR Support',
      description: 'Accessible in multiple regional languages for ease of use across India.',
    },
  ];

  return (
    <div className="py-12 bg-background">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-headline text-foreground">Our Features</h2>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
          Empowering you with smart tools to track water usage, explore regional insights, and adopt sustainable agricultural practices. Dive into the world of water-conscious living today!
        </p>
      </div>

      <div className="timeline-section">
        <div className="timeline">
          {features.map((feature, index) => (
            <div key={index} className={`container-timeline ${feature.side}`}>
              <div className="content-timeline">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

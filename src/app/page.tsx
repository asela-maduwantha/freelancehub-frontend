"use client";

import React from 'react';
import {
  Hero,
  Features,
  HowItWorks,
  Testimonials,
  FAQ,
  CTA
} from '../components/features/landing';

const App: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
};

export default App;

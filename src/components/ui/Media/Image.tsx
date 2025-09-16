import React from 'react';
import Image from 'next/image';

const HeroIllustration: React.FC = () => {
  return (
    <div className="relative">
      <Image
        src="/images/hero-illustration.png"
        alt="Hero Illustration"
        width={500}
        height={500}
        className="w-full h-auto rounded-lg shadow-2xl"
      />
    </div>
  );
};

export default HeroIllustration;
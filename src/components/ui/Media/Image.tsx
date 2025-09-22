import React from 'react';
import Image from 'next/image';

const HeroIllustration: React.FC = () => {
  return (
    <div className="relative">
      <Image
        src="/images/hero-illustration.png"
        alt="Freelance collaboration illustration"
        width={600}
        height={600}
        className="w-full h-auto drop-shadow-2xl"
        priority
        style={{
          filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))'
        }}
      />
    </div>
  );
};

export default HeroIllustration;
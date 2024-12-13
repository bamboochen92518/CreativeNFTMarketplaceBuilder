'use client';
import React from 'react';
import DescriptionBlock from '@/components/description-block';

const Page = (): React.JSX.Element => {
  return (
    <div id="intro" className="p-8">
      <DescriptionBlock
        title="Introduction"
        content={(
          <div className='flex flex-col gap-4'>
            <p>
              Welcome to the Museum of the Future, where creativity meets innovation! We’re thrilled to introduce the Creative NFT Marketplace Builder, your gateway to a new era of artistic expression and digital ownership. This is not just a marketplace—it’s a platform designed for creators like you to bring your ideas to life, transform them into unique NFTs, and share them with a global community that values creativity and originality.
            </p>
            <p>
              Whether you’re an experienced artist or just beginning your journey, our platform empowers you to showcase your work, monetize your creativity, and connect with collectors from all over the world. With just a wallet and a few clicks, you can turn your vision into a reality, build your own brand, and leave a lasting mark in the digital art landscape.
            </p>
            <p>
              At the Museum of the Future, we believe in breaking barriers and creating opportunities for artists of all backgrounds to thrive. Join us on this exciting adventure and take your first step toward redefining how art is shared, appreciated, and valued. Let’s shape the future together!
            </p>
          </div>
        )}
        imageSrc="/images/CNMB.png"
        imageAlt="Placeholder Image"
      />
      <DescriptionBlock
        title="Tokenomics"
        content={(
          <div className='flex flex-col gap-4'>
            <p>
              CNMC will serve as the official token for the CNMB platform, playing a vital role in driving its growth and supporting its continuous development. It’s not just a token—it’s the backbone of the CNMB ecosystem, empowering users and creators alike to engage seamlessly within the platform.
            </p>
            <p>
              For users, CNMC will act as the primary currency, enabling effortless transactions such as buying, selling, and trading NFTs. Whether you're a collector acquiring unique digital assets or an artist monetizing your creative work, CNMC ensures a smooth and efficient marketplace experience. By integrating CNMC into the platform, we aim to create a dynamic, user-driven ecosystem that fosters creativity, innovation, and meaningful exchanges within the NFT community.</p>
          </div>
        )}
        imageSrc="/images/CNMC.png"
        imageAlt="Placeholder Image"
        reverse
      />
      <DescriptionBlock
        title="Future Work"
        content={(
          <div className='flex flex-col gap-4'>
            <p>
              Looking ahead, CNMB is designed to empower artists by providing them with a platform to showcase and monetize their creativity, while CNMC will serve as the driving force that sustains and supports the CNMB ecosystem. Together, they create a symbiotic relationship that fosters innovation, collaboration, and growth.
            </p>
            <p>
              Our mission goes beyond just building a platform; we are committed to making a positive impact on the world. By supporting artists and connecting them with a global audience, we aim to create opportunities, inspire creativity, and bring communities closer together. We envision a brighter, more inclusive future where art and technology intersect to drive meaningful change.
            </p>
            <p>
              Join us on this transformative journey, as we work together to make the world a better, more creative place. The future is bright, and with your support, the possibilities are limitless.
            </p>
          </div>
        )}
        imageSrc="/images/future.png"
        imageAlt="Placeholder Image"
      />
    </div>
  );
}

export default Page;

import React from 'react';
import Image from 'next/image';

const DescriptionBlock = ({
  title, content, imageSrc, imageAlt, reverse = false
}: {
  title: string;
  content: React.JSX.Element;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean; }
): React.JSX.Element => {
  return (
    <section className={`
      section flex justify-between items-center opacity-100 transform-none transition-opacity duration-500 
      ease-in-out mb-8 p-8 bg-gray-800 border border-gray-300 rounded-lg shadow-lg text-left
      ${reverse ? 'flex-row-reverse' : ''}
    `}>
      <div className="flex-1">
        <p className="text-2xl font-bold px-4 bg-black bg-opacity-10 rounded-lg mb-4">{title}</p>
        <div className="text-lg leading-7 px-4 bg-black bg-opacity-5 rounded-lg">
          {content}
        </div>
      </div>
      <div className="flex-0.5 flex justify-center items-center">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={300}
          height={300}
          layout="intrinsic"
          className="section_image max-w-full h-auto"
        />
      </div>
    </section>
  );
};

export default DescriptionBlock;

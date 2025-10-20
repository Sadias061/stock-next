import Image from "next/image";
import React from "react";
interface ProducImageProps {
  src: string;
  alt: string;
  widthClass?: string;
  heightClass?: string;
}

const ProducImage: React.FC<ProducImageProps> = ({
  src,
  alt,
  widthClass,
  heightClass,
}) => {
  return (
    <div className="avatar">
      <div
        className={`mask mask-squircle ${heightClass} ${widthClass} rounded-lg overflow-hidden`}
      >
        <Image
          src={src}
          alt={alt}
          width={500}
          height={500}
          quality={100}
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};

export default ProducImage;

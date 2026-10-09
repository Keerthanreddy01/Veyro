import React, { CSSProperties, ImgHTMLAttributes } from 'react';

export interface StaticImageData {
  src: string;
  height?: number;
  width?: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | StaticImageData | any;
  alt?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
  style?: CSSProperties;
}

const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  width,
  height,
  fill,
  priority,
  unoptimized,
  className,
  style,
  ...rest
}) => {
  let imgSrc = '';
  let defaultWidth: number | string | undefined = width;
  let defaultHeight: number | string | undefined = height;

  if (typeof src === 'string') {
    imgSrc = src;
  } else if (src && typeof src === 'object') {
    imgSrc = src.src || src.default || '';
    if (defaultWidth === undefined && src.width) defaultWidth = src.width;
    if (defaultHeight === undefined && src.height) defaultHeight = src.height;
  }

  const combinedStyle: CSSProperties = fill
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
        objectFit: 'cover',
        ...style,
      }
    : {
        ...style,
      };

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={fill ? undefined : defaultWidth}
      height={fill ? undefined : defaultHeight}
      loading={priority ? 'eager' : 'lazy'}
      className={className}
      style={combinedStyle}
      {...rest}
    />
  );
};

export default Image;
export { Image };

import Image from 'next/image';
import Link from 'next/link';

interface InsideCocokitsFeatureProps {
  title: string;
  description: string;
  svgSrc: string;
  linkText: string;
  href: string;
}
export function InsideCocokitsFeature({ title, description, svgSrc, linkText, href }: InsideCocokitsFeatureProps) {
  return (
    <div className="inside-cocokits__feature">
      <Image className="inside-cocokits__feature-image" src={svgSrc} alt={title} width="446" height="336" />
      <b>{title}</b>
      <p>{description}</p>
      <Link href={href}>{linkText}</Link>
    </div>
  );
}

import Link from "next/link";

interface InsideCocokitsFeatureProps {
  title: string;
  description: string;
  svgComponent: React.FC<void>;
  linkText: string;
  href: string;
}
export function InsideCocokitsFeature({ title, description, svgComponent, linkText, href }: InsideCocokitsFeatureProps) {
  return (
    <div className="inside-cocokits__feature">
      <div className="inside-cocokits__feature-image">
        {svgComponent()}
      </div>
      <b>{title}</b>
      <p>{description}</p>
      <Link href={href}>{linkText}</Link>
    </div>
  );
}
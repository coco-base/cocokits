import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collaboration • CocoKits',
  description:
    'Join CocoKits, an innovative open-source project focused on building robust design systems and reusable npm packages. We’re looking for passionate developers, designers, and marketers to collaborate with us. Whether you specialize in Angular, React, Vue, UX design, or social media marketing, this is your chance to contribute to a meaningful project, grow your skills, and potentially become a co-founder. Work remotely with a friendly, international team and make an impact in the open-source community. Apply now and let’s build something amazing together!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">

      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
      </head>

      <body>
        <div style={{ margin: '0 48px', maxWidth: '1200px', padding: '0 24px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}

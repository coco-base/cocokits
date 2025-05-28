/* eslint-disable max-lines-per-function */
import Image from 'next/image';
import Link from 'next/link';

export default function Index() {
  return (
    <>
      <Link href="/">
        <Image
          src="/cocokits-full-logo-light.svg"
          className="mb-xl mt-md"
          width={208}
          height={42}
          alt="CocoKits Logo"
        />
      </Link>

      <header>
        <h1>Join CocoKits: Collaborate on an Open-Source Project</h1>
      </header>

      <section>
        <h2>About CocoKits</h2>
        <p>
          CocoKits is an open-source project focused on building robust design systems and reusable npm packages. Our
          goal is to create tools that empower developers and designers to build better, faster, and more scalable
          applications. We’re a small, distributed, and international team working together to make a meaningful impact
          in the open-source community.
        </p>
        <p>
          This is a <strong>volunteer-based opportunity</strong> at the moment, as we’re in the early stages of the
          project. However, we’re working towards securing sponsorships and clients, which will allow us to offer
          financial compensation in the future. In the meantime, this is a fantastic opportunity to:
        </p>
        <ul>
          <li>Gain hands-on experience with cutting-edge technologies.</li>
          <li>Build your portfolio and showcase your contributions.</li>
          <li>Collaborate with a friendly and supportive team.</li>
          <li>Make a lasting impact on the open-source community.</li>
        </ul>
      </section>

      <section>
        <h2>Roles We’re Looking For</h2>
        <p>We’re currently seeking collaborators for the following roles:</p>
        <h3>1. Frontend Developers</h3>
        <ul>
          <li>
            <strong>Skills Needed:</strong> Angular, React, Vue, TypeScript, HTML, CSS
          </li>
          <li>
            <strong>Responsibilities:</strong> Develop and test UI components, build reusable code and libraries, and
            contribute to the design system.
          </li>
        </ul>
        <h3>2. Designers</h3>
        <ul>
          <li>
            <strong>Skills Needed:</strong> UI/UX design, Figma, Adobe XD, or similar tools
          </li>
          <li>
            <strong>Responsibilities:</strong> Create visually appealing and user-friendly designs for our components
            and documentation.
          </li>
        </ul>
        <h3>3. Social Media Admin</h3>
        <ul>
          <li>
            <strong>Skills Needed:</strong> Social media management, content creation, community engagement
          </li>
          <li>
            <strong>Responsibilities:</strong> Grow our online presence, engage with the community, and promote our
            project.
          </li>
        </ul>
        <h3>4. Marketing Specialist</h3>
        <ul>
          <li>
            <strong>Skills Needed:</strong> Digital marketing, SEO, content strategy, outreach
          </li>
          <li>
            <strong>Responsibilities:</strong> Help us attract sponsors, clients, and contributors through effective
            marketing strategies.
          </li>
        </ul>
      </section>

      <section>
        <h2>Why Join CocoKits?</h2>
        <ul>
          <li>
            <strong>Be Part of the Core Team:</strong> Join us as a core contributor and play a key role in shaping the
            future of CocoKits.
          </li>
          <li>
            <strong>Opportunity to Become a Co-Founder:</strong> Demonstrate your commitment and skills, and you could
            have the opportunity to become a co-founder of the project.
          </li>
          <li>
            <strong>Collaborate with Experts:</strong> Work alongside experienced developers and designers to expand
            your skill set.
          </li>
          <li>
            <strong>Innovate:</strong> Be part of a project that values creativity and innovation.
          </li>
          <li>
            <strong>Community Impact:</strong> Contribute to open-source tools that benefit developers worldwide.
          </li>
          <li>
            <strong>Flexibility:</strong> Enjoy the freedom of working remotely from anywhere in the world.
          </li>
          <li>
            <strong>Recognition:</strong> Your name and profile will be featured as part of the team, enhancing your
            professional portfolio.
          </li>
          <li>
            <strong>Learning Opportunity:</strong> If you’re a junior developer or designer, don’t worry! We’ll help you
            learn and grow as you contribute to the project.
          </li>
        </ul>
      </section>

      <section>
        <h2>Technologies We Use</h2>
        <ul>
          <li>
            <strong>Frameworks:</strong> Angular, React, Vue
          </li>
          <li>
            <strong>Design Tools:</strong> Figma
          </li>
          <li>
            <strong>Development Tools:</strong> Nx Mono-Repository, Storybook, and other cutting-edge technologies.
          </li>
        </ul>
      </section>

      <section>
        <h2>We’re Looking for Partners</h2>
        <p>
          At CocoKits, we’re not just looking for contributors—we’re looking for <strong>partners</strong> to join our
          team and take ownership of specific areas of the project. Whether you’re passionate about React, Angular, Vue,
          UX design, or any other aspect of the project, we’d love to have you lead and grow with us. This is your
          chance to make a significant impact and shape the future of CocoKits.
        </p>
      </section>

      <section>
        <h2>How to Join the Team</h2>
        <p>We’re excited to welcome new members! Here’s our process:</p>
        <ol>
          <li>
            <strong>Assignment:</strong> We’ll send you a small task or project to complete. This could be a
            mini-application, a design mockup, or a marketing strategy, depending on your role.
          </li>
          <li>
            <strong>Submission:</strong> Complete the assignment within 48 hours and share your work (e.g., GitHub
            repository, Figma file, or document).
          </li>
          <li>
            <strong>Meeting:</strong> If your submission aligns with our goals, we’ll schedule a meeting to get to know
            you better and discuss the project in detail.
          </li>
          <li>
            <strong>Onboarding:</strong> Once selected, you’ll join a group onboarding session to meet the team and
            learn about our workflows.
          </li>
        </ol>
      </section>

      <hr />

      <section>
        <h2>How to Apply</h2>
        <p>
          If you’re excited about the opportunity to contribute to a meaningful project and grow your skills, we’d love
          to hear from you!
        </p>
        <p>
          <strong>Email your details and resume to:</strong> <a href="mailto:hello@cocokits.com">hello@cocokits.com</a>
        </p>
        <p>Let’s create something amazing together!</p>
      </section>

      <footer>
        <h2>Let’s Grow Together</h2>
        <p>
          At CocoKits, we believe in the power of collaboration and community. By joining us, you’ll not only contribute
          to an exciting project but also become part of a team that values innovation, creativity, and growth. Whether
          you’re a seasoned professional or a junior looking to learn, we’re here to support you every step of the way.
          Let’s build something incredible—together!
        </p>
      </footer>
    </>
  );
}

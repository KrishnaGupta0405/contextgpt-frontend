import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "ContextGPT | Acceptable Use Policy",
  description: "Read ContextGPT's Acceptable Use Policy — guidelines on prohibited content and usage.",
  alternates: { canonical: "https://contextgpt.in/legal/acceptable-use" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Acceptable Use Policy",
    description: "Read ContextGPT's Acceptable Use Policy.",
    url: "https://contextgpt.in/legal/acceptable-use",
  },
};

export default function AcceptableUsePolicy() {
  return (
    <div className="bg-white">
      <div className="bg-linear-to-b from-indigo-50/70 to-white py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-4">
        <AnimatedGridPattern
            numSquares={10}
            maxOpacity={0.1}
            duration={2}
            repeatDelay={1}
            height={180}
            width={180}
            className={cn(
              "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-20%] h-full "
            )}
          />
          {/* Hero */}
          <div className="p-32 flex justify-center items-center flex-col gap-4 ">
            <p className="text-center text-sm font-bold text-blue-600">Acceptable Use Policy</p>
            <h1 className="text-center text-6xl">Acceptable Use Policy</h1>
            <p className="text-center text-xl pt-4 text-gray-500">
              Guidelines on responsible and acceptable use of ContextGPT.
            </p>
          </div>
      </div>
      <article className="prose prose-slate mx-auto max-w-3xl px-6">

        <h2>Introduction</h2>
        <p>
          ContextGPT (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to providing a safe,
          responsible, and compliant platform. This Acceptable Use Policy sets clear expectations for how our
          service should be used. By using ContextGPT, you agree to comply with this policy and our{" "}
          <Link href="https://contextgpt.in/legal/terms" className="text-black underline">Terms of Service</Link>.
        </p>

        <h2>Adult & NSFW Content</h2>
        <p>
          ContextGPT strictly prohibits the generation, distribution, or request of sexually explicit,
          pornographic, or NSFW (Not Safe for Work) content. This includes:
        </p>
        <ul>
          <li>Sexually explicit images, videos, or text descriptions.</li>
          <li>Pornographic or adult-oriented material of any kind.</li>
          <li>Sexually suggestive content intended to be sexually arousing or gratifying.</li>
          <li>Non-consensual intimate imagery or deepfake sexual content.</li>
          <li>Solicitation or facilitation of sexual services.</li>
        </ul>
        <p>
          Violations of this policy will result in immediate account suspension and potential permanent termination.
        </p>

        <h2>Illegal Activities</h2>
        <p>
          ContextGPT is not to be used for any illegal purposes. Prohibited activities include:
        </p>
        <ul>
          <li>Generation or distribution of illegal content or instructions.</li>
          <li>Facilitation of drug production, trafficking, or sales.</li>
          <li>Money laundering, fraud, or financial crimes.</li>
          <li>Planning, encouraging, or assisting in criminal activities.</li>
          <li>Bypassing, circumventing, or hacking security systems.</li>
          <li>Copyright infringement, piracy, or intellectual property theft.</li>
          <li>Tax evasion or other tax-related crimes.</li>
        </ul>

        <h2>Harassment & Hate</h2>
        <p>
          You may not use ContextGPT to harass, bully, or promote hatred against individuals or groups.
          This includes:
        </p>
        <ul>
          <li>Hate speech targeting individuals based on protected characteristics (race, religion, ethnicity, gender, sexual orientation, disability, etc.).</li>
          <li>Harassment, cyberbullying, or targeting specific individuals.</li>
          <li>Doxxing or publishing private information without consent.</li>
          <li>Coordinated campaigns to harm, defame, or harass others.</li>
          <li>Discrimination or exclusion based on protected characteristics.</li>
          <li>Slurs, derogatory language, or dehumanizing speech.</li>
        </ul>

        <h2>Violence</h2>
        <p>
          ContextGPT prohibits content that promotes, glorifies, or facilitates violence:
        </p>
        <ul>
          <li>Instructions or encouragement for violence against people or animals.</li>
          <li>Glorification of violence, terrorism, or violent extremism.</li>
          <li>Content promoting or inciting mass violence, terrorism, or armed conflict.</li>
          <li>Graphic depictions of violence intended to shock or harm.</li>
          <li>Planning or coordination of violent activities.</li>
          <li>Weapons development or enhancement for harmful purposes.</li>
        </ul>

        <h2>Self-harm</h2>
        <p>
          ContextGPT prohibits content that encourages, promotes, or provides instructions for self-harm:
        </p>
        <ul>
          <li>Encouragement or instruction for suicide or self-injury.</li>
          <li>Promotion of eating disorders or other self-harming behaviors.</li>
          <li>Content that glorifies suicide, self-mutilation, or self-harm.</li>
          <li>Instructions for methods of self-harm without clear harm-reduction intent.</li>
        </ul>

        <h2>Malware & Phishing</h2>
        <p>
          You may not use ContextGPT to create, distribute, or assist in the creation of malicious software
          or phishing schemes:
        </p>
        <ul>
          <li>Creation or distribution of malware, viruses, trojans, or other malicious code.</li>
          <li>Phishing schemes designed to steal credentials or personal information.</li>
          <li>Social engineering attacks or credential harvesting.</li>
          <li>Development of tools specifically designed to exploit vulnerabilities maliciously.</li>
          <li>Ransomware creation or distribution.</li>
          <li>Botnet development or deployment.</li>
        </ul>

        <h2>Spam</h2>
        <p>
          ContextGPT prohibits spam and unsolicited bulk communications:
        </p>
        <ul>
          <li>Unsolicited mass email, messaging, or marketing campaigns.</li>
          <li>Comment spam or forum spam designed to manipulate rankings or deceive.</li>
          <li>Automated scraping of content or user data.</li>
          <li>Duplicate or repetitive postings across multiple channels.</li>
          <li>Manipulative or deceptive ranking schemes (SEO spam, link farms, etc.).</li>
        </ul>

        <h2>Intellectual Property</h2>
        <p>
          You may not use ContextGPT to infringe upon intellectual property rights:
        </p>
        <ul>
          <li>Reproducing, distributing, or plagiarizing copyrighted content without permission.</li>
          <li>Using trademarks, logos, or brand assets without authorization.</li>
          <li>Patent infringement or unauthorized use of patented methods.</li>
          <li>Theft of trade secrets or confidential information.</li>
          <li>Passing off others&apos; creative work as your own.</li>
        </ul>

        <h2>Enforcement</h2>
        <p>
          ContextGPT reserves the right to:
        </p>
        <ul>
          <li>Monitor user activity for compliance with this policy.</li>
          <li>Suspend or terminate accounts that violate this policy.</li>
          <li>Remove or disable access to prohibited content.</li>
          <li>Report violations to appropriate legal authorities when necessary.</li>
          <li>Refuse service to users or organizations engaged in prohibited activities.</li>
        </ul>
        <p>
          Violations may result in <strong>immediate suspension or permanent termination of your account without notice</strong>,
          forfeiture of any remaining credits or balances, and potential legal action depending on the severity
          and nature of the violation.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Acceptable Use Policy or believe someone is violating it,
          please contact us at{" "}
          <a href="mailto:support@contextgpt.in">support@contextgpt.in</a>.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Acceptable Use Policy at any time. Changes will be effective immediately
          upon posting to the site. Your continued use of ContextGPT after any updates indicates your
          acceptance of the revised policy.
        </p>

      </article>
    </div>
  );
}

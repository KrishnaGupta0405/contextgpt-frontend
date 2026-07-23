import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "ContextGPT | Subprocessors",
  description: "List of third-party subprocessors used by ContextGPT to deliver its services.",
  alternates: { canonical: "https://contextgpt.co/legal/subprocessors" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Subprocessors",
    description: "List of third-party subprocessors used by ContextGPT.",
    url: "https://contextgpt.co/legal/subprocessors",
  },
};

export default function Subprocesses() {
  return (
    <div className="bg-white ">
      <div className="bg-linear-to-b from-indigo-50/70 to-white px-4 py-16 sm:py-6 md:py-8 sm:px-6 lg:px-8">
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
            <p className="text-center text-sm font-bold text-blue-600">Subprocessors</p>
            <h1 className="text-center text-6xl">Subprocessors</h1>
            <p className="text-center text-xl pt-4 text-gray-500">
              List of third-party service providers (subprocessors) used by ContextGPT<br/> to deliver our services.
            </p>
    </div>
    </div>
      <article className="prose prose-slate mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Intro */}
        <h2>Current Subprocessors</h2>
        <p>
          ContextGPT uses the following third-party service providers
          (subprocessors) to deliver our services. This list is maintained in
          accordance with our Data Processing Agreement obligations.
        </p>
        <p>
          <strong>Last Updated:</strong>{" "}
          <span className="text-blue-600">March 2026</span>
        </p>

        <hr />

        {/* Infrastructure & Hosting */}
        <h2>Infrastructure &amp; Hosting</h2>
        <table>
          <thead>
            <tr>
              <th>Subprocessor</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-blue-600">Amazon Web Services (AWS) - EC2.</td>
              <td>
                Application hosting, content delivery, file storage, and
                security
              </td>
              <td className="text-blue-600">Global</td>
            </tr>
            <tr>
              <td className="text-blue-600">Amazon Web Services (AWS) - RDS </td>
              <td>Database hosting (PostgreSQL)</td>
              <td className="text-blue-600">United States East (N. Virginia)</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Data Storage & Processing */}
        <h2>Data Storage &amp; Processing</h2>
        <table>
          <thead>
            <tr>
              <th>Subprocessor</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-blue-600">Pinecone Systems, Inc.</td>
              <td>Vector database for AI embeddings</td>
              <td className="text-blue-600">United States (AWS)</td>
            </tr>
            <tr>
              <td className="text-blue-600">
                Amazon Web Services (AWS) - EC2
              </td>
              <td>
                Redis caching, and queue processing, YouTube content processing
              </td>
              <td className="text-blue-600">
                United States East (N. Virginia)
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* AI & Machine Learning */}
        <h2>AI &amp; Machine Learning</h2>
        <table>
          <thead>
            <tr>
              <th>Subprocessor</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
           <tr>
            <td className="text-blue-600">OpenAI</td>
            <td>
              AI language model processing and embeddings generation
            </td>
            <td className="text-blue-600">United States</td>
          </tr>
          </tbody>
        </table>

        <hr />

        {/* Content Processing */}
        <h2>Content Processing</h2>
        <table>
          <thead>
            <tr>
              <th>Subprocessor</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-blue-600">Firecrawl</td>
              <td>Web content scraping and processing</td>
              <td className="text-blue-600">United States</td>
            </tr>
            <tr>
              <td className="text-blue-600">Supadata</td>
              <td>YouTube content processing</td>
              <td className="text-blue-600">United States</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Observability & Analytics */}
        <h2>Observability &amp; Analytics</h2>
        <table>
          <thead>
            <tr>
              <th>Subprocessor</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {/* <tr>
              <td className="text-blue-600">Portkey AI</td>
              <td>AI observability and logging</td>
              <td className="text-blue-600">United States</td>
            </tr> */}
            <tr>
              <td className="text-blue-600">PostHog</td>
              <td>Product analytics</td>
              <td className="text-blue-600">United States</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Email & Communications */}
        <h2>Email &amp; Communications</h2>
        <table>
          <thead>
            <tr>
              <th>Subprocessor</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-blue-600">Resend</td>
              <td>Email marketing and communications</td>
              <td className="text-blue-600">United States</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Payments */}
        <h2>Payments</h2>
        <table>
          <thead>
            <tr>
              <th>Subprocessor</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-blue-600">Polar</td>
              <td>Payment processing (Merchant of Record)</td>
              <td className="text-blue-600">Sweden</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* Changes */}
        <h2>Changes to Subprocessors</h2>
        <p>
          We may update this list from time to time as our service evolves.
          Please review this page periodically for any changes.
        </p>

        {/* Questions */}
        <h2>Questions</h2>
        <p>
          If you have any questions about our subprocessors or data processing
          practices, please contact us at{" "}
          <span className="underline text-black font-semibold">support@contextgpt.co</span>.
        </p>
      </article>
    </div>
  );
}

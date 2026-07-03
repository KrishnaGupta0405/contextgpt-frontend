import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import Link from "next/link";
export const metadata = {
  title: "ContextGPT | Terms & Conditions",
  description: "Read ContextGPT's Terms & Conditions — the rules governing use of our platform and services.",
  alternates: { canonical: "https://contextgpt.in/legal/terms" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Terms & Conditions",
    description: "Read ContextGPT's Terms & Conditions.",
    url: "https://contextgpt.in/legal/terms",
  },
};

export default function Terms() {
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
            <p className="text-center text-sm font-bold text-blue-600">Terms and Conditions</p>
            <h1 className="text-center text-6xl">Terms and Conditions</h1>
            <p className="text-center text-xl pt-4 text-gray-500">
              By continuing to use our platform, you agree to these terms and conditions.
            </p>
          </div>
      </div>
      <article className="prose prose-slate mx-auto max-w-3xl px-6">

        <h2>Introduction</h2>
        <p>
          Welcome to ContextGPT, operated by Krishna Gupta and team (&ldquo;Company&rdquo;,
          &ldquo;us&rdquo;, &ldquo;we&rdquo;, or &ldquo;our&rdquo;)!
        </p>
        <p>
          Below are our Terms of Service, we invite you to carefully read the
          following pages. It will take you approximately 4-5 minutes.
        </p>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;, &ldquo;Terms of
          Service&rdquo;) govern your use of our web pages located at{" "}
          <Link href="http://contextgpt.in/" className="text-black underline">https://contextgpt.in/</Link> operated by ContextGPT.
        </p>
        <p>
          Our Privacy Policy also governs your use of our Service and explains
          how we collect, safeguard and disclose information that results from
          your use of our web pages. Please read it{" "}
          <Link href="https://contextgpt.in/legal/privacy" className="text-black underline">https://contextgpt.in/legal/privacy</Link>.
        </p>
        <p>
          Your agreement with us includes these Terms and our Privacy Policy
          (&ldquo;Agreements&rdquo;). You acknowledge that you have read and
          understood Agreements, and agree to be bound of them.
        </p>
        <p>
          If you do not agree with (or cannot comply with) Agreements, then you
          may not use the Service, but please let us know by emailing at{" "}
          <span className="underline text-black font-semibold">support@contextgpt.in</span> so
          we can try to find a solution. These Terms apply to all visitors,
          users and others who wish to access or use Service.
        </p>

        <h2>Communications</h2>
        <p>
          By creating an Account on our Service, you agree to subscribe to
          newsletters, marketing or promotional materials and other information
          we may send. However, you may opt out of receiving any, or all, of
          these communications from us by following the unsubscribe link or by
          emailing at{" "}
          <span className="underline text-black font-semibold">support@contextgpt.in</span>.
        </p>

        <h2>Purchases</h2>
        <p>
          If you wish to purchase any product or service made available through
          Service (&ldquo;Purchase&rdquo;), you may be asked to supply certain
          information relevant to your Purchase including, without limitation,
          your credit card number, the expiration date of your credit card, your
          billing address, and your shipping information.
        </p>
        <p>
          You represent and warrant that: (i) you have the legal right to use
          any credit card(s) or other payment method(s) in connection with any
          Purchase; and that (ii) the information you supply to us is true,
          correct and complete.
        </p>
        <p>
          We may employ the use of third party services for the purpose of
          facilitating payment and the completion of Purchases. By submitting
          your information, you grant us the right to provide the information to
          these third parties subject to our Privacy Policy.
        </p>
        <p>
          We reserve the right to refuse or cancel your order at any time for
          reasons including but not limited to: product or service availability,
          errors in the description or price of the product or service, error in
          your order or other reasons.
        </p>
        <p>
          We reserve the right to modify the number of words charged for the
          output or input or impose any usage restrictions per hour, regardless
          of what was previously committed at the time of subscription. These
          changes will be made according to our model capacity to safeguard the
          interests of all users and to ensure uniform access to the service.
        </p>
        <p>
          We reserve the right to refuse or cancel your order if fraud or an
          unauthorized or illegal transaction is suspected.
        </p>

        <h2>Contests, Sweepstakes and Promotions</h2>
        <p>
          Any contests, sweepstakes or other promotions (collectively,
          &ldquo;Promotions&rdquo;) made available through Service may be
          governed by rules that are separate from these Terms of Service. If
          you participate in any Promotions, please review the applicable rules
          as well as our Privacy Policy. If the rules for a Promotion conflict
          with these Terms of Service, Promotion rules will apply.
        </p>

        <h2>Subscriptions</h2>
        <p>
          Some parts of Service are billed on a subscription basis
          (&ldquo;Subscription(s)&rdquo;). You will be billed in advance on a
          recurring and periodic basis (&ldquo;Billing Cycle&rdquo;). Billing
          cycles are set either on a monthly or quarterly or annual basis,
          depending on the type of subscription plan you select when purchasing
          a Subscription.
        </p>
        <p>
          At the end of each Billing Cycle, your Subscription will automatically
          renew under the exact same conditions unless you cancel it or
          ContextGPT cancels it. You may cancel your Subscription renewal either
          through your online account management page or by contacting our
          customer support team.
        </p>
        <p>
          A valid payment method, including credit card or PayPal, is required
          to process the payment for your subscription. You shall provide
          ContextGPT with accurate and complete billing information including
          full name, address, state, zip code, telephone number, and a valid
          payment method information. By submitting such payment information, you
          automatically authorize ContextGPT to charge all Subscription fees
          incurred through your account to any such payment instruments.
        </p>
        <p>
          Should automatic billing fail to occur for any reason, ContextGPT will
          issue an electronic invoice indicating that you must proceed manually,
          within a certain deadline date, with the full payment corresponding to
          the billing period as indicated on the invoice.
        </p>

        <h2>Free Trial</h2>
        <p>
          ContextGPT may, at its sole discretion, offer a Subscription with a
          free trial for a limited period of time (&ldquo;Free Trial&rdquo;).
        </p>
        <p>
          You may be required to enter your billing information in order to sign
          up for Free Trial.
        </p>
        <p>
          If you do enter your billing information when signing up for Free
          Trial, you will not be charged by ContextGPT until Free Trial has
          expired. On the last day of Free Trial period, unless you cancelled
          your Subscription, you will be automatically charged the applicable
          Subscription fees for the type of Subscription you have selected.
        </p>
        <p>
          At any time and without notice, ContextGPT reserves the right to (i)
          modify Terms of Service of Free Trial offer, or (ii) cancel such Free
          Trial offer.
        </p>

        <h2>Fee Changes</h2>
        <p>
          ContextGPT, in its sole discretion and at any time, may modify
          Subscription fees for the Subscriptions. Any Subscription fee change
          will become effective at the end of the then-current Billing Cycle.
        </p>
        <p>
          At any time and without notice, ContextGPT reserves the right to (i)
           modify Terms of Service of Free Trial offer, or (ii) cancel such Free Trial offer.
        </p>
        <p>
          Your continued use of Service after Subscription fee change comes into
          effect constitutes your agreement to pay the modified Subscription fee
          amount.
        </p>

        <h2>Fair Usage Policy (FUP)</h2>
        <p>
          ContextGPT is committed to providing high-quality, reliable service
          for all users. We expect all our users to avoid misuse or overuse of
          our services. Overuse by one user may impact the quality of service
          for others. Users are encouraged to select plans that align with their
          professional needs and business size. High-usage users should consider
          upgrading to a more robust plan, requesting a custom plan, or
          utilizing our business API.
        </p>
        <p>
          The vast majority of users (over 95%) consistently operate within the
          defined parameters. Exceeding these parameters could lead to
          restricted or reduced service access, with or without prior warning.
        </p>
        <p>
          Our system diligently monitors for automated or robotic behavior to
          maintain service safety and quality. Please be aware that sharing
          login details of unlimited accounts for monetary gains is considered
          illegal. Each seat is intended for one individual user only, and
          multiple users sharing one account are not permitted.
        </p>
        <p>
          <strong>Warning:</strong> Please note that unusually high usage or
          sharing of login details could lead to account suspension or deletion
          without prior notice, with no possibility for refunds.
        </p>

        <h2>Prohibited Uses</h2>
        <p>
          You may not use ContextGPT to generate, request, distribute, or facilitate:
        </p>
        <ul>
          <li>Sexually explicit or pornographic content.</li>
          <li>NSFW or sexually suggestive content.</li>
          <li>Child sexual abuse material (CSAM) or exploitation.</li>
          <li>Violence, hate speech, harassment, or illegal activities.</li>
          <li>Malware, phishing, fraud, or other malicious content.</li>
        </ul>
        <p>
          Violation of these Terms may result in immediate suspension or permanent termination of your account without notice.
        </p>
        <p>
          You may use Service only for lawful purposes and in accordance with
          Terms. You agree not to use Service:
        </p>
        <ul>
          <li>
            In any way that violates any applicable national or international
            law or regulation.
          </li>
          <li>
            For the purpose of exploiting, harming, or attempting to exploit or
            harm minors in any way by exposing them to inappropriate content or
            otherwise.
          </li>
          <li>
            To transmit, or procure the sending of, any advertising or
            promotional material, including any &ldquo;junk mail&rdquo;,
            &ldquo;chain letter&rdquo;, &ldquo;spam&rdquo;, or any other
            similar solicitation.
          </li>
          <li>
            To impersonate or attempt to impersonate Company, a Company
            employee, another user, or any other person or entity.
          </li>
          <li>
            In any way that infringes upon the rights of others, or in any way
            is illegal, threatening, fraudulent, or harmful, or in connection
            with any unlawful, illegal, fraudulent, or harmful purpose or
            activity.
          </li>
          <li>
            To engage in any other conduct that restricts or inhibits
            anyone&rsquo;s use or enjoyment of Service, or which, as determined
            by us, may harm or offend Company or users of Service or expose them
            to liability.
          </li>
        </ul>
        <p>Additionally, you agree not to:</p>
        <ul>
          <li>
            Use Service in any manner that could disable, overburden, damage, or
            impair Service or interfere with any other party&rsquo;s use of
            Service.
          </li>
          <li>
            Use any robot, spider, or other automatic device, process, or means
            to access Service for any purpose, including monitoring or copying
            any of the material on Service.
          </li>
          <li>
            Use any manual process to monitor or copy any of the material on
            Service or for any other unauthorized purpose without our prior
            written consent.
          </li>
          <li>
            Use any device, software, or routine that interferes with the proper
            working of Service.
          </li>
          <li>
            Introduce any viruses, trojan horses, worms, logic bombs, or other
            material which is malicious or technologically harmful.
          </li>
          <li>
            Attempt to gain unauthorized access to, interfere with, damage, or
            disrupt any parts of Service, the server on which Service is stored,
            or any server, computer, or database connected to Service.
          </li>
          <li>
            Attack Service via a denial-of-service attack or a distributed
            denial-of-service attack.
          </li>
          <li>
            Take any action that may damage or falsify Company rating.
          </li>
          <li>
            Otherwise attempt to interfere with the proper working of Service.
          </li>
        </ul>

        <h2>Analytics</h2>
        <p>
          We may use third-party Service Providers to monitor and analyze the
          use of our Service. You can check our privacy policy to know what
          tools we use.
        </p>

        <h2>No Use By Minors</h2>
        <p>
          Service is intended only for access and use by individuals at least
          eighteen (18) years old. By accessing or using any of Company, you
          warrant and represent that you are at least eighteen (18) years of age
          and with the full authority, right, and capacity to enter into this
          agreement and abide by all of the terms and conditions of Terms. If
          you are not at least eighteen (18) years old, you are prohibited from
          both the access and usage of Service.
        </p>

        <h2>Accounts</h2>
        <p>
          When you create an account with us, you guarantee that you are above
          the age of 18, and that the information you provide us is accurate,
          complete, and current at all times. Inaccurate, incomplete, or
          obsolete information may result in the immediate termination of your
          account on Service.
        </p>
        <p>
          You are responsible for maintaining the confidentiality of your
          account and password, including but not limited to the restriction of
          access to your computer and/or account. You agree to accept
          responsibility for any and all activities or actions that occur under
          your account and/or password, whether your password is with our
          Service or a third-party service. You must notify us immediately upon
          becoming aware of any breach of security or unauthorized use of your
          account.
        </p>
        <p>
          You may not use as a username the name of another person or entity or
          that is not lawfully available for use, a name or trademark that is
          subject to any rights of another person or entity other than you,
          without appropriate authorization. You may not use as a username any
          name that is offensive, vulgar or obscene.
        </p>
        <p>
          We reserve the right to refuse service, terminate accounts, remove or
          edit content, or cancel orders in our sole discretion.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          Service and its original content (excluding Content provided by
          users), features and functionality are and will remain the exclusive
          property of ContextGPT and its licensors. Service is protected by
          copyright, trademark, and other laws of the United States and foreign
          countries. Our trademarks and trade dress may not be used in
          connection with any product or service without the prior written
          consent of ContextGPT.
        </p>

        <h2>Copyright Policy</h2>
        <p>
          We respect the intellectual property rights of others. It is our
          policy to respond to any claim that Content posted on Service
          infringes on the copyright or other intellectual property rights
          (&ldquo;Infringement&rdquo;) of any person or entity.
        </p>
        <p>
          If you are a copyright owner, or authorized on behalf of one, and you
          believe that the copyrighted work has been copied in a way that
          constitutes copyright infringement, please submit your claim via email
          to{" "}
          <a href="mailto:security@contextgpt.in">security@contextgpt.in</a>,
          with the subject line: &ldquo;Copyright Infringement&rdquo; and
          include in your claim a detailed description of the alleged
          Infringement.
        </p>
        <p>
          You may be held accountable for damages (including costs and
          attorneys&rsquo; fees) for misrepresentation or bad-faith claims on
          the infringement of any Content found on and/or through Service on
          your copyright.
        </p>

        <h2>DMCA Notice and Procedure for Copyright Infringement Claims</h2>
        <p>
          You may submit a notification pursuant to the Digital Millennium
          Copyright Act (DMCA) by providing our Copyright Agent with the
          following information in writing (see 17 U.S.C 512(c)(3) for further
          detail):
        </p>
        <ul>
          <li>
            An electronic or physical signature of the person authorized to act
            on behalf of the owner of the copyright&rsquo;s interest;
          </li>
          <li>
            A description of the copyrighted work that you claim has been
            infringed, including the URL (i.e., web page address) of the
            location where the copyrighted work exists or a copy of the
            copyrighted work;
          </li>
          <li>
            Identification of the URL or other specific location on Service
            where the material that you claim is infringing is located;
          </li>
          <li>Your address, telephone number, and email address;</li>
          <li>
            A statement by you that you have a good faith belief that the
            disputed use is not authorized by the copyright owner, its agent, or
            the law;
          </li>
          <li>
            A statement by you, made under penalty of perjury, that the above
            information in your notice is accurate and that you are the
            copyright owner or authorized to act on the copyright owner&rsquo;s
            behalf.
          </li>
        </ul>
        <p>
          You can contact our team via email at{" "}
          <a href="mailto:support@contextgpt.in">support@contextgpt.in</a>.
        </p>

        <h2>Error Reporting and Feedback</h2>
        <p>
          You may provide us either directly at{" "}
          <a href="mailto:support@contextgpt.in">support@contextgpt.in</a> or
          via third party sites and tools with information and feedback
          concerning errors, suggestions for improvements, ideas, problems,
          complaints, and other matters related to our Service
          (&ldquo;Feedback&rdquo;). You acknowledge and agree that: (i) you
          shall not retain, acquire or assert any intellectual property right or
          other right, title or interest in or to the Feedback; (ii) Company may
          have development ideas similar to the Feedback; (iii) Feedback does
          not contain confidential information or proprietary information from
          you or any third party; and (iv) Company is not under any obligation
          of confidentiality with respect to the Feedback. In the event the
          transfer of the ownership to the Feedback is not possible due to
          applicable mandatory laws, you grant Company and its affiliates an
          exclusive, transferable, irrevocable, free-of-charge, sub-licensable,
          unlimited and perpetual right to use (including copy, modify, create
          derivative works, publish, distribute and commercialize) Feedback in
          any manner and for any purpose.
        </p>

        <h2>Links To Other Web Sites</h2>
        <p>
          Our Service may contain links to third party web sites or services
          that are not owned or controlled by ContextGPT.
        </p>
        <p>
          ContextGPT has no control over, and assumes no responsibility for the
          content, privacy policies, or practices of any third party web sites
          or services. We do not warrant the offerings of any of these
          entities/individuals or their websites.
        </p>
        <p>
          You acknowledge and agree that ContextGPT shall not be responsible or
          liable, directly or indirectly, for any damage or loss caused or
          alleged to be caused by or in connection with use of or reliance on
          any such content, goods or services available on or through any such
          third party web sites or services.
        </p>
        <p>
          We strongly advise you to read the Terms of service and Privacy
          Policies of any third party web sites or services that you visit.
        </p>

        <h2>Disclaimer Of Warranty</h2>
        <p>
          These services are provided by company on an &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo; basis. Company makes no representations or
          warranties of any kind, express or implied, as to the operation of
          their services, or the information, content or materials included
          therein. You expressly agree that your use of these services, their
          content, and any services or items obtained from us is at your sole
          risk.
        </p>
        <p>
          Neither company nor any person associated with company makes any
          warranty or representation with respect to the completeness, security,
          reliability, quality, accuracy, or availability of the services.
          Without limiting the foregoing, neither company nor anyone associated
          with company represents or warrants that the services, their content,
          or any services or items obtained through the services will be
          accurate, reliable, error-free, or uninterrupted, that defects will be
          corrected, that the services or the server that makes it available are
          free of viruses or other harmful components or that the services or
          any services or items obtained through the services will otherwise
          meet your needs or expectations.
        </p>
        <p>
          Company hereby disclaims all warranties of any kind, whether express
          or implied, statutory, or otherwise, including but not limited to any
          warranties of merchantability, non-infringement, and fitness for
          particular purpose.
        </p>
        <p>
          The foregoing does not affect any warranties which cannot be excluded
          or limited under applicable law.
        </p>

        <h2>Limitation Of Liability</h2>
        <p>
          Except as prohibited by law, you will hold us and our officers,
          directors, employees, and agents harmless for any indirect, punitive,
          special, incidental, or consequential damage, however it arises
          (including attorneys&rsquo; fees and all related costs and expenses of
          litigation and arbitration, or at trial or on appeal, if any, whether
          or not litigation or arbitration is instituted), whether in an action
          of contract, negligence, or other tortious action, or arising out of
          or in connection with this agreement, including without limitation any
          claim for personal injury or property damage, arising from this
          agreement and any violation by you of any federal, state, or local
          laws, statutes, rules, or regulations, even if company has been
          previously advised of the possibility of such damage. Except as
          prohibited by law, if there is liability found on the part of company,
          it will be limited to the amount paid for the products and/or
          services, and under no circumstances will there be consequential or
          punitive damages. Some states do not allow the exclusion or limitation
          of punitive, incidental or consequential damages, so the prior
          limitation or exclusion may not apply to you.
        </p>

        <h2>Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to Service
          immediately, without prior notice or liability, under our sole
          discretion, for any reason whatsoever and without limitation, including
          but not limited to a breach of Terms.
        </p>
        <p>
          If you wish to terminate your account, you may simply discontinue
          using Service.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the
          laws of State of Delaware without regard to its conflict of law
          provisions.
        </p>
        <p>
          Our failure to enforce any right or provision of these Terms will not
          be considered a waiver of those rights. If any provision of these
          Terms is held to be invalid or unenforceable by a court, the remaining
          provisions of these Terms will remain in effect. These Terms
          constitute the entire agreement between us regarding our Service and
          supersede and replace any prior agreements we might have had between
          us regarding Service.
        </p>

        <h2>Changes To Service</h2>
        <p>
          We reserve the right to withdraw or amend our Service, and any service
          or material we provide via Service, in our sole discretion without
          notice. We will not be liable if for any reason all or any part of
          Service is unavailable at any time or for any period. From time to
          time, we may restrict access to some parts of Service, or the entire
          Service, to users, including registered users.
        </p>

        <h2>Amendments To Terms</h2>
        <p>
          We may amend Terms at any time by posting the amended terms on this
          site. It is your responsibility to review these Terms periodically.
        </p>
        <p>
          Your continued use of the Platform following the posting of revised
          Terms means that you accept and agree to the changes. You are expected
          to check this page frequently so you are aware of any changes, as they
          are binding on you.
        </p>
        <p>
          By continuing to access or use our Service after any revisions become
          effective, you agree to be bound by the revised terms. If you do not
          agree to the new terms, you are no longer authorized to use Service.
        </p>

        <h2>Waiver And Severability</h2>
        <p>
          No waiver by Company of any term or condition set forth in Terms shall
          be deemed a further or continuing waiver of such term or condition or
          a waiver of any other term or condition, and any failure of Company to
          assert a right or provision under Terms shall not constitute a waiver
          of such right or provision.
        </p>
        <p>
          If any provision of Terms is held by a court or other tribunal of
          competent jurisdiction to be invalid, illegal or unenforceable for any
          reason, such provision shall be eliminated or limited to the minimum
          extent such that the remaining provisions of Terms will continue in
          full force and effect.
        </p>

        <h2>Acknowledgement</h2>
        <p>
          By using service or other services provided by us, you acknowledge
          that you have read these terms of service and agree to be bound by
          them.
        </p>

        <h2>Contact Us</h2>
        <p>
          You can contact us by emailing to:{" "}
          <a href="mailto:support@contextgpt.in">support@contextgpt.in</a> for
          any queries.
        </p>
      </article>
    </div>
  );
}

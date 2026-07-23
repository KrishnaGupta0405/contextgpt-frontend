export function generateDPAHtml(form) {
  const company = form.company || "[Company Name]";
  const reg = form.reg || "-";
  const address = form.address || "-";
  const email = form.email || "-";

  const regRow = `<tr><td class="td-label">Registration Number</td><td>${reg}</td></tr>`;
  const addressRow = `<tr><td class="td-label">Address</td><td>${address}</td></tr>`;
  const emailRow = `<tr><td class="td-label">Contact Email</td><td>${email}</td></tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Data Processing Agreement</title>
  <style>
    body {
      font-family: Georgia, 'Times New Roman', Times, serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 48px;
      color: #1a1a1a;
      line-height: 1.75;
      font-size: 13.5px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      text-align: center;
      text-transform: uppercase;
    }
    .subtitle {
      color: #555;
      font-size: 13px;
      text-align: center;
      margin-bottom: 0;
    }
    hr {
      border-color: #bbb;
      margin: 24px 0;
    }
    .section-title {
      font-size: 13.5px;
      font-weight: 700;
      margin-bottom: 10px;
      margin-top: 24px;
    }
    .sub-title {
      font-size: 13.5px;
      font-weight: 700;
      margin-bottom: 6px;
      margin-top: 16px;
    }
    p {
      margin-bottom: 10px;
    }
    ul {
      padding-left: 22px;
      margin-bottom: 10px;
    }
    li {
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 13px;
    }
    td {
      padding: 6px 10px;
      border: 1px solid #ccc;
      vertical-align: top;
    }
    .td-label {
      font-weight: 600;
      width: 38%;
      background: #f9f9f9;
    }
    .sign-block {
      display: flex;
      justify-content: space-between;
      gap: 48px;
      margin-top: 28px;
    }
    .sign-col {
      flex: 1;
    }
    .sign-line {
      border-bottom: 1px solid #aaa;
      height: 38px;
      margin-bottom: 6px;
      margin-top: 16px;
    }
    .sign-label {
      font-size: 11.5px;
      color: #666;
    }
    .footer {
      font-size: 11px;
      color: #999;
      text-align: center;
      margin-top: 8px;
    }
  </style>
</head>
<body onload="window.print()">
  <h1>Data Processing Agreement</h1>
  <p class="subtitle">Effective Date: Upon execution by the parties</p>
  <p class="subtitle">This Data Processing Agreement ("DPA") forms part of the Terms of Service between:</p>

  <hr />

  <p style="font-weight: 700; margin-bottom: 6px;">DATA PROCESSOR</p>
  <table>
    <tbody>
      <tr><td class="td-label">Name</td><td>Krishna Gupta trading as ContextGPT</td></tr>
      <tr><td class="td-label">Email</td><td>support@contextgpt.co</td></tr>
      <tr><td class="td-label">Website</td><td>https://contextgpt.co</td></tr>
    </tbody>
  </table>

  <p style="font-weight: 700; margin: 16px 0 6px;">DATA CONTROLLER</p>
  <table>
    <tbody>
      <tr><td class="td-label">Company Name</td><td>${company}</td></tr>
      ${regRow}
      ${addressRow}
      ${emailRow}
    </tbody>
  </table>
  <p style="font-size: 12px; color: #555; margin-bottom: 4px;">(each a "Party" and together the "Parties")</p>

  <hr />

  <p class="section-title">1. Definitions</p>
  <p><strong>"Data Protection Laws"</strong> means all applicable laws relating to data protection and privacy, including but not limited to the General Data Protection Regulation (EU) 2016/679 ("GDPR"), the UK GDPR, the California Consumer Privacy Act ("CCPA"), and any other applicable data protection legislation.</p>
  <p><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person as defined in applicable Data Protection Laws.</p>
  <p><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, disclosure, dissemination, erasure, or destruction.</p>
  <p><strong>"Sub-processor"</strong> means any third party engaged by the Processor to process Personal Data on behalf of the Controller.</p>
  <p><strong>"Data Subject"</strong> means an identified or identifiable natural person whose Personal Data is processed.</p>
  <p><strong>"Services"</strong> means the AI-powered customer support chatbot services provided by ContextGPT to the Controller.</p>
  <p><strong>"Security Incident"</strong> means any accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, Personal Data.</p>

  <p class="section-title">2. Subject Matter and Duration</p>
  <p class="sub-title">2.1 Subject Matter</p>
  <p>This DPA governs the processing of Personal Data by the Processor on behalf of the Controller in connection with the provision of the Services.</p>
  <p class="sub-title">2.2 Duration</p>
  <p>This DPA shall remain in effect for the duration of the Controller's use of the Services, and shall automatically terminate upon termination or expiration of the underlying service agreement.</p>

  <p class="section-title">3. Nature and Purpose of Processing</p>
  <p class="sub-title">3.1 Nature of Processing</p>
  <p>The Processor shall process Personal Data as necessary to provide the Services, which includes:</p>
  <ul>
    <li>Receiving and processing customer inquiries through the chatbot</li>
    <li>Storing conversation histories and user preferences</li>
    <li>Generating automated responses to customer queries</li>
    <li>Analytics and reporting on chatbot performance</li>
  </ul>
  <p class="sub-title">3.2 Purpose</p>
  <p>The purpose of processing is to enable the Controller to provide AI-powered customer support services to its end users through the ContextGPT platform.</p>

  <p class="section-title">4. Types of Personal Data</p>
  <p>The following types of Personal Data may be processed:</p>
  <ul>
    <li>Names and contact information (email addresses)</li>
    <li>Communication content (chat messages, queries)</li>
    <li>Technical data (IP addresses, device information, browser type)</li>
    <li>Usage data (interaction logs, timestamps)</li>
    <li>Personal Data that end users submit through the chatbot interface in the course of using the Services</li>
  </ul>

  <p class="section-title">5. Categories of Data Subjects</p>
  <p>The Data Subjects whose Personal Data may be processed include:</p>
  <ul>
    <li>End users who interact with the Controller's chatbot</li>
    <li>Customers and potential customers of the Controller</li>
    <li>Employees or representatives of the Controller who access the Services</li>
    <li>Any other individuals whose data is submitted to the Services by the Controller</li>
  </ul>

  <p class="section-title">6. Processor Obligations</p>
  <p>The Processor shall:</p>
  <p class="sub-title">6.1 Processing Instructions</p>
  <ul>
    <li>Process Personal Data only on documented instructions from the Controller, including transfers to third countries, unless required by law</li>
    <li>Immediately inform the Controller if, in the Processor's opinion, an instruction infringes Data Protection Laws</li>
  </ul>
  <p class="sub-title">6.2 Confidentiality</p>
  <ul>
    <li>Ensure that persons authorized to process Personal Data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality</li>
  </ul>
  <p class="sub-title">6.3 Security</p>
  <ul>
    <li>Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk</li>
  </ul>
  <p class="sub-title">6.4 Sub-processing</p>
  <ul>
    <li>Not engage another processor without prior specific or general written authorization of the Controller</li>
    <li>Where general authorization is given, inform the Controller of any intended changes concerning the addition or replacement of sub-processors</li>
  </ul>
  <p class="sub-title">6.5 Assistance</p>
  <ul>
    <li>Taking into account the nature of the processing, assist the Controller by appropriate technical and organizational measures for the fulfilment of the Controller's obligation to respond to Data Subject requests</li>
    <li>Assist the Controller in ensuring compliance with security, breach notification, impact assessment, and consultation obligations</li>
  </ul>
  <p class="sub-title">6.6 Deletion/Return</p>
  <ul>
    <li>At the choice of the Controller, delete or return all Personal Data after the end of the provision of Services, unless Union or Member State law requires storage</li>
  </ul>
  <p class="sub-title">6.7 Audit</p>
  <ul>
    <li>Make available to the Controller all information necessary to demonstrate compliance with this DPA and allow for and contribute to audits</li>
  </ul>

  <p class="section-title">7. Sub-processors</p>
  <p class="sub-title">7.1 Authorized Sub-processors</p>
  <p>The Controller provides general authorization for the Processor to engage Sub-processors. A current list of Sub-processors is maintained at https://contextgpt.co/legal/subprocessors.</p>
  <p class="sub-title">7.2 Sub-processor Changes</p>
  <p>The Controller agrees to periodically review the Sub-processor list. Continued use of the Services after changes to the Sub-processor list constitutes acceptance of such changes.</p>
  <p class="sub-title">7.3 Sub-processor Agreements</p>
  <p>The Processor shall ensure that each Sub-processor is bound by data protection obligations no less protective than those in this DPA.</p>

  <p class="section-title">8. Data Subject Rights</p>
  <p class="sub-title">8.1 Assistance with Requests</p>
  <p>The Processor shall promptly notify the Controller of any request received directly from a Data Subject and shall not respond except on documented instructions from the Controller.</p>
  <p class="sub-title">8.2 Types of Requests</p>
  <p>The Processor shall assist the Controller in responding to requests to exercise Data Subject rights including:</p>
  <ul>
    <li>Right of access</li>
    <li>Right to rectification</li>
    <li>Right to erasure ("right to be forgotten")</li>
    <li>Right to restriction of processing</li>
    <li>Right to data portability</li>
    <li>Right to object</li>
    <li>Rights related to automated decision-making</li>
  </ul>

  <p class="section-title">9. Security Measures</p>
  <p>The Processor implements the following technical and organizational measures:</p>
  <p class="sub-title">9.1 Technical Measures</p>
  <ul>
    <li>Encryption of Personal Data in transit (TLS 1.2+) and at rest</li>
    <li>Access controls and authentication mechanisms</li>
    <li>Regular security assessments and penetration testing</li>
    <li>Automated vulnerability scanning</li>
    <li>Secure software development practices</li>
    <li>Regular backups with encryption</li>
  </ul>
  <p class="sub-title">9.2 Organizational Measures</p>
  <ul>
    <li>Information security policies and procedures</li>
    <li>Employee training on data protection</li>
    <li>Incident response procedures</li>
    <li>Business continuity planning</li>
    <li>Access management and role-based permissions</li>
    <li>Vendor security assessments</li>
  </ul>

  <p class="section-title">10. Data Breach Notification</p>
  <p class="sub-title">10.1 Notification Timeline</p>
  <p>The Processor shall notify the Controller without undue delay, and where feasible within 48 hours, after becoming aware of a Security Incident affecting the Controller's Personal Data.</p>
  <p class="sub-title">10.2 Notification Content</p>
  <p>Such notification shall include:</p>
  <ul>
    <li>Description of the nature of the Security Incident</li>
    <li>Categories and approximate number of Data Subjects affected</li>
    <li>Categories and approximate number of Personal Data records affected</li>
    <li>Name and contact details of the Processor's data protection contact</li>
    <li>Description of likely consequences</li>
    <li>Description of measures taken or proposed to address the incident</li>
  </ul>
  <p class="sub-title">10.3 Cooperation</p>
  <p>The Processor shall cooperate with the Controller and take reasonable steps to assist in the investigation, mitigation, and remediation of any Security Incident.</p>

  <p class="section-title">11. International Data Transfers</p>
  <p class="sub-title">11.1 Transfer Mechanisms</p>
  <p>Where Personal Data is transferred outside the European Economic Area, United Kingdom, or any other jurisdiction with data transfer restrictions, the Processor shall ensure appropriate safeguards are in place, including:</p>
  <ul>
    <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
    <li>Binding Corporate Rules where applicable</li>
    <li>Adequacy decisions by relevant authorities</li>
    <li>Other lawful transfer mechanisms under applicable Data Protection Laws</li>
  </ul>
  <p class="sub-title">11.2 SCCs</p>
  <p>The Parties agree that the EU Standard Contractual Clauses (Module Two: Controller to Processor) shall apply to transfers of Personal Data from the EEA to third countries, and are hereby incorporated by reference into this DPA.</p>

  <p class="section-title">12. Return and Deletion of Data</p>
  <p class="sub-title">12.1 Upon Termination</p>
  <p>Upon termination of the Services, the Processor shall, at the Controller's choice:</p>
  <ul>
    <li>Return all Personal Data to the Controller in a commonly used format; or</li>
    <li>Delete all Personal Data and certify such deletion in writing</li>
  </ul>
  <p class="sub-title">12.2 Retention Period</p>
  <p>The Controller shall have 30 days from termination to request return of Personal Data. After this period, the Processor may delete all remaining Personal Data.</p>
  <p class="sub-title">12.3 Exceptions</p>
  <p>The Processor may retain Personal Data to the extent required by applicable law, provided that the Processor maintains confidentiality of such data.</p>

  <p class="section-title">13. Audit Rights</p>
  <p class="sub-title">13.1 Right to Audit</p>
  <p>The Controller has the right to conduct audits, including inspections, to verify the Processor's compliance with this DPA. Such audits shall:</p>
  <ul>
    <li>Be conducted with reasonable prior notice (at least 14 days)</li>
    <li>Be conducted during normal business hours</li>
    <li>Not unreasonably interfere with the Processor's operations</li>
    <li>Be subject to appropriate confidentiality obligations</li>
  </ul>
  <p class="sub-title">13.2 Audit Reports</p>
  <p>The Processor may satisfy audit requirements by providing:</p>
  <ul>
    <li>Third-party audit reports or certifications (e.g., SOC 2)</li>
    <li>Completion of security questionnaires</li>
    <li>Evidence of compliance with this DPA</li>
  </ul>
  <p class="sub-title">13.3 Costs</p>
  <p>Each Party shall bear its own costs in connection with any audit, unless the audit reveals material non-compliance by the Processor.</p>

  <p class="section-title">14. Liability</p>
  <p class="sub-title">14.1 Limitation</p>
  <p>The total liability of each Party under this DPA shall be subject to the limitations of liability set forth in the underlying service agreement.</p>
  <p class="sub-title">14.2 Indemnification</p>
  <p>Each Party shall indemnify the other against any costs, claims, damages, or expenses incurred as a result of the indemnifying Party's breach of this DPA or applicable Data Protection Laws.</p>

  <p class="section-title">15. General Provisions</p>
  <p class="sub-title">15.1 Amendments</p>
  <p>This DPA may only be amended in writing signed by both Parties.</p>
  <p class="sub-title">15.2 Severability</p>
  <p>If any provision of this DPA is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
  <p class="sub-title">15.3 Entire Agreement</p>
  <p>This DPA, together with the Terms of Service, constitutes the entire agreement between the Parties regarding the subject matter hereof.</p>

  <hr />

  <p class="section-title" style="text-align: center;">16. Signatures</p>
  <p style="text-align: center; font-size: 13px; color: #444; margin-bottom: 16px;">IN WITNESS WHEREOF, the Parties have executed this Data Processing Agreement as of the date last signed below.</p>

  <div class="sign-block">
    <div class="sign-col">
      <p style="font-weight: 700; margin-bottom: 4px;">DATA PROCESSOR: ContextGPT</p>
      <p style="font-size: 13px; color: #444; margin-bottom: 0;"><strong>Name:</strong> Krishna Gupta</p>
      <p style="font-size: 13px; color: #444; margin-bottom: 0;"><strong>Title:</strong> Founder</p>
      <div class="sign-line"></div>
      <p class="sign-label">Signature</p>
      <div class="sign-line"></div>
      <p class="sign-label">Date</p>
    </div>
    <div class="sign-col">
      <p style="font-weight: 700; margin-bottom: 4px;">DATA CONTROLLER: ${company}</p>
      <p style="font-size: 13px; color: #444; margin-bottom: 0;"><strong>Company:</strong> ${company}</p>
      <p style="font-size: 13px; color: #444; margin-bottom: 0;"><strong>Email:</strong> ${email}</p>
      <div class="sign-line"></div>
      <p class="sign-label">Signature</p>
      <div class="sign-line"></div>
      <p class="sign-label">Name</p>
      <div class="sign-line"></div>
      <p class="sign-label">Title</p>
      <div class="sign-line"></div>
      <p class="sign-label">Date</p>
    </div>
  </div>

  <hr style="margin-top: 40px;" />

  <p class="section-title">17. Contact Information</p>
  <p>For questions about this DPA or to exercise any rights, please contact:</p>
  <p style="font-size: 13px; margin-bottom: 4px;"><strong>ContextGPT (Data Processor)</strong></p>
  <p style="font-size: 13px; margin-bottom: 4px;">Email: support@contextgpt.co</p>
  <p style="font-size: 13px; margin-bottom: 0;">Website: https://contextgpt.co</p>

  <hr style="margin-top: 36px;" />
  <p class="footer">Last updated: March 2026</p>

</body>
</html>
  `;
}

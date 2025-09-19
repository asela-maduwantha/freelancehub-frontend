import MainLayout from '../../../components/layouts/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: September 15, 2025</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              At Frevo ("we," "our," or "us"), we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our freelance marketplace platform.
            </p>
            <p className="text-gray-700 mb-4">
              By using our Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-2">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">
              We collect personal information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name, email address, and contact information</li>
              <li>Profile information and professional details</li>
              <li>Payment information and billing details</li>
              <li>Communication records and messages</li>
              <li>Portfolio, work samples, and project history</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">2.2 Usage Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect certain information when you use our Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Usage patterns and platform interactions</li>
              <li>Cookies and tracking technologies</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">2.3 Third-Party Information</h3>
            <p className="text-gray-700 mb-4">
              We may receive information from third-party services you connect to our platform, such as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Social media profiles</li>
              <li>Payment processors</li>
              <li>Background verification services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Provide and maintain our Service</li>
              <li>Process transactions and manage payments</li>
              <li>Facilitate communication between users</li>
              <li>Verify user identities and prevent fraud</li>
              <li>Improve our platform and develop new features</li>
              <li>Send administrative information and updates</li>
              <li>Comply with legal obligations</li>
              <li>Enforce our Terms of Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-2">4.1 With Other Users</h3>
            <p className="text-gray-700 mb-4">
              Certain information is visible to other users of our platform:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Public profiles and portfolios</li>
              <li>Project proposals and bids</li>
              <li>Reviews and ratings</li>
              <li>Communication history (with consent)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">4.2 Service Providers</h3>
            <p className="text-gray-700 mb-4">
              We share information with third-party service providers who help us operate our platform:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Payment processors</li>
              <li>Cloud hosting providers</li>
              <li>Analytics services</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">4.3 Legal Requirements</h3>
            <p className="text-gray-700 mb-4">
              We may disclose information when required by law or to protect our rights and safety.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure payment processing</li>
              <li>Regular backups and disaster recovery</li>
            </ul>
            <p className="text-gray-700 mb-4">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand user behavior</li>
              <li><strong>Marketing Cookies:</strong> Used for targeted advertising</li>
              <li><strong>Preference Cookies:</strong> Remember your settings</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as necessary to provide our Service and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Account information: Retained while account is active</li>
              <li>Transaction records: Retained for 7 years for tax purposes</li>
              <li>Communication records: Retained for dispute resolution</li>
              <li>Analytics data: Anonymized after 2 years</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Limit how we process your information</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise these rights, contact us at privacy@frevo.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses and adequacy decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Links and Services</h2>
            <p className="text-gray-700 mb-4">
              Our platform may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or platform notification. Your continued use of our Service after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Data Protection Officer</strong></p>
              <p className="text-gray-700">Email: privacy@frevo.com</p>
              <p className="text-gray-700">Address: [Your Business Address]</p>
              <p className="text-gray-700">Phone: [Your Phone Number]</p>
            </div>
            <p className="text-gray-700 mt-4">
              We will respond to your inquiries within 30 days.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
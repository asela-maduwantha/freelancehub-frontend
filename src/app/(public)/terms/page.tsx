import MainLayout from '../../../components/layouts/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: September 15, 2025</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Frevo ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our platform, including our website, mobile application, and related services (collectively, the "Service").
            </p>
            <p className="text-gray-700 mb-4">
              By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Frevo is a freelance marketplace that connects clients with skilled freelancers. Our platform enables:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Posting and browsing freelance job opportunities</li>
              <li>Submitting proposals and bidding on projects</li>
              <li>Managing contracts and project milestones</li>
              <li>Processing payments and escrow services</li>
              <li>Communication between clients and freelancers</li>
              <li>Review and rating system</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">3.1 Account Creation</h3>
            <p className="text-gray-700 mb-4">
              To use certain features of our Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">3.2 Account Types</h3>
            <p className="text-gray-700 mb-4">
              We offer two primary account types:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Client Accounts:</strong> For businesses and individuals seeking to hire freelancers</li>
              <li><strong>Freelancer Accounts:</strong> For independent contractors offering services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
            <p className="text-gray-700 mb-4">
              You agree not to use our Service to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Transmit viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to access our Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Freelance Services</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">5.1 Project Agreements</h3>
            <p className="text-gray-700 mb-4">
              All project agreements are between clients and freelancers. We facilitate these agreements but are not a party to them. Users are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Clearly defining project scope and requirements</li>
              <li>Agreeing on payment terms and milestones</li>
              <li>Complying with all applicable laws</li>
              <li>Delivering work according to agreed specifications</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-2">5.2 Payment Processing</h3>
            <p className="text-gray-700 mb-4">
              We provide payment processing services through our platform. By using these services:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>You agree to our payment terms and fees</li>
              <li>Funds may be held in escrow until project completion</li>
              <li>Disputes are resolved through our dispute resolution process</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-2">6.1 Our Content</h3>
            <p className="text-gray-700 mb-4">
              All content on our platform, including text, graphics, logos, and software, is owned by us or our licensors and is protected by intellectual property laws.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-2">6.2 User Content</h3>
            <p className="text-gray-700 mb-4">
              By posting content on our platform, you grant us a non-exclusive, royalty-free license to use, display, and distribute your content in connection with our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
            <p className="text-gray-700 mb-4">
              Our Service is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>The accuracy or completeness of information on our platform</li>
              <li>The quality or reliability of freelancers or their work</li>
              <li>Uninterrupted or error-free service availability</li>
              <li>The security of data transmissions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of our Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account at our discretion, with or without cause. Upon termination, your right to use our Service ceases immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">Email: legal@frevo.com</p>
              <p className="text-gray-700">Address: [Your Business Address]</p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

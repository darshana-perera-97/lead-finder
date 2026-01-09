import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Database, Megaphone, Mail, MessageSquare, BarChart3, ArrowRight, CheckCircle, Zap, Shield, Users } from 'lucide-react';
import { LoginPage } from './LoginPage';

export function LandingPage({ onLogin }) {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  if (showLogin) {
    return <LoginPage onLogin={onLogin} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#008080]">LeadFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="text-[#2D3748] hover:text-[#008080] transition-colors font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D3748] mb-6">
            Find, Connect & Convert
            <span className="text-[#008080] block mt-2">Leads Faster</span>
          </h1>
          <p className="text-xl sm:text-2xl text-[#718096] mb-8 max-w-3xl mx-auto">
            Powerful lead generation platform that helps you discover, manage, and engage with potential customers through email and WhatsApp campaigns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowLogin(true)}
              className="bg-[#008080] text-white px-8 py-4 rounded-lg hover:bg-[#006666] transition-colors font-semibold text-lg flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-[#008080] border-2 border-[#008080] px-8 py-4 rounded-lg hover:bg-[#008080]/5 transition-colors font-semibold text-lg"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#F5F7F9] py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-lg text-[#718096] max-w-2xl mx-auto">
              All-in-one platform for lead generation, campaign management, and customer engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">Smart Lead Finder</h3>
              <p className="text-[#718096]">
                Discover potential customers by industry, location, and keywords. Get comprehensive business information instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">Lead Management</h3>
              <p className="text-[#718096]">
                Organize and manage all your leads in one place. Filter, search, and track your prospects effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">Campaign Management</h3>
              <p className="text-[#718096]">
                Create and schedule email and WhatsApp campaigns. Track performance and optimize your outreach.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">Email Campaigns</h3>
              <p className="text-[#718096]">
                Send personalized emails with templates. Support for text, images, and HTML content.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">WhatsApp Integration</h3>
              <p className="text-[#718096]">
                Connect your WhatsApp and send bulk messages. Support for text, images, and rich media.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">Analytics & Insights</h3>
              <p className="text-[#718096]">
                Track your performance with detailed analytics. Monitor sends, opens, and campaign success rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2D3748] mb-6">
                Why Choose LeadFlow?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#2D3748] mb-1">Save Time</h3>
                    <p className="text-[#718096]">Automate your lead generation and outreach process</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#2D3748] mb-1">Increase Efficiency</h3>
                    <p className="text-[#718096]">Manage all your leads and campaigns from one platform</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#2D3748] mb-1">Secure & Reliable</h3>
                    <p className="text-[#718096]">Your data is safe with enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#2D3748] mb-1">Scale Your Business</h3>
                    <p className="text-[#718096]">Reach more customers with automated campaigns</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#F5F7F9] rounded-lg p-8 sm:p-12">
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#718096]">Total Leads Generated</span>
                    <span className="text-2xl font-bold text-[#008080]">10K+</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#718096]">Campaigns Sent</span>
                    <span className="text-2xl font-bold text-[#008080]">50K+</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#718096]">Active Users</span>
                    <span className="text-2xl font-bold text-[#008080]">500+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#008080] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start finding and converting leads today. No credit card required.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-white text-[#008080] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center justify-center gap-2 mx-auto"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D3748] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-xl font-bold text-[#008080] mb-2">LeadFlow</h3>
              <p className="text-sm text-gray-400">Your all-in-one lead generation platform</p>
            </div>
            <div className="text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} LeadFlow. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


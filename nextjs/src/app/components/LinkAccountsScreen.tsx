import { useState } from 'react';
import { Mail, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';

export function LinkAccountsScreen() {
  const [emailConnected, setEmailConnected] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  const handleEmailConnect = () => {
    if (smtpHost && smtpPort && smtpUsername && smtpPassword) {
      setEmailConnected(true);
      alert('Email SMTP configured successfully!');
    } else {
      alert('Please fill in all SMTP fields');
    }
  };

  const handleGoogleAuth = () => {
    alert('Redirecting to Google OAuth...');
    setTimeout(() => {
      setEmailConnected(true);
    }, 1000);
  };

  const handleOutlookAuth = () => {
    alert('Redirecting to Microsoft OAuth...');
    setTimeout(() => {
      setEmailConnected(true);
    }, 1000);
  };

  const handleWhatsAppConnect = () => {
    alert('Scan QR code with WhatsApp Business app to connect');
    setTimeout(() => {
      setWhatsappConnected(true);
    }, 1500);
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-[#2D3748] mb-6">Link Accounts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Configuration Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#008080]/10 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#008080]" />
            </div>
            <div className="flex-1">
              <h2 className="text-[#2D3748]">Email Sending Configuration</h2>
              <div className="flex items-center gap-2 mt-1">
                {emailConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-[#718096]" />
                    <span className="text-sm text-[#718096]">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-[#718096] mb-2">SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-[#718096] mb-2">SMTP Port</label>
              <input
                type="text"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-[#718096] mb-2">Username</label>
              <input
                type="text"
                value={smtpUsername}
                onChange={(e) => setSmtpUsername(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-[#718096] mb-2">Password</label>
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-[#718096]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleEmailConnect}
            className="w-full bg-[#008080] text-white px-6 py-2 rounded-lg hover:bg-[#006666] transition-colors mb-4"
          >
            Connect SMTP
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#718096]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#718096]">Or connect with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleAuth}
              className="px-4 py-2 border border-[#718096]/30 rounded-lg hover:bg-[#F5F7F9] transition-colors text-sm text-[#2D3748]"
            >
              Gmail
            </button>
            <button
              onClick={handleOutlookAuth}
              className="px-4 py-2 border border-[#718096]/30 rounded-lg hover:bg-[#F5F7F9] transition-colors text-sm text-[#2D3748]"
            >
              Outlook
            </button>
          </div>
        </div>

        {/* WhatsApp Configuration Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-[#2D3748]">WhatsApp Business Link</h2>
              <div className="flex items-center gap-2 mt-1">
                {whatsappConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-[#718096]" />
                    <span className="text-sm text-[#718096]">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#F5F7F9] rounded-lg p-6 mb-6">
            <h3 className="text-sm text-[#2D3748] mb-3">How to connect:</h3>
            <ol className="space-y-2 text-sm text-[#718096]">
              <li className="flex gap-2">
                <span className="text-[#008080] flex-shrink-0">1.</span>
                <span>Open WhatsApp Business on your phone</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#008080] flex-shrink-0">2.</span>
                <span>Go to Settings → Linked Devices</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#008080] flex-shrink-0">3.</span>
                <span>Tap "Link a Device"</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#008080] flex-shrink-0">4.</span>
                <span>Scan the QR code displayed below</span>
              </li>
            </ol>
          </div>

          <div className="bg-white border-2 border-dashed border-[#718096]/30 rounded-lg p-8 mb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-48 bg-[#F5F7F9] rounded-lg flex items-center justify-center mb-3 mx-auto">
                <MessageCircle className="w-16 h-16 text-[#718096]/30" />
              </div>
              <p className="text-sm text-[#718096]">QR Code will appear here</p>
            </div>
          </div>

          <button
            onClick={handleWhatsAppConnect}
            className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Generate QR Code
          </button>
        </div>
      </div>
    </div>
  );
}

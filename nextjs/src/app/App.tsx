import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LeadFinderScreen } from './components/LeadFinderScreen';
import { MyLeadsScreen } from './components/MyLeadsScreen';
import { CampaignsScreen } from './components/CampaignsScreen';
import { LinkAccountsScreen } from './components/LinkAccountsScreen';
import { SettingsScreen } from './components/SettingsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('lead-finder');

  const renderScreen = () => {
    switch (activeTab) {
      case 'lead-finder':
        return <LeadFinderScreen />;
      case 'my-leads':
        return <MyLeadsScreen />;
      case 'campaigns':
        return <CampaignsScreen />;
      case 'link-accounts':
        return <LinkAccountsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <LeadFinderScreen />;
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto bg-white">
        {renderScreen()}
      </div>
    </div>
  );
}

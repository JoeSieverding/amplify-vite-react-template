import * as React from "react";
import { useState, useEffect } from "react";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import logoIcon from './ccoe-phone-tool-icon.png';
import { useNavigate } from 'react-router-dom';
import EnvironmentSwitcher from './EnvironmentSwitcher';

function TopNav() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    username: "Loading...",
    email: "Loading..."
  });
  const [showEnvSwitcher, setShowEnvSwitcher] = useState(false);

  const handleSignOut = () => {
    signOut()
      .then(() => {
        console.log("Sign out successful");
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('Error signing out:', error);
        window.location.reload();
      });
  };
  
  const handleScaListClick = () => {
    navigate('/scas');
  };
  
  const handleImportChatBotClick = () => {
    navigate('/scaimportchatbot');  // Update this path to match your routing configuration
  };

  const handleAnalyticsChatBotClick = () => {
    navigate('/scaanalyticschatbot');  // Update this path to match your routing configuration
  };

  const handleToggleEnvSwitcher = () => {
    setShowEnvSwitcher(!showEnvSwitcher);
  };
  
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      window.location.href = '/';
    }
  }, [authStatus]);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserDetails({
            username: user.username,
            email: user.signInDetails?.loginId || "No email available"
          });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }
    fetchUserDetails();
  }, [authStatus]);

  // Get current environment
  const isProduction = localStorage.getItem('useProductionEnv') === 'true';

  const utilities = [
    {
      type: "button",
      text: "Import SCA Bot",
      onClick: handleImportChatBotClick
    },
    {
      type: "button",
      text: "SCA List",
      onClick: handleScaListClick
    },
    {
      type: "button",
      text: "Analytics Bot",
      onClick: handleAnalyticsChatBotClick
    },
    {
      type: "button",
      text: `Environment: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`,
      onClick: handleToggleEnvSwitcher
    },
    {
      type: "button",
      text: "Log Out",
      onClick: handleSignOut
    },
    {
      type: "menu-dropdown",
      text: userDetails.email,
      iconName: "user-profile",
      items: [
        {
          id: "support-group",
          text: "Support",
          items: [
            {
              id: "documentation",
              type: "button",
              text: "PRFAQ",
              href: "https://amazon.awsapps.com/workdocs-amazon/index.html#/document/6c4e5255613553f6eb3e4168f0993f411f8e1ffe7221e3c843122f65a3b54b96",
              external: true,
              externalIconAriaLabel: " (opens in new tab)"
            },
            {
              id: "feedback",
              text: "Log Feature Request (coming soon)",
              external: true,
              externalIconAriaLabel: " (opens in new tab)"
            }
          ]
        }
      ]
    }
  ];

  return (
    <>
      <TopNavigation
        identity={{
          href: "#",
          title: "SCA Management App",
          logo: {
            src: logoIcon,
            alt: "No Icon"
          }
        }}
        utilities={utilities}
      />
      {showEnvSwitcher && (
        <div style={{ 
          position: 'absolute', 
          right: '10px', 
          top: '60px', 
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <EnvironmentSwitcher />
        </div>
      )}
    </>
  );
}

export default TopNav;
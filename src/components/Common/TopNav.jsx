import * as React from "react";
import { useState, useEffect } from "react";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getCurrentUser } from 'aws-amplify/auth';

async function getUserDetails() {
  try {
    const user = await getCurrentUser();
    if (user) {
      return user;
    } else {
      return 'Unauthenticated';
    }
  } catch (error) {
    return 'Error in Auth';
  }
}

function TopNav() {
  const { signOut } = useAuthenticator();

  const [userDetails, setUserDetails] = useState({
    username: "Loading...",
    email: "Loading..."
  });

  // Add this handler for sign out confirmation
  const handleSignOut = async () => {
    try {
      await signOut();
      return true; // Indicates successful confirmation
    } catch (error) {
      console.error('Error signing out:', error);
      return false; // Indicates failed confirmation
    }
  };

  useEffect(() => {
    async function fetchUserDetails() {
      const user = await getUserDetails();
      if (user && user !== 'Unauthenticated' && user !== 'Error in Auth') {
        setUserDetails({
          username: user.username,
          email: user.signInDetails?.loginId || "No email available"
        });
      }
    }
    fetchUserDetails();
  }, []);


  return (
    <TopNavigation
      identity={{
        href: "#",
        title: "SCA Management App",
        logo: {
          src: "/ccoe-phone-tool-icon.png",
          alt: "No Icon"
        }
      }}
      utilities={[
        {
            type: "button",
            text: "Sign Out",
            onClick: signOut,
            onConfirm: handleSignOut
          }, 
        {
            type: "button",
            text: "PRFAQ",
            href: "https://amazon.awsapps.com/workdocs-amazon/index.html#/document/51440f50ed92c2464ffbff4133cc68d378c33492248b1b894a654703115005aa",
            external: true,
            externalIconAriaLabel: " (opens in a new tab)"
          },
        {
          type: "button",
          iconName: "notification",
          title: "Notifications",
          ariaLabel: "Notifications (unread)",
          badge: true,
          disableUtilityCollapse: false
        },
        {
          type: "menu-dropdown",
          iconName: "settings",
          ariaLabel: "Settings",
          title: "Settings",
          items: [
            {
              id: "settings-org",
              text: "Future Feature 1"
            },
            {
              id: "settings-project",
              text: "Future Feature 2"
            }
          ]
        },
        {
          type: "menu-dropdown",
          text: userDetails.username,
          iconName: "user-profile",
          items: [
            { id: "email", text: "User: " + userDetails.email },
//            { id: "preferences", text: "Preferences" },
//            { id: "security", text: "Security" },
            {
              id: "support-group",
              text: "Support",
              items: [
                {
                  id: "documentation",
                  text: "Documentation (coming soon)",
        //          href: "www.example.com",
                  external: true,
                  externalIconAriaLabel:
                    " (opens in new tab)"
                },
                {
                  id: "feedback",
                  text: "Log Feature Request (coming soon)",
        //          href: "www.example.com",
                  external: true,
                  externalIconAriaLabel:
                    " (opens in new tab)"
                }
              ]
            }
          ]
        }
      ]}
    />
  );
}

export default TopNav;
import * as React from "react";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import { useAuthenticator } from '@aws-amplify/ui-react';

function TopNav() {
  const { signOut } = useAuthenticator();
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
            onClick: signOut
          }, 
        {
            type: "button",
            text: "Register",
            href: "/register",
            external: false,
            externalIconAriaLabel: " (opens in a new tab)"
          },   
        {
            type: "button",
            text: "Link",
            href: "https://example.com/",
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
              text: "Organizational settings"
            },
            {
              id: "settings-project",
              text: "Project settings"
            }
          ]
        },
        {
          type: "menu-dropdown",
          text: "AWS Builder Name",
          description: "email@amazon.com",
          iconName: "user-profile",
          items: [
            { id: "profile", text: "Profile" },
            { id: "preferences", text: "Preferences" },
            { id: "security", text: "Security" },
            {
              id: "support-group",
              text: "Support",
              items: [
                {
                  id: "documentation",
                  text: "Documentation",
                  href: "#",
                  external: true,
                  externalIconAriaLabel:
                    " (opens in new tab)"
                },
                { id: "support", text: "Support" },
                {
                  id: "feedback",
                  text: "Feedback",
                  href: "#",
                  external: true,
                  externalIconAriaLabel:
                    " (opens in new tab)"
                }
              ]
            },
            { id: "signout", text: "Sign out" }
          ]
        }
      ]}
    />
  );
}

export default TopNav;
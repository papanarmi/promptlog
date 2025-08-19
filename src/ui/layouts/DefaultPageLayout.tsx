"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/ace97b1b228a/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Icon Button — https://app.subframe.com/ace97b1b228a/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Topbar with center nav — https://app.subframe.com/ace97b1b228a/library?component=Topbar+with+center+nav_2d99c811-1412-432c-b923-b290dd513802
 */

import React, { useEffect, useState } from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { IconButton } from "../components/IconButton";
import { FeatherUser } from "@subframe/core";
import { TopbarWithCenterNav } from "../components/TopbarWithCenterNav";
import { supabase } from "@/lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { FeatherLogOut } from "@subframe/core";
import { PlSearchBar } from "../components/PlSearchBar";
import { DropdownMenu } from "../components/DropdownMenu";
import { Dialog } from "../components/Dialog";
import { Button } from "../components/Button";

interface DefaultPageLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<
  HTMLDivElement,
  DefaultPageLayoutRootProps
>(function DefaultPageLayoutRoot(
  { children, className, ...otherProps }: DefaultPageLayoutRootProps,
  ref
) {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    // Get user email on component mount
    const getUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };

    getUserEmail();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      // Hard clear any Supabase auth cache keys
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
    // Redirect to dedicated logout route to ensure auth guard updates
    navigate("/logout", { replace: true });
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-screen w-full flex-col items-center bg-default-font",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <TopbarWithCenterNav
        leftSlot={
          <Link to="/">
            <img
              className="h-5 flex-none object-cover"
              src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
            />
          </Link>
        }
        centerSlot={
          <div className="w-full max-w-md">
            <PlSearchBar className="w-full" compact />
          </div>
        }
        rightSlot={
          <>
            <IconButton size="large" icon={<FeatherLogOut />} onClick={handleLogoutClick} />
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton size="large" icon={<FeatherUser />} />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem icon={<FeatherUser />}>
                      {userEmail || 'Loading...'}
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </>
        }
      />
      {children ? (
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 overflow-y-auto bg-default-background" style={{scrollbarGutter: 'stable'}}>
          {children}
        </div>
      ) : null}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <Dialog.Content className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-heading-3 font-heading-3 text-default-font">Confirm Logout</h2>
                <p className="text-body font-body text-subtext-color">
                  Are you sure you want to log out? You will need to sign in again to access your account.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="neutral-secondary" onClick={handleCancelLogout}>
                  Cancel
                </Button>
                <Button variant="destructive-primary" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog>
      )}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;

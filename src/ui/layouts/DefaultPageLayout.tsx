"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/ace97b1b228a/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Icon Button — https://app.subframe.com/ace97b1b228a/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Topbar with center nav — https://app.subframe.com/ace97b1b228a/library?component=Topbar+with+center+nav_2d99c811-1412-432c-b923-b290dd513802
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { IconButton } from "../components/IconButton";
import { FeatherSettings } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { TopbarWithCenterNav } from "../components/TopbarWithCenterNav";
import { supabase } from "@/lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { FeatherLogOut } from "@subframe/core";

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
  const handleLogout = async () => {
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
        rightSlot={
          <>
            <IconButton size="large" icon={<FeatherSettings />} />
            <IconButton size="large" icon={<FeatherLogOut />} onClick={handleLogout} />
            <IconButton size="large" icon={<FeatherUser />} />
          </>
        }
      />
      {children ? (
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 overflow-y-auto bg-default-background">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;

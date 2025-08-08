"use client";

import React from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherDownload } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { FeatherSparkle } from "@subframe/core";
import { Stats } from "@/ui/components/Stats";
import { CustomComponent } from "@/ui/components/CustomComponent";
import { FeatherFolder } from "@subframe/core";
import { FeatherTag } from "@subframe/core";
import { FeatherCpu } from "@subframe/core";
import { Tabs } from "@/ui/components/Tabs";
import { FeatherTableProperties } from "@subframe/core";
import { FeatherSparkles } from "@subframe/core";
import { FeatherLayoutGrid } from "@subframe/core";
import { FeatherTable2 } from "@subframe/core";
import { PlSearchBar } from "@/ui/components/PlSearchBar";
import { Badge } from "@/ui/components/Badge";
import { FeatherPlus } from "@subframe/core";
import { Feed } from "@/ui/components/Feed";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";

interface PromptLogOverviewProps {
  onOpenTemplateDrawer: () => void;
}

function PromptLogOverview({ onOpenTemplateDrawer }: PromptLogOverviewProps) {
  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start">
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-4 bg-default-background px-12 py-16 overflow-auto">
          <div className="flex w-full max-w-[1280px] grow shrink-0 basis-0 flex-col items-start gap-8">
            <div className="flex w-full items-center justify-between">
              <span className="text-heading-1 font-heading-1 text-default-font">
                Dashboard
              </span>
              <div className="flex items-center gap-2">
                <IconButton
                  icon={<FeatherDownload />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <Button
                  disabled={false}
                  variant="neutral-secondary"
                  size="medium"
                  icon={null}
                  iconRight={null}
                  loading={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Create a collection
                </Button>
                <Button
                  icon={<FeatherSparkle />}
                  onClick={onOpenTemplateDrawer}
                >
                  Create a blank template
                </Button>
              </div>
            </div>
            <Stats
              text="Total prompts"
              text2="156"
              text3="Favorite prompts"
              text4="23"
              text5="Tagged prompts"
              text6="89"
            />
            <div className="flex w-full grow shrink-0 basis-0 items-start gap-8">
              <CustomComponent
                icon={<FeatherFolder />}
                text="Collections"
                text2="Outreach Templates Library"
                text3="15"
                text4="Design Feedback Scripts"
                text5="15"
                text6="Idea Generation"
                text7="15"
                text8="Launch-Ready Prompts"
                text9="15"
                text10="Core Prompts"
                text11="15"
                icon2={<FeatherTag />}
                text12="Tags"
                text13="Brainstorming"
                text14="15"
                text15="Copywriting"
                text16="15"
                text17="Email"
                text18="15"
                text19="Research"
                text20="15"
                icon3={<FeatherCpu />}
                text21="Models"
                text22="GPT 4o"
                text23="15"
                text24="GPT o1"
                text25="15"
              />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-6 self-stretch">
                <div className="flex w-full flex-col items-start gap-6">
                  <div className="flex w-full items-center">
                    <Tabs>
                      <Tabs.Item
                        active={true}
                        icon={<FeatherTableProperties />}
                      >
                        Overview
                      </Tabs.Item>
                      <Tabs.Item icon={<FeatherSparkles />}>
                        My templates
                      </Tabs.Item>
                    </Tabs>
                    <div className="flex items-center gap-2 self-stretch border-b border-solid border-neutral-border">
                      <Button
                        disabled={false}
                        variant="brand-secondary"
                        size="medium"
                        icon={<FeatherLayoutGrid />}
                        iconRight={null}
                        loading={false}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => {}}
                      />
                      <Button
                        disabled={false}
                        variant="neutral-tertiary"
                        size="medium"
                        icon={<FeatherTable2 />}
                        iconRight={null}
                        loading={false}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => {}}
                      />
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-start gap-4">
                    <PlSearchBar />
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <Badge icon={<FeatherTag />}>Writing</Badge>
                      <Badge variant="neutral" icon={<FeatherTag />}>
                        Code
                      </Badge>
                      <Badge variant="neutral" icon={<FeatherTag />}>
                        Analysis
                      </Badge>
                      <Badge variant="neutral" icon={<FeatherTag />}>
                        Translation
                      </Badge>
                      <Button
                        variant="neutral-tertiary"
                        size="small"
                        icon={<FeatherPlus />}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => {}}
                      >
                        Add tag
                      </Button>
                    </div>
                  </div>
                </div>
                <Feed text="Today" text2="Yesterday" overview={true} />
                <div className="flex w-full items-center justify-center gap-4">
                  <span className="grow shrink-0 basis-0 text-body font-body text-subtext-color">
                    Showing 1 – 10 of 30
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="brand-tertiary"
                      icon={<FeatherChevronLeft />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="brand-tertiary"
                      iconRight={<FeatherChevronRight />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default PromptLogOverview;

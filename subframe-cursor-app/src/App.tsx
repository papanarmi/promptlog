import React, { useState } from "react";
import PromptLogOverview from "./pages/PromptLogOverview";
import CreateATemplate_New_ from "./pages/CreateATemplate_New_";

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <PromptLogOverview onOpenTemplateDrawer={openDrawer} />
      <CreateATemplate_New_ open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
}

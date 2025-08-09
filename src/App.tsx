import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PromptLogOverview from "./pages/PromptLogOverview";
import CreateATemplate_New_ from "./pages/CreateATemplate_New_";
import TemplateDetailDrawer from "@/pages/TemplateDetailDrawer";
import { useEffect } from "react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isCreateRoute = pathname === "/templates/new";
  const detailMatch = pathname.startsWith("/templates/") && pathname !== "/templates/new" ? pathname.split("/templates/")[1] : "";
  const detailId = detailMatch && !detailMatch.includes("/") ? detailMatch : "";
  const editRequested = Boolean((location.state as any)?.edit);

  return (
    <>
      <PromptLogOverview />
      <CreateATemplate_New_
        open={isCreateRoute}
        onOpenChange={(open) => {
          if (open && !isCreateRoute) navigate('/templates/new');
          if (!open && isCreateRoute) navigate(-1);
        }}
      />
      <TemplateDetailDrawer
        open={Boolean(detailId)}
        templateId={detailId}
        startInEdit={editRequested}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && detailId) navigate(-1);
        }}
      />
    </>
  );
}

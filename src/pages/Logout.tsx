import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  React.useEffect(() => {
    (async () => {
      try {
        await supabase.auth.signOut();
      } catch {}
      navigate("/login", { replace: true });
    })();
  }, [navigate]);
  return null;
}



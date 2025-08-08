import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import UpdatePassword from "@/pages/UpdatePassword";
import RequireAuth from "@/lib/RequireAuth";
import { supabase } from "@/lib/supabaseClient";
import TemplateDetails from "@/pages/TemplateDetails";

function RedirectIfAuthed({ children }: { children: React.ReactElement }) {
  const [checked, setChecked] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSignedIn(!!data.session);
      setChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    unsubscribe = () => listener.subscription.unsubscribe();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!checked) return children; // let public page render until we know
  if (signedIn) return <Navigate to="/" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
        <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        />
        <Route
          path="/templates/:id/edit"
          element={
            <RequireAuth>
              <TemplateDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/templates"
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        />
        <Route
          path="/templates/new"
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        />
        <Route
          path="/templates/:id"
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        />
        {/* Protected routes for navigation and deep-linking */}
        <Route
          path="/templates"
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        />
        <Route
          path="/templates/new"
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        />
        <Route
          path="/collections/new"
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

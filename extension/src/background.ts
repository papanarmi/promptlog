import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL as string) || ""
const SUPABASE_ANON = (process.env.VITE_SUPABASE_ANON_KEY as string) || ""
const APP_URL = ((process.env.VITE_WEB_APP_URL as string) || "http://localhost:5173").replace(/\/$/, "")

let supabase: SupabaseClient | null = null

async function initSupabase() {
  if (supabase) return supabase
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const stored = await chrome.storage.local.get(["pl_session"]) as any
  const sess = stored?.pl_session
  if (sess?.access_token && sess?.refresh_token) {
    try {
      await supabase.auth.setSession({
        access_token: sess.access_token,
        refresh_token: sess.refresh_token,
      })
    } catch {}
  }

  // Also attempt to import existing session from webapp localStorage (when running on same origin)
  try {
    // In MV3 SW we cannot access page localStorage; rely on auth change events or explicit messages
  } catch {}

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.access_token && session?.refresh_token) {
      await chrome.storage.local.set({
        pl_session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        },
      })
      scheduleRefresh(session.expires_at)
    } else {
      await chrome.storage.local.remove("pl_session")
    }
  })

  if (sess?.expires_at) scheduleRefresh(sess.expires_at)
  return supabase
}

function scheduleRefresh(expiresAt?: number | null) {
  if (!expiresAt) return
  const when = Math.max(0, expiresAt * 1000 - Date.now() - 60_000)
  const trigger = Date.now() + when
  chrome.alarms.create("pl_refresh", { when: trigger })
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "pl_refresh") return
  const sb = await initSupabase()
  const { data: { session }, error } = await sb.auth.getSession()
  if (error || !session?.refresh_token) return
  await sb.auth.refreshSession({ refresh_token: session.refresh_token })
})

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  ;(async () => {
    const sb = await initSupabase()
    if (msg?.type === "linkSession") {
      const { access_token, refresh_token } = msg.payload || {}
      if (access_token && refresh_token) {
        try {
          await sb.auth.setSession({ access_token, refresh_token })
          const { data: { user } } = await sb.auth.getUser()
          sendResponse({ ok: true, user })
        } catch (e: any) {
          sendResponse({ ok: false, error: String(e?.message || e) })
        }
      } else {
        sendResponse({ ok: false, error: "missing tokens" })
      }
      return
    }
    if (msg?.type === "clearSession") {
      try {
        await sb.auth.signOut()
      } catch {}
      sendResponse({ ok: true })
      return
    }
    if (msg?.type === "clearWebAppSession") {
      try {
        // Notify any open web app tabs to clear their session
        chrome.tabs.query({ url: APP_URL + "/*" }, (tabs) => {
          for (const t of tabs) {
            if (t.id) chrome.tabs.sendMessage(t.id, { type: "pl-webapp-clear" })
          }
        })
      } catch {}
      sendResponse({ ok: true })
      return
    }
    if (msg?.type === "getProfile") {
      const { data: { user } } = await sb.auth.getUser()
      const name = (user?.user_metadata as any)?.full_name || (user?.user_metadata as any)?.name || null
      sendResponse({ authenticated: Boolean(user), email: user?.email ?? null, name })
      return
    }
    if (msg?.type === "login") {
      const { email, password } = msg.payload
      const { error } = await sb.auth.signInWithPassword({ email, password })
      sendResponse({ ok: !error, error: error?.message })
      return
    }
    if (msg?.type === "logout") {
      await sb.auth.signOut()
      sendResponse({ ok: true })
      return
    }
    if (msg?.type === "fetchTemplates") {
      const { page = 1, pageSize = 10 } = msg.payload || {}
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      const { data, count, error } = await sb
        .from("prompt_logs")
        .select("id, created_at, title, content, collection, tags", { count: "exact" })
        .eq("kind", "template")
        .order("created_at", { ascending: false })
        .range(from, to)
      sendResponse({ ok: !error, data: data || [], count: count ?? 0, error: error?.message })
      return
    }
  })()
  return true
})

// Expose a quick session probe
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  ;(async () => {
    if (msg?.type !== "sessionStatus") return
    const sb = await initSupabase()
    const { data: { session } } = await sb.auth.getSession()
    sendResponse({ authenticated: Boolean(session) })
  })()
  return true
})

// Proactively probe when user activates a tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  try {
    chrome.tabs.sendMessage(activeInfo.tabId, { type: 'pl-webapp-probe' })
  } catch {}
})

// Also probe when a tab finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    try { chrome.tabs.sendMessage(tabId, { type: 'pl-webapp-probe' }) } catch {}
  }
})



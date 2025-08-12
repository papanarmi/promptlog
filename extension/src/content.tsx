import React, { useEffect, useMemo, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

const APP_URL = ((process.env.VITE_WEB_APP_URL as string) || "http://localhost:5173").replace(/\/$/, "")

// If running on the web app domain, only act as a bridge between extension and page
if (location.origin === APP_URL) {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'pl-webapp-clear') {
      window.postMessage({ type: 'pl-webapp-clear' }, '*')
      sendResponse({ ok: true })
      return true
    }
    if (msg?.type === 'pl-webapp-probe') {
      // Re-emit current session tokens if any so extension can relink
      try {
        const raw = Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        if (raw) {
          const tok = JSON.parse(localStorage.getItem(raw) || 'null')
          const access_token = tok?.access_token
          const refresh_token = tok?.refresh_token
          if (access_token && refresh_token) {
            window.postMessage({ type: 'pl-link-session', payload: { access_token, refresh_token } }, '*')
          } else {
            window.postMessage({ type: 'pl-clear-session' }, '*')
          }
        } else {
          window.postMessage({ type: 'pl-clear-session' }, '*')
        }
      } catch {
        window.postMessage({ type: 'pl-clear-session' }, '*')
      }
      sendResponse({ ok: true })
      return true
    }
    return undefined
  })
  // Bridge web app auth events to extension background
  window.addEventListener('message', (ev) => {
    if (ev?.data?.type === 'pl-link-session') {
      const { access_token, refresh_token } = ev.data.payload || {}
      if (access_token && refresh_token) {
        try { chrome.runtime.sendMessage({ type: 'linkSession', payload: { access_token, refresh_token } }) } catch {}
      }
    }
    if (ev?.data?.type === 'pl-clear-session') {
      try { chrome.runtime.sendMessage({ type: 'clearSession' }) } catch {}
    }
  })
  // When templates change in the web app, notify background to broadcast a refresh
  const notifyTemplatesChanged = () => {
    try { chrome.runtime.sendMessage({ type: 'templatesChanged' }) } catch {}
  }
  window.addEventListener('template-created', notifyTemplatesChanged as EventListener)
  window.addEventListener('template-updated', notifyTemplatesChanged as EventListener)
  window.addEventListener('template-removed', notifyTemplatesChanged as EventListener)
  // Prevent mounting UI on the web app
} else {

function safeSendMessage<T = any>(msg: any): Promise<T | { ok?: boolean; error?: string }> {
  try {
    return chrome.runtime.sendMessage(msg) as any
  } catch (err) {
    try { console.debug('sendMessage failed', err) } catch {}
    return Promise.resolve({ ok: false, error: 'extension_context_invalidated' })
  }
}

function mountContainer() {
  // Ensure single host
  const existing = document.getElementById("pl-host-root")
  if (existing && existing.parentElement) {
    existing.parentElement.removeChild(existing)
  }

  const host = document.createElement("div")
  host.id = "pl-host-root"
  host.style.all = "initial"
  host.style.position = "relative"
  const shadow = host.attachShadow({ mode: "open" })

  const btn = document.createElement("button")
  btn.style.cssText = `
    position: fixed; right: 20px; bottom: 20px; z-index: 999999;
    width: 40px; height: 40px; border-radius: 9999px; border: 1px solid #e5e7eb;
    background: white; box-shadow: 0 1px 2px rgba(0,0,0,.08); cursor: pointer;
  `
  btn.title = "Open templates"
  btn.innerText = "PL"

  const panel = document.createElement("div")
  panel.style.cssText = `
    position: fixed; right: 20px; bottom: 70px; z-index: 999999;
    width: 380px; max-height: 60vh; overflow: auto; border: 1px solid #e5e7eb;
    background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.15);
    display: none;
  `

  btn.addEventListener("click", () => {
    const opening = panel.style.display === "none"
    panel.style.display = opening ? "block" : "none"
    if (opening) {
      try { window.dispatchEvent(new CustomEvent('pl-overlay-opened')) } catch {}
    }
  })

  // Mutation observer to re-attach host if DOM clears dynamic nodes
  const mo = new MutationObserver(() => {
    if (!document.body.contains(host)) {
      document.body.appendChild(host)
    }
  })
  mo.observe(document.documentElement, { childList: true, subtree: true })

  shadow.appendChild(btn)
  shadow.appendChild(panel)

  // Always attach to body so re-renders on the page don't remove our UI
  document.body.appendChild(host)

  return { shadow, panel }
}

type Item = { id: string; created_at: string; title: string; content: string; collection: string | null; tags: string[] }

function FeedPanel() {
  const [items, setItems] = useState<Item[]>([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const pageSize = 10
  const end = Math.min(page * pageSize, count)
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const lastReqIdRef = useRef(0)

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>()
    for (const it of items) {
      const d = new Date(it.created_at)
      const key = d.toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(it)
    }
    return Array.from(map.entries()).map(([k, arr]) => ({ label: k, items: arr }))
  }, [items])

  const load = async (p: number) => {
    const reqId = ++lastReqIdRef.current
    const auth = await safeSendMessage<{ authenticated: boolean }>({ type: "sessionStatus" })
    if (!auth || (auth as any).error) {
      if (reqId !== lastReqIdRef.current) return
      setAuthenticated(false)
      setItems([])
      setCount(0)
      return
    }
    if (reqId !== lastReqIdRef.current) return
    const isAuthed = Boolean((auth as any)?.authenticated)
    setAuthenticated(isAuthed)
    if (!isAuthed) {
      setItems([])
      setCount(0)
      return
    }
    const res = await safeSendMessage<{ ok: boolean; data: Item[]; count: number }>({ type: "fetchTemplates", payload: { page: p, pageSize } })
    if (reqId !== lastReqIdRef.current) return
    if ((res as any)?.ok) {
      setItems((res as any).data)
      setCount((res as any).count)
    } else {
      setItems([])
      setCount(0)
    }
  }

  useEffect(() => { load(page) }, [page])
  // Refresh whenever the overlay is opened
  useEffect(() => {
    const onOpened = () => { setPage(1) }
    window.addEventListener('pl-overlay-opened', onOpened as EventListener)
    return () => { window.removeEventListener('pl-overlay-opened', onOpened as EventListener) }
  }, [])

  // Listen for background broadcast to soft-refresh templates
  useEffect(() => {
    const listener = (msg: any) => {
      if (msg?.type === 'templatesChanged') {
        setPage(1)
      }
    }
    try { chrome.runtime.onMessage.addListener(listener as any) } catch {}
    return () => {
      try { chrome.runtime.onMessage.removeListener(listener as any) } catch {}
    }
  }, [])

  // Listen for web app login events (local dev): when storage changes on sb-* keys, prompt background to refresh
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key && ev.key.startsWith("sb-")) {
        safeSendMessage({ type: "sessionStatus" }).then(() => setPage(1))
      }
    }
    const onMessage = (ev: MessageEvent) => {
      if (ev.source !== window || !ev.data) return
      if (ev.data.type === 'pl-link-session') {
        const { access_token, refresh_token } = ev.data.payload || {}
        if (access_token && refresh_token) {
          safeSendMessage({ type: 'linkSession', payload: { access_token, refresh_token } }).then(() => setPage(1))
        }
      }
      if (ev.data.type === 'pl-clear-session') {
        safeSendMessage({ type: 'clearSession' }).then(() => setPage(1))
      }
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("message", onMessage)
    }
  }, [page])

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system", padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>Templates</strong>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => load(1)}
            title="Refresh"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "4px 8px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
          <small>{authenticated ? (count ? `Showing ${(page - 1) * pageSize + 1}–${end} of ${count}` : "No templates") : "Sign in from the popup"}</small>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {grouped.map((g) => (
          <div key={g.label}>
            <div style={{ color: "#6b7280", fontSize: 12, margin: "6px 0" }}>{g.label}</div>
            {g.items.map((it) => (
              <div key={it.id} style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {it.title || "(untitled)"}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {it.content}
                  </div>
                </div>
                <button
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    padding: "6px 10px",
                    background: "white",
                    cursor: "pointer"
                  }}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(it.content || "")
                    } catch {}
                  }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{ opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? "default" : "pointer" }}
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => (end >= count ? p : p + 1))}
          disabled={end >= count}
          style={{ opacity: end >= count ? 0.5 : 1, cursor: end >= count ? "default" : "pointer" }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

  const { panel } = mountContainer()
  createRoot(panel).render(<FeedPanel />)
}



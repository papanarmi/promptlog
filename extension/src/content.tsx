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
  // Also listen for logs created by the extension background and reflect in the web app feed
    try {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg?.type === 'templateCreated') {
          const created = msg.payload
          try { window.dispatchEvent(new CustomEvent('template-created', { detail: created })) } catch {}
          try { window.dispatchEvent(new CustomEvent('template-soft-refresh')) } catch {}
        }
      })
    } catch {}
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

function setupHoverAddToLog() {
  const hostname = location.hostname
  const providerSelectors: Record<string, string[]> = {
    'chat.openai.com': [
      'div[data-message-author-role]',
      '[data-testid^="conversation-turn-user"]',
      'article [data-message-author-role]',
    ],
    'chatgpt.com': [
      'div[data-message-author-role]',
      '[data-testid^="conversation-turn-user"]',
      'article [data-message-author-role]',
    ],
    'claude.ai': [
      'div[data-testid="user-message"]',
    ],
    'perplexity.ai': [
      'div[data-testid*="UserMessage" i]',
    ],
    'www.perplexity.ai': [
      'div[data-testid*="UserMessage" i]',
    ],
    'gemini.google.com': [
      'div[aria-live="polite"] div:has(blockquote)'
    ],
  }
  const genericSelectors = [
    'div[data-message-author-role]',
    '[data-testid^="conversation-turn-user"]',
    'article [data-message-author-role]',
  ]

  const selectors = providerSelectors[hostname] || genericSelectors

  const floating = document.createElement('button')
  floating.textContent = 'Add to log'
  floating.style.cssText = `
    position: fixed; z-index: 2147483647; display: none; pointer-events: auto;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif;
    font-size: 12px; color: #111827; background: #ffffff; border: 1px solid #e5e7eb;
    border-radius: 9999px; padding: 6px 10px; box-shadow: 0 1px 2px rgba(0,0,0,.08);
    cursor: pointer; user-select: none;
  `
  document.body.appendChild(floating)

  let currentTarget: HTMLElement | null = null
  let hideTimer: number | null = null

  const hideFloating = () => {
    if (hideTimer) window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(() => { floating.style.display = 'none'; currentTarget = null }, 120)
  }
  const showFloatingNear = (el: HTMLElement) => {
    if (!isVisible(el)) return
    const rect = el.getBoundingClientRect()
    const left = Math.max(8, Math.min(window.innerWidth - 140, rect.left + rect.width - 120))
    const top = Math.min(window.innerHeight - 36, rect.bottom + 8)
    floating.style.left = `${left}px`
    floating.style.top = `${top}px`
    floating.style.display = 'block'
  }

  floating.addEventListener('mouseenter', () => {
    if (hideTimer) { window.clearTimeout(hideTimer); hideTimer = null }
  })
  floating.addEventListener('mouseleave', () => hideFloating())
  const extractMessageText = (container: HTMLElement): string => {
    // Prefer rich content areas used by ChatGPT
    const markdown = container.querySelector('.markdown, .prose, [data-testid="conversation-turn"] .markdown') as HTMLElement | null
    if (markdown) return (markdown.innerText || '').trim()
    // If the role wrapper exists, try its text only
    const roleBlock = container.querySelector('[data-message-author-role]') as HTMLElement | null
    if (roleBlock) return (roleBlock.innerText || '').trim()
    return (container.innerText || '').trim()
  }

  floating.addEventListener('click', async (e) => {
    e.preventDefault(); e.stopPropagation()
    const target = currentTarget
    if (!target) return
    const text = extractMessageText(target)
    if (!text) return
    const title = text.split('\n').find((l) => l.trim().length > 0)?.trim()?.slice(0, 80) || '(untitled)'
    const res = await safeSendMessage<{ ok: boolean } & any>({ type: 'addLog', payload: { title, content: text } })
    if ((res as any)?.ok) {
      // brief visual feedback
      floating.textContent = 'Added!'
      setTimeout(() => { floating.textContent = 'Add to log' }, 1000)
      try { window.dispatchEvent(new CustomEvent('log-created', { detail: (res as any).data })) } catch {}
    }
  })

  const bindHover = (el: HTMLElement) => {
    if ((el as any).__pl_add_bound) return
    ;(el as any).__pl_add_bound = true
    el.addEventListener('mouseenter', () => {
      if (hideTimer) { window.clearTimeout(hideTimer); hideTimer = null }
      currentTarget = el
      showFloatingNear(el)
    })
    el.addEventListener('mouseleave', () => hideFloating())
  }

  const isUserMessage = (el: HTMLElement): boolean => {
    const role = (el.getAttribute('data-message-author-role') || '').toLowerCase()
    if (role) return role === 'user'
    const testid = el.getAttribute('data-testid') || ''
    if (testid.startsWith('conversation-turn-user')) return true
    const closestUser = el.closest('[data-message-author-role="user"], [data-testid^="conversation-turn-user"]')
    return Boolean(closestUser)
  }

  const scan = () => {
    try {
      const nodes: HTMLElement[] = []
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((n) => { if (n instanceof HTMLElement) nodes.push(n) })
      }
      for (const el of nodes) {
        if ((hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) && !isUserMessage(el)) continue
        // Bind to the message container itself
        const container = (el.closest('article') as HTMLElement | null) || el
        bindHover(container)
      }
    } catch {}
  }

  const mo = new MutationObserver((_m) => scan())
  mo.observe(document.documentElement, { childList: true, subtree: true })
  // periodic safety scan in case mutations are missed
  const interval = window.setInterval(() => scan(), 2000)
  window.addEventListener('scroll', () => { if (currentTarget) showFloatingNear(currentTarget) }, { passive: true })
  scan()
  // Cleanup when page unloads
  window.addEventListener('unload', () => { try { window.clearInterval(interval) } catch {} }, { once: true })
}

function isPotentialEditable(element: Element | null): element is HTMLTextAreaElement | HTMLInputElement | HTMLElement {
  if (!element) return false
  const el = element as HTMLElement
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement && (el.type === 'text' || el.type === 'search' || el.type === 'email' || el.type === 'url')) return true
  if (el.isContentEditable) return true
  const role = el.getAttribute('role') || ''
  if (role.toLowerCase() === 'textbox') return true
  return false
}

function isVisible(el: HTMLElement | null): el is HTMLElement {
  if (!el) return false
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return false
  if (rect.bottom <= 0 || rect.top >= window.innerHeight) return false
  return true
}

function findChatInputElement(): HTMLElement | null {
  // 1) Prefer currently focused editable
  const active = (document.activeElement as HTMLElement | null)
  if (isPotentialEditable(active)) return active

  // 2) Generic selectors across providers
  const genericSelectors = [
    'textarea',
    'input[type="text"]',
    'input[type="search"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
  ]
  const candidates: HTMLElement[] = []
  const addCandidate = (el: Element | null) => {
    if (!el) return
    if (!isPotentialEditable(el)) return
    const h = el as HTMLElement
    if (!candidates.includes(h)) candidates.push(h)
  }
  for (const sel of genericSelectors) Array.from(document.querySelectorAll(sel)).forEach(addCandidate)

  // 3) Provider-specific hints
  const hostname = location.hostname
  const providerSelectors: Record<string, string[]> = {
    'chat.openai.com': [
      'textarea#prompt-textarea',
      'textarea[aria-label*="message" i]',
      'textarea[placeholder*="message" i]',
      'textarea',
      'div[contenteditable="true"][data-lexical-editor="true"]',
      'div[contenteditable="true"][role="textbox"]',
      'form textarea',
    ],
    'chatgpt.com': [
      'textarea#prompt-textarea',
      'textarea[aria-label*="message" i]',
      'textarea[placeholder*="message" i]',
      'textarea',
      'div[contenteditable="true"][data-lexical-editor="true"]',
      'div[contenteditable="true"][role="textbox"]',
      'form textarea',
    ],
    'claude.ai': [
      'div[contenteditable="true"][role="textbox"]',
      'textarea',
    ],
    'gemini.google.com': [
      'div[contenteditable="true"][role="textbox"]',
      'textarea',
      'input[type="text"]',
    ],
    'perplexity.ai': [
      'textarea',
      'input[type="search"]',
      'div[contenteditable="true"][role="textbox"]',
    ],
    'www.perplexity.ai': [
      'textarea',
      'input[type="search"]',
      'div[contenteditable="true"][role="textbox"]',
    ],
  }
  const list = providerSelectors[hostname] || []
  for (const sel of list) Array.from(document.querySelectorAll(sel)).forEach(addCandidate)

  const visibleCandidates = candidates.filter(isVisible)
  if (visibleCandidates.length === 0) return null

  // Prefer the bottom-most visible candidate (typical chat input)
  const bottomMost = [...visibleCandidates].sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0]
  if (bottomMost) return bottomMost

  // Fallback: closest to vertical center (new chat screens)
  const centerY = window.innerHeight / 2
  let best: HTMLElement | null = null
  let bestDist = Number.POSITIVE_INFINITY
  for (const el of visibleCandidates) {
    const rect = el.getBoundingClientRect()
    const elCenter = rect.top + rect.height / 2
    const dist = Math.abs(elCenter - centerY)
    if (dist < bestDist) { best = el; bestDist = dist }
  }
  return best
}

function insertTextIntoElement(targetElement: HTMLElement, text: string): boolean {
  try {
    targetElement.focus()
    // Input or textarea path
    if (targetElement instanceof HTMLTextAreaElement || (targetElement instanceof HTMLInputElement && typeof targetElement.value === 'string')) {
      const inputEl = targetElement as HTMLTextAreaElement | HTMLInputElement
      const start = inputEl.selectionStart ?? inputEl.value.length
      const end = inputEl.selectionEnd ?? inputEl.value.length
      const before = inputEl.value.slice(0, start)
      const after = inputEl.value.slice(end)
      const nextValue = `${before}${text}${after}`
      // Use native setter so React/Vue listeners fire
      const proto = inputEl instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value')
      if (descriptor && typeof descriptor.set === 'function') {
        descriptor.set.call(inputEl, nextValue)
      } else {
        ;(inputEl as any).value = nextValue
      }
      const newCursor = (before + text).length
      try {
        inputEl.selectionStart = inputEl.selectionEnd = newCursor
      } catch {}
      try { inputEl.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText', data: text } as any)) } catch {}
      try { inputEl.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })) } catch { inputEl.dispatchEvent(new Event('input', { bubbles: true })) }
      const changeEv = new Event('change', { bubbles: true })
      inputEl.dispatchEvent(changeEv)
      return true
    }
    // Contenteditable path
    if ((targetElement as HTMLElement).isContentEditable) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        // Ensure the selection is within the target element
        let range = selection.getRangeAt(0)
        if (!targetElement.contains(range.startContainer)) {
          // Place cursor at end
          range = document.createRange()
          range.selectNodeContents(targetElement)
          range.collapse(false)
          selection.removeAllRanges()
          selection.addRange(range)
        }
        // Attempt modern API first
        if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
          const ok = document.execCommand('insertText', false, text)
          if (ok) {
            try { targetElement.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText', data: text } as any)) } catch {}
            try { targetElement.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })) } catch { targetElement.dispatchEvent(new Event('input', { bubbles: true })) }
            return true
          }
        }
        // Fallback: insert a text node
        range.deleteContents()
        const node = document.createTextNode(text)
        range.insertNode(node)
        // Move cursor after inserted node
        range.setStartAfter(node)
        range.setEndAfter(node)
        selection.removeAllRanges()
        selection.addRange(range)
        try { targetElement.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText', data: text } as any)) } catch {}
        try { targetElement.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })) } catch { targetElement.dispatchEvent(new Event('input', { bubbles: true })) }
        return true
      } else {
        // No selection — append
        targetElement.append(document.createTextNode(text))
        try { targetElement.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText', data: text } as any)) } catch {}
        try { targetElement.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })) } catch { targetElement.dispatchEvent(new Event('input', { bubbles: true })) }
        return true
      }
    }
  } catch {}
  return false
}

async function insertTemplateText(text: string): Promise<boolean> {
  const target = findChatInputElement()
  if (!target) return false
  return insertTextIntoElement(target, text)
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

  // Also set up hover 'Add to log' on provider pages (outside overlay)
  try { setupHoverAddToLog() } catch {}
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
                <div style={{ display: 'flex', gap: '0.25rem' }}>
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
                <button
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    padding: "6px 10px",
                    background: "white",
                    cursor: "pointer"
                  }}
                  onClick={async () => {
                    const ok = await insertTemplateText(it.content || "")
                    if (!ok) {
                      try { await navigator.clipboard.writeText(it.content || "") } catch {}
                    }
                  }}
                >
                  Insert
                </button>
                </div>
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



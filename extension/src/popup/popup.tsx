const open = (path: string) => chrome.tabs.create({ url: `${(process.env.VITE_WEB_APP_URL as string) || "http://localhost:5173"}${path}` })

const init = async () => {
  const profile = await chrome.runtime.sendMessage({ type: "getProfile" })
  const authed = document.getElementById("authed") as HTMLDivElement
  const anon = document.getElementById("anon") as HTMLDivElement
  if (profile?.authenticated) {
    authed.style.display = "flex"
    anon.style.display = "none"
    ;(document.getElementById("user-name") as HTMLDivElement).innerText = profile.name || "Account"
    ;(document.getElementById("user-email") as HTMLDivElement).innerText = profile.email || ""
  } else {
    authed.style.display = "none"
    anon.style.display = "flex"
  }

  document.getElementById("open-login")?.addEventListener("click", () => open("/login"))
  document.getElementById("open-signup")?.addEventListener("click", () => open("/signup"))
  document.getElementById("open-profile")?.addEventListener("click", () => open("/profile"))
  document.getElementById("open-settings")?.addEventListener("click", () => open("/settings"))
  document.getElementById("logout")?.addEventListener("click", async () => {
    const dlg = document.getElementById("confirm-dialog") as HTMLDialogElement
    const yes = document.getElementById("confirm-yes") as HTMLButtonElement
    const no = document.getElementById("confirm-no") as HTMLButtonElement
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open','')

    const onNo = () => { if (dlg.open) dlg.close(); dlg.removeAttribute('open'); cleanup() }
    const onYes = async () => {
      if (dlg.open) dlg.close(); dlg.removeAttribute('open')
      cleanup()
      await chrome.runtime.sendMessage({ type: "logout" })
      await chrome.runtime.sendMessage({ type: "clearSession" })
      await chrome.runtime.sendMessage({ type: "clearWebAppSession" })
      authed.style.display = "none"
      anon.style.display = "flex"
    }
    function cleanup() {
      yes.removeEventListener('click', onYes)
      no.removeEventListener('click', onNo)
    }
    yes.addEventListener('click', onYes)
    no.addEventListener('click', onNo)
  })
}

init()



'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft2, MobileProgramming, CloseCircle } from 'iconsax-reactjs'
import { detectPlatform, installSteps, isStandalone, type Platform } from '@/lib/install'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

/**
 * An always-available way to install the app, for the profile screen.
 *
 * The floating banner can be dismissed, is throttled by Chrome's engagement
 * heuristic, and on iOS can never be a real prompt at all — so on its own it
 * left members with no reliable route to a home-screen icon. This row is that
 * route: it is always present (until the app is actually installed) and shows
 * the correct steps for whatever the member is browsing in.
 */
export default function InstallButton() {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [bip, setBip] = useState<BIPEvent | null>(null)
  const [open, setOpen] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (isStandalone()) { setInstalled(true); return }
    setPlatform(detectPlatform())

    const onBIP = (e: Event) => { e.preventDefault(); setBip(e as BIPEvent) }
    const onInstalled = () => { setInstalled(true); setOpen(false) }
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // Already an installed app — the row would be a no-op.
  if (installed || !platform) return null

  async function click() {
    // Chrome handed us a real prompt — use it rather than explaining the menu.
    if (bip) {
      await bip.prompt()
      await bip.userChoice
      setBip(null)
      return
    }
    setOpen(true)
  }

  const guide = installSteps(platform)

  return (
    <>
      <button
        onClick={click}
        style={{
          width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', textAlign: 'right',
        }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 14, color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          <MobileProgramming size={18} variant="Bulk" color="#96613F" />
          הוספה למסך הבית
        </span>
        <ArrowLeft2 size={17} variant="Linear" color="#C0906F" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(40,30,24,0.55)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 448,
              background: '#FBF6F2', borderRadius: '24px 24px 0 0',
              padding: '22px 22px calc(28px + env(safe-area-inset-bottom))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 19, fontWeight: 700, color: '#3B2E27' }}>
                {guide.title}
              </p>
              <button onClick={() => setOpen(false)} aria-label="סגור"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                <CloseCircle size={22} variant="Linear" color="#9C8B7F" />
              </button>
            </div>

            <ol style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
              {guide.steps.map((s, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#5A473C,#3B2E27)', color: '#DBB89C',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)' }}>
                    {s}
                  </span>
                </li>
              ))}
            </ol>

            {guide.note && (
              <p style={{
                marginTop: 16, fontSize: 12.5, color: '#8B7A6C', lineHeight: 1.5,
                fontFamily: 'var(--font-assistant,sans-serif)',
              }}>
                {guide.note}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

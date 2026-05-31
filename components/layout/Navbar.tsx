'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Menu, X, Bell, LogIn, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const NAV_LINKS = [
  { href: '/', label: 'Intelligence' },
  { href: '/signal', label: 'Signal' },
  { href: '/amas', label: 'AMAs' },
  { href: '/founders', label: 'Founders' },
  { href: '/vote', label: 'Vote' },
  { href: '/learn', label: 'Learn' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    setEmail(null)
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-bg-border bg-bg-base/95 backdrop-blur-sm">
      {/* Ticker tape */}
      <div className="border-b border-bg-border bg-bg-surface py-1 ticker-wrap">
        <div className="ticker-content text-xs font-mono text-text-muted">
          {Array(3).fill(null).map((_, i) => (
            <span key={i}>
              ◈ TAO / BITTENSOR ECOSYSTEM &nbsp;·&nbsp; SUBNET INTELLIGENCE TERMINAL &nbsp;·&nbsp;
              COMMUNITY-POWERED RATINGS &nbsp;·&nbsp; AMA ARCHIVE &nbsp;·&nbsp; THE NERDS &nbsp;·&nbsp;
              DECENTRALIZED AI INFRASTRUCTURE &nbsp;·&nbsp; SUBNET ALPHA ANALYTICS &nbsp;·&nbsp;
              dTAO AMM MECHANICS &nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-mono text-lg font-bold">
              <span className="text-text-primary">TAO</span>
              <span className="text-accent-amber">*</span>
              <span className="text-text-primary">NERDS</span>
            </span>
            <span className="hidden sm:block text-xs font-mono text-text-muted border border-bg-border px-1.5 py-0.5 rounded">
              Subnet Intelligence
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'px-3 py-1.5 text-sm font-mono rounded transition-colors',
                  pathname === href
                    ? 'text-accent-amber bg-accent-amber/10 border border-accent-amber/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-text-muted">
              <span className="live-dot" />
              <span>LIVE</span>
            </div>

            {/* Alerts bell */}
            <button className="p-2 text-text-muted hover:text-text-primary transition-colors">
              <Bell size={16} />
            </button>

            {email ? (
              <button
                onClick={signOut}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
                title={email}
              >
                <LogOut size={14} />
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
              >
                <LogIn size={14} />
                Sign in
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-text-muted hover:text-text-primary"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-bg-border py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'px-3 py-2 text-sm font-mono rounded transition-colors',
                  pathname === href
                    ? 'text-accent-amber bg-accent-amber/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                {label}
              </Link>
            ))}
            {email ? (
              <button
                onClick={signOut}
                className="px-3 py-2 text-left text-sm font-mono rounded text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'px-3 py-2 text-sm font-mono rounded transition-colors',
                  pathname === '/login'
                    ? 'text-accent-amber bg-accent-amber/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

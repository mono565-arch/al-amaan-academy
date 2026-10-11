import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { isFirebaseConfigured } from '../lib/firebase';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { cn, isValidHttpUrl } from '../lib/utils';
import { Logo } from '../components/common';
import type { SiteSettings } from '../types';

// The public site has exactly five main sections. The admin panel is separate.
const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events & Achievements' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/feedback', label: 'Feedback & Complaints' },
] as const;

export default function PublicLayout() {
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.title = settings.academyName;
  }, [settings.academyName]);

  useEffect(() => {
    if (!isValidHttpUrl(settings.faviconUrl)) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }, [settings.faviconUrl]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      {!isFirebaseConfigured && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          Firebase is not configured yet. Add your VITE_FIREBASE_* values to .env.local. See the README.
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-navy">
            <Logo url={settings.logoUrl} name={settings.academyName} />
            <span className="text-lg font-bold text-navy">{settings.academyName}</span>
          </Link>

          <button
            type="button"
            className="btn-secondary px-3 py-2 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-navy',
                        isActive ? 'bg-navy text-white' : 'text-slate-700 hover:bg-slate-100',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <ul className="grid gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn('block rounded-md px-3 py-2.5 text-sm font-medium', isActive ? 'bg-navy text-white' : 'text-slate-700 hover:bg-slate-100')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <SiteFooter settings={settings} />
    </div>
  );
}

function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const socials = [
    { label: 'WhatsApp', href: settings.whatsappUrl },
    { label: 'Facebook', href: settings.facebookUrl },
    { label: 'Instagram', href: settings.instagramUrl },
    { label: 'YouTube', href: settings.youtubeUrl },
  ].filter((s) => isValidHttpUrl(s.href));
  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/[^+\d]/g, '')}` : '';

  return (
    <footer className="mt-16 bg-navy-dark text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-lg font-bold text-white">{settings.academyName}</p>
          {settings.footerText && <p className="text-sm leading-relaxed text-slate-300">{settings.footerText}</p>}
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Contact</p>
          {settings.address && <p className="whitespace-pre-line">{settings.address}</p>}
          {settings.phone && (
            <p>
              <a className="underline-offset-2 hover:underline" href={phoneHref}>{settings.phone}</a>
            </p>
          )}
          {settings.email && (
            <p>
              <a className="underline-offset-2 hover:underline" href={`mailto:${settings.email}`}>{settings.email}</a>
            </p>
          )}
          {isValidHttpUrl(settings.mapUrl) && (
            <p>
              <a className="underline-offset-2 hover:underline" href={settings.mapUrl} target="_blank" rel="noopener noreferrer">
                View location on Google Maps
              </a>
            </p>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Follow us</p>
          {socials.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full border border-slate-500 px-3 py-1 hover:bg-white hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">Social media links will appear here once added.</p>
          )}
          <p className="pt-4">
            <Link to="/admin/login" className="text-xs text-slate-400 underline-offset-2 hover:underline">Staff login</Link>
          </p>
        </div>
      </div>
      <div className="border-t border-slate-700 py-4 text-center text-xs text-slate-400">
        © {year} {settings.academyName}. All rights reserved.
      </div>
    </footer>
  );
}

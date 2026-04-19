import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Sobre', href: '#about' },
  { label: 'IA Clínica', href: '#ai' },
  { label: 'Depoimentos', href: '#testimonials' },
]

interface HeaderProps {
  isAuthPage?: boolean
}

export function Header({ isAuthPage = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-[5%] h-17 transition-all duration-300",
          "glass border-b",
          scrolled || isAuthPage
            ? "border-(--border-custom) shadow-[0_2px_20px_rgba(13,148,136,0.06)]"
            : "border-transparent"
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl font-extrabold tracking-[-0.5px] gradient-text">
            ImuneCare
          </span>
        </Link>

        {/* Nav links - desktop (hidden on auth pages) */}
        {!isAuthPage && (
          <ul className="hidden md:flex gap-8 list-none">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-(--text-muted) no-underline transition-colors duration-200 hover:text-teal-600 relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-linear-to-r after:from-teal-500 after:to-cyan-500 after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Actions - desktop */}
        <div className="hidden md:flex gap-2.5 items-center">
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-full border-[1.5px] border-teal-300 bg-transparent text-teal-600 font-semibold text-[0.8rem] cursor-pointer transition-all duration-200 hover:bg-teal-50 no-underline"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-4 py-1.5 rounded-full border-none bg-linear-to-br from-teal-500 to-cyan-500 text-white font-semibold text-[0.8rem] cursor-pointer transition-all duration-200 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] no-underline"
          >
            Começar agora
          </Link>
        </div>

        {/* Hamburger - mobile */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-(--border-custom) bg-white/80 text-(--text) transition-all duration-200 hover:bg-teal-50 hover:border-teal-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-99 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        className={cn(
          "fixed top-17 left-0 right-0 z-99 bg-white/95 backdrop-blur-xl border-b border-(--border-custom) shadow-[0_16px_48px_rgba(13,148,136,0.1)] transition-all duration-300 md:hidden",
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col p-6 gap-2">
          {!isAuthPage && navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-(--text-muted) no-underline py-3 px-4 rounded-xl transition-all duration-200 hover:bg-teal-50 hover:text-teal-600"
            >
              {link.label}
            </a>
          ))}
          <div className={cn("flex flex-col gap-3", !isAuthPage && "mt-4 pt-4 border-t border-(--border-custom)")}>
            <Link
              to="/login"
              className="text-center px-4 py-2.5 rounded-full border-[1.5px] border-teal-300 bg-transparent text-teal-600 font-semibold text-sm transition-all duration-200 no-underline"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-center px-4 py-2.5 rounded-full border-none bg-linear-to-br from-teal-500 to-cyan-500 text-white font-semibold text-sm shadow-[0_2px_12px_rgba(20,184,166,0.3)] no-underline"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

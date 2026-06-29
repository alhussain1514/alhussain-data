import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const links = [
    { href: '#services', label: 'Services' },
    { href: '#how', label: 'How it works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-17 flex items-center justify-between
                    px-6 md:px-16 border-b border-white/[0.06]"
         style={{ background: 'rgba(10,15,30,0.88)', backdropFilter: 'blur(14px)', height: '68px' }}>

      {/* Logo */}
      <Link to="/" className="flex items-center">
        <Logo size={34} textClass="font-display font-bold text-lg tracking-tight" />
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href}
               className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200">
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-3">
        <Link to="/login" className="btn-ghost">Log in</Link>
        <Link to="/register" className="btn-primary">Get started</Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white p-1"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-[68px] left-0 right-0 bg-navy-2 border-b border-white/[0.08]
                        flex flex-col p-6 gap-4 md:hidden animate-fade-in">
          {links.map((l) => (
            <a key={l.href} href={l.href}
               onClick={() => setOpen(false)}
               className="text-slate-300 hover:text-white text-sm font-medium py-1 transition-colors">
              {l.label}
            </a>
          ))}
          <hr className="border-white/10 my-1" />
          <Link to="/login" onClick={() => setOpen(false)}
                className="btn-ghost w-full justify-center">Log in</Link>
          <Link to="/register" onClick={() => setOpen(false)}
                className="btn-primary w-full justify-center">Get started</Link>
        </div>
      )}
    </nav>
  )
}

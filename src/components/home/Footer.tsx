interface FooterProps {
  companyName?: string
  brandName?: string
}

export function Footer({ companyName = 'SPIDERMINES', brandName = 'AI Tutor' }: FooterProps) {
  return (
    <footer className="mt-1 border-t border-white/20 bg-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-macos-textSecondary font-sf">
            Powered by <span className="font-semibold text-macos-text">{companyName}</span>
          </p>
          <p className="text-xs text-macos-textSecondary font-sf">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="landing-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(63,255,139,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(110,155,255,0.04) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <SignIn
        afterSignOutUrl="/"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            formButtonPrimary: {
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' },
            },
            card: {
              borderRadius: '1.5rem',
            },
          },
        }}
      />
    </div>
  )
}

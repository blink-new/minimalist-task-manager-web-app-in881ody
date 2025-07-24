import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Mail, Calendar, MessageSquare, FileText, ChevronRight } from 'lucide-react'
import DotMatrix from '@/components/DotMatrix'
import SignInPage from '@/components/auth/SignInPage'
import TaskManager from '@/components/TaskManager'
import { blink } from '@/blink/client'

type AppState = 'landing' | 'signin' | 'app'

const LandingPage = ({ onNavigate }: { onNavigate: (state: AppState) => void }) => {
  const [email, setEmail] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [showSubtitle, setShowSubtitle] = useState(false)

  useEffect(() => {
    // Trigger staggered animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const text = 'FoundrTasks'
    let index = 0
    
    // Start typing animation after 500ms
    const startDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(typeInterval)
          // Hide cursor after typing is complete
          setTimeout(() => {
            setShowCursor(false)
            // Show subtitle after cursor disappears
            setTimeout(() => setShowSubtitle(true), 300)
          }, 800)
        }
      }, 120) // Smooth typing speed
      
      return () => clearInterval(typeInterval)
    }, 500)

    return () => clearTimeout(startDelay)
  }, [])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to join the waitlist.",
        variant: "destructive"
      })
      return
    }
    
    console.log('Email submitted:', email)
    toast({
      title: "You're in!",
      description: "We'll be in touch soon with early access details.",
    })
    setEmail('')
  }

  const benefits = [
    {
      title: "Smart Suggestions",
      description: "Automatically create tasks from Gmail and Slack messages",
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      title: "Calendar-Aware", 
      description: "Finds open slots and books your deep work for you",
      icon: <Calendar className="h-6 w-6" />
    },
    {
      title: "Clean Planning Board",
      description: "Not a chatbot. Just you, your flow, and smart assistance",
      icon: <FileText className="h-6 w-6" />
    }
  ]

  const integrations = [
    { name: "Gmail", icon: <Mail className="h-8 w-8" /> },
    { name: "Google Calendar", icon: <Calendar className="h-8 w-8" /> },
    { name: "Slack", icon: <MessageSquare className="h-8 w-8" /> },
    { name: "Notion", icon: <FileText className="h-8 w-8" /> }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      <DotMatrix />
      
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 ${isLoaded ? 'animate-fade-in-down' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div className="text-2xl font-semibold text-gray-900">
            FoundrTasks
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => onNavigate('signin')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md transition-all duration-150 font-semibold text-sm tracking-wide"
            >
              SIGN IN
            </Button>
            <Button 
              onClick={() => document.getElementById('email-signup')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-all duration-150 hover:scale-[1.02] font-semibold text-sm tracking-wide"
            >
              JOIN WAITLIST
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="space-y-6">
          {/* Animated Headline */}
          <div className="h-24 md:h-32 flex items-center justify-center">
            <h1 className="text-7xl md:text-8xl font-semibold text-gray-900 font-mono">
              <span className="sr-only">FoundrTasks</span>
              <span aria-hidden="true">
                {displayedText}
                {showCursor && (
                  <span className="animate-pulse text-gray-400 ml-1">|</span>
                )}
              </span>
            </h1>
          </div>
          
          {/* Subtitle */}
          <div className={`transition-all duration-500 ease-out ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide">
              Maximize productivity.
            </p>
          </div>
          
          <div className="pt-6">
            <Button 
              onClick={() => document.getElementById('email-signup')?.scrollIntoView({ behavior: 'smooth' })}
              className={`bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-md transition-all duration-150 hover:scale-[1.02] hover:shadow-lg font-semibold tracking-wide animate-bounce-once ${isLoaded ? 'animate-fade-in-up delay-400' : 'opacity-0 translate-y-5'}`}
            >
              Join the Waitlist
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center border-t border-gray-100 relative z-10">
        <div className="animate-on-scroll">
          <h2 className="text-5xl md:text-6xl font-medium text-gray-900 mb-12 leading-tight">
            The Calm Before the Scale
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto font-light">
            FoundrTasks rethinks how productivity works. It doesn't wait for you to remember your next move — it suggests it. Based on your email, calendar, and goals. Then it blocks time for it, automatically.
          </p>
          <div className="inline-block bg-gray-50 px-6 py-3 rounded-lg border border-gray-200 font-mono text-gray-800 text-lg font-medium">
            productivity ≠ chaos
          </div>
        </div>
      </section>

      {/* Why FoundrTasks */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-100 relative z-10">
        <h2 className="text-5xl font-medium text-gray-900 text-center mb-20">
          Why FoundrTasks
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className={`animate-on-scroll text-center group hover:scale-[1.02] transition-all duration-200`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-gray-700 mb-6 flex justify-center">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center border-t border-gray-100 relative z-10">
        <div className="animate-on-scroll">
          <h2 className="text-5xl font-medium text-gray-900 mb-12">
            Integrates Seamlessly
          </h2>
          <div className="flex justify-center items-center gap-16 mb-12 flex-wrap">
            {integrations.map((integration, index) => (
              <div 
                key={index}
                className="flex flex-col items-center gap-3 text-gray-500 hover:text-gray-900 transition-all duration-150 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {integration.icon}
                <span className="text-sm font-medium tracking-wide">{integration.name}</span>
              </div>
            ))}
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            FoundrTasks plugs into your existing stack. Stay in flow while we handle the rest.
          </p>
        </div>
      </section>

      {/* Email Signup */}
      <section id="email-signup" className="py-24 px-6 max-w-2xl mx-auto text-center border-t border-gray-100 relative z-10">
        <div className="animate-on-scroll">
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 max-w-md px-4 py-3 text-lg border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 font-light"
              required
            />
            <Button 
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg rounded-md transition-all duration-150 hover:scale-[1.02] hover:shadow-lg whitespace-nowrap font-semibold tracking-wide"
            >
              Join the Waitlist
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-gray-100 animate-on-scroll relative z-10">
        <p className="text-gray-500 text-sm font-light">
          © 2025 FoundrTasks — Built by founders, for founders.
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setAuthLoading(state.isLoading)
      
      // Auto-navigate to app if user is authenticated
      if (state.user && !state.isLoading) {
        setAppState('app')
      } else if (!state.user && !state.isLoading && appState === 'app') {
        setAppState('landing')
      }
    })
    return unsubscribe
  }, [appState])

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Render based on app state
  switch (appState) {
    case 'signin':
      return <SignInPage onBack={() => setAppState('landing')} />
    case 'app':
      return user ? <TaskManager /> : <LandingPage onNavigate={setAppState} />
    default:
      return <LandingPage onNavigate={setAppState} />
  }
}
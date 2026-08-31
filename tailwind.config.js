/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
  	extend: {
  		screens: {
  			short: {
  				raw: '(max-height: 860px)'
  			},
  			xshort: {
  				raw: '(max-height: 720px)'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Plus Jakarta Sans',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'Plus Jakarta Sans',
  				'Poppins',
  				'sans-serif'
  			]
  		},
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			'primary-dark': '#2d6c8f',
  			sidebar: '#1e2a30',
  			brighture: {
  				// Straight from logo-black.svg
  				ink: '#1A1A1A',
  				gold: '#FFCD00',
  				'gold-deep': '#FFBD00',
  				// Derived from the three above for UI needs the logo doesn't cover.
  				// amber = decorative fills only (2.15:1 on white — never text).
  				// bronze = the text-safe gold, 5.27:1 on white.
  				amber: '#E0A800',
  				bronze: '#8A6600',
  				'ink-soft': '#4A463D',
  				cream: '#FDF9EF'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			'accent-strong': '#94a57a',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			card: '0 18px 40px rgba(18, 31, 38, 0.12)',
  			glass: '0 30px 80px -20px rgba(26, 26, 26, 0.38), 0 2px 8px rgba(26, 26, 26, 0.08)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			// Soft "breathing" glow for a staged/pending item awaiting confirmation.
  			breathe: {
  				'0%, 100%': {
  					boxShadow: '0 0 0 0 rgba(245, 158, 11, 0)',
  					backgroundColor: 'rgb(255 251 235)'
  				},
  				'50%': {
  					boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.22)',
  					backgroundColor: 'rgb(254 243 199)'
  				}
  			}
  		},
  		animation: {
  			breathe: 'breathe 2.2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

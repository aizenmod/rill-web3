import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import * as lighthouseStorage from '~/lib/lighthouse';

export const meta: MetaFunction = () => {
  return [
    { title: 'Rill - Web3 dApp Builder' },
    { name: 'description', content: 'Idea to web3 dApp in seconds' },
    { name: 'theme-color', content: '#ff5252' },  // Add theme color for mobile browsers
  ];
};

export const loader = () => json({});

// SVG components for illustrations
const IdeaToCodeSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none" className="mx-auto">
    <circle cx="100" cy="100" r="80" fill="#FFF0F0" />
    <path d="M100 50C83.4315 50 70 63.4315 70 80C70 91.5272 76.5352 101.529 86.1353 106.587C88.8954 108.142 90.7224 110.956 90.9488 114.148L91.5 120H108.5L109.051 114.148C109.278 110.956 111.105 108.142 113.865 106.587C123.465 101.529 130 91.5272 130 80C130 63.4315 116.569 50 100 50Z" fill="#FF5252" />
    <path d="M114 130H86C84.3431 130 83 131.343 83 133C83 134.657 84.3431 136 86 136H114C115.657 136 117 134.657 117 133C117 131.343 115.657 130 114 130Z" fill="#C50E29" />
    <path d="M109 140H91C89.3431 140 88 141.343 88 143C88 144.657 89.3431 146 91 146H109C110.657 146 112 144.657 112 143C112 141.343 110.657 140 109 140Z" fill="#C50E29" />
    <path d="M55 155L75 125L95 155" stroke="#333333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M60 145H90" stroke="#333333" strokeWidth="3" strokeLinecap="round" />
    <path d="M105 125H145V155H105V125Z" stroke="#333333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M125 155V125" stroke="#333333" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const OnchainSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none" className="mx-auto">
    <circle cx="100" cy="100" r="80" fill="#FFF0F0" />
    <rect x="50" y="70" width="100" height="60" rx="5" fill="#FF5252" />
    <path d="M60 90H140" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <circle cx="70" cy="80" r="5" fill="white" />
    <circle cx="85" cy="80" r="5" fill="white" />
    <circle cx="100" cy="80" r="5" fill="white" />
    <path d="M70 110L85 130L100 110L115 130L130 110" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M160 100H180" stroke="#C50E29" strokeWidth="4" strokeLinecap="round" />
    <path d="M20 100H40" stroke="#C50E29" strokeWidth="4" strokeLinecap="round" />
    <circle cx="45" cy="100" r="5" stroke="#333333" strokeWidth="2" />
    <circle cx="155" cy="100" r="5" stroke="#333333" strokeWidth="2" />
    <path d="M50 100C50 80 70 60 100 60C130 60 150 80 150 100C150 120 130 140 100 140C70 140 50 120 50 100Z" stroke="#333333" strokeWidth="2" strokeDasharray="4 4" />
  </svg>
);

const CollaborationSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none" className="mx-auto">
    <circle cx="100" cy="100" r="80" fill="#FFF0F0" />
    <circle cx="70" cy="80" r="25" fill="#FF5252" />
    <circle cx="130" cy="80" r="25" fill="#C50E29" />
    <circle cx="100" cy="130" r="25" fill="#FF867F" />
    <path d="M70 80L100 130" stroke="#333333" strokeWidth="3" strokeLinecap="round" />
    <path d="M130 80L100 130" stroke="#333333" strokeWidth="3" strokeLinecap="round" />
    <path d="M70 80L130 80" stroke="#333333" strokeWidth="3" strokeLinecap="round" />
    <circle cx="70" cy="80" r="10" fill="white" />
    <circle cx="130" cy="80" r="10" fill="white" />
    <circle cx="100" cy="130" r="10" fill="white" />
  </svg>
);

export default function Index() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize Lighthouse SDK on startup if API key is available
  useEffect(() => {
    const initLighthouse = async () => {
      const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
      if (apiKey) {
        try {
          await lighthouseStorage.init(apiKey);
        } catch (error) {
          console.error('Failed to initialize Lighthouse SDK:', error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      initLighthouse();
      
      // Add scroll listener for animations
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--rill-background)]">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="h-screen flex items-center overflow-hidden relative">
          {/* Background image */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-30 z-0"
            style={{ backgroundImage: 'url(/rill.webp)' }}
          ></div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--rill-background)] via-transparent to-[var(--rill-background)] z-0"></div>
          
          {/* Content */}
          <div className="relative z-10 w-full">
            <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
          </div>
        </section>
        
        {/* Alternating Feature Sections */}
        <section className="py-24 px-4">
          {/* Feature 1 - Image right */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
                <div className="mb-4 inline-block">
                  <div className="w-12 h-12 bg-[var(--rill-primary-light)] rounded-full flex items-center justify-center">
                    <div className="i-ph:code-duotone text-2xl text-white"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-6 text-[var(--rill-text-primary)]">
                  AI-Powered Code Generation
                </h2>
                <p className="text-lg mb-6 text-[var(--rill-text-secondary)]">
                  Simply describe what you want to build, and our AI will generate 
                  production-ready code for your Web3 applications. Skip the boilerplate
                  and focus on what makes your dApp unique.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">Smart contract generation</span>
                  </li>
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">Frontend scaffolding</span>
                  </li>
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">Web3 integrations</span>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <img 
                  src="/rill_pr1.webp" 
                  alt="AI-Powered Code Generation" 
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Feature 2 - Image left */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="flex flex-col lg:flex-row-reverse items-center">
              <div className="lg:w-1/2 lg:pl-12 mb-12 lg:mb-0">
                <div className="mb-4 inline-block">
                  <div className="w-12 h-12 bg-[var(--rill-primary-light)] rounded-full flex items-center justify-center">
                    <div className="i-ph:globe-duotone text-2xl text-white"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-6 text-[var(--rill-text-primary)]">
                  One-Click Deployment
                </h2>
                <p className="text-lg mb-6 text-[var(--rill-text-secondary)]">
                  Deploy your applications to multiple blockchain networks with a single click.
                  We handle the complex deployment process so you don't have to worry about gas,
                  transaction signing, or network configurations.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">Support for multiple chains</span>
                  </li>
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">Automatic gas optimization</span>
                  </li>
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">Contract verification</span>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2">
              <img 
                  src="/rill_pr2.webp" 
                  alt="One-Click Deployment" 
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Feature 3 - Image right */}
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
                <div className="mb-4 inline-block">
                  <div className="w-12 h-12 bg-[var(--rill-primary-light)] rounded-full flex items-center justify-center">
                    <div className="i-ph:share-network-duotone text-2xl text-white"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-6 text-[var(--rill-text-primary)]">
                  Decentralized Collaboration
                </h2>
                <p className="text-lg mb-6 text-[var(--rill-text-secondary)]">
                  Share your projects using IPFS for truly decentralized collaboration.
                  Work with team members anywhere in the world while maintaining full
                  ownership of your code and data.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">IPFS integration</span>
                  </li>
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">Permissionless sharing</span>
                  </li>
                  <li className="flex items-center">
                    <div className="i-ph:check-circle-fill text-[var(--rill-primary)] mr-2"></div>
                    <span className="text-[var(--rill-text-secondary)]">Real-time updates</span>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2">
              <img 
                  src="/rill_pr3.webp" 
                  alt="Decentralized Collaboration" 
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section with Gradient Transition */}
        <section className="py-20 px-4 bg-gradient-to-b from-[var(--rill-primary)] to-black text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-16">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line */}
              <div className="absolute top-10 left-0 w-full h-0.5 bg-white/30 hidden md:block"></div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[var(--rill-primary)] text-2xl font-bold mb-6 relative z-10 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect Wallet</h3>
                <p className="text-white/80">Connect your Web3 wallet to get started and authenticate securely.</p>
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[var(--rill-primary)] text-2xl font-bold mb-6 relative z-10 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Describe Your dApp</h3>
                <p className="text-white/80">Tell Rill what you want to build using natural language prompts.</p>
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[var(--rill-primary)] text-2xl font-bold mb-6 relative z-10 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Deploy & Share</h3>
                <p className="text-white/80">Deploy to your chosen blockchain and share with collaborators via IPFS.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Combined CTA and Footer section with shared background */}
      <div className="relative bg-black">
        {/* Shared background image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-25 z-0"
          style={{ backgroundImage: 'url(/rill_footer.webp)', backgroundAttachment: 'fixed' }}
        ></div>
        
        {/* CTA Section */}
        <section className="py-20 px-4 text-center text-white relative z-10">
          <div className="max-w-2xl mx-auto backdrop-blur-sm rounded-xl p-12 shadow-xl border border-gray-800 bg-black/40">
            <h2 className="text-3xl font-bold mb-6 text-white">
              Ready to build your Web3 dApp?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect your wallet and start building in minutes.
            </p>
            <button className="px-8 py-3 bg-[var(--rill-primary)] hover:bg-[var(--rill-primary-dark)] text-white font-medium rounded-md transition-colors duration-300 text-lg shadow-md">
              Connect Wallet
            </button>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-20 px-4 text-white relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col">
            {/* Footer top section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-16">
              <div className="flex items-center gap-3 mb-8 md:mb-0">
                <span className="text-4xl font-bold text-white">
                  Rill
                </span>
              </div>
              
              <div className="flex gap-6">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <div className="i-ph:twitter-logo text-3xl"></div>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <div className="i-ph:discord-logo text-3xl"></div>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <div className="i-ph:github-logo text-3xl"></div>
                </a>
              </div>
            </div>
            
            {/* Footer bottom section */}
            <div className="text-center border-t border-gray-800 pt-10">
              <p className="text-gray-400">
                © {new Date().getFullYear()} Rill. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

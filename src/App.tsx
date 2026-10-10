import React, { useState, useEffect } from 'react';
import { TarotCard } from './types/tarot';
import { TarotCardComponent } from './components/TarotCard';
import { CardModal } from './components/CardModal';
import { Navigation } from './components/Navigation';
import { MainNavigation } from './components/MainNavigation';
import { SplashScreen } from './components/SplashScreen';
import { PromotionalSplash } from './components/PromotionalSplash';
import { ContributionTicker } from './components/ContributionTicker';
import { ReadingPage } from './components/Reading/ReadingPage';
import { CatalogPage } from './components/Catalog/CatalogPage';
import { ComplaintsSection } from './components/ComplaintsSection';
import FAQSection from './components/FAQSection';
import { Eye, Star, Sparkles, ExternalLink, Phone, BookOpen, Library } from 'lucide-react';
import { ExplanationPage } from './components/Explanation/ExplanationPage';

// Define page types for navigation
type PageType = 'catalog' | 'reading' | 'complaints' | 'explanation';
type SplashType = 'promotional' | 'original' | 'none';

function App() {
  const [splashState, setSplashState] = useState<SplashType>('promotional');
  const [activePage, setActivePage] = useState<PageType>('catalog');

  return (
    <>
      {/* Contribution Ticker - Always on top */}
      <div className="fixed top-0 left-0 w-full z-50">
        <ContributionTicker />
      </div>

      {splashState === 'promotional' && (
        <PromotionalSplash 
          onFinished={() => setSplashState('original')} 
          paymentLink="https://mpago.la/1ajTuwR"
        />
      )}
      {splashState === 'original' && (
        <SplashScreen onFinished={() => setSplashState('none')} />
      )}
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
        <div className="container mx-auto px-4 py-8 pt-16">
          
          {/* Main Navigation */}
          <MainNavigation 
            activePage={activePage}
            onPageChange={setActivePage}
          />
          
          {/* Header - only show in catalog view */}
          {activePage === 'catalog' && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="text-yellow-400">
              <Eye className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white">Tarot de Thoth</h1>
            <div className="text-yellow-400">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <p className="text-purple-200 text-xl max-w-3xl mx-auto leading-relaxed">
            O sistema completo do Tarot de Thoth conforme apresentado por Aleister Crowley em 
            "O Livro de Thoth". Explore os 78 arcanos do novo Aeon de Horus através da perspectiva 
            de Thelema, Qabalah e magia cerimonial.
          </p>
          
          {/* Add the music button after the description */}
          <div className="flex justify-center mt-6">
            <a
              href="https://youtu.be/_PNj7lqVtkQ?si=l0Vjt7lJ51lOl2B4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-indigo-900/70 text-yellow-400 rounded-lg border border-purple-700/50 hover:bg-indigo-800 transition-colors shadow-lg"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              Música Ambiente para Mentalização
            </a>
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="text-center">
              <div className="text-yellow-400 text-2xl font-bold">78</div>
              <div className="text-purple-300 text-sm">Cartas Totais</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 text-2xl font-bold">4</div>
              <div className="text-purple-300 text-sm">Naipes</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 text-2xl font-bold">22</div>
              <div className="text-purple-300 text-sm">Atus</div>
            </div>
              </div>
            </div>
          )}

          {/* Page Content based on active page */}
          {activePage === 'catalog' ? (
            <CatalogPage />
          ) : activePage === 'reading' ? (
            <ReadingPage />
          ) : activePage === 'explanation' ? (
            <ExplanationPage />
          ) : (
            <ComplaintsSection />
          )}

          {/* Footer */}
          {/* FAQ Section - Bottom */}
          <FAQSection />

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-purple-800/50">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <p className="text-purple-300 text-lg">
                "Do que se fala não se pode dizer. Do que se pode dizer não se fala."
              </p>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-purple-400 text-sm mb-6">
              Baseado no sistema de Aleister Crowley • Tarot de Thoth • 93
            </p>
            
            {/* Social Media Links */}
            <div className="flex justify-center space-x-6 mb-6">
              <a
                href="https://www.linkedin.com/in/juliocamposmachado/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-yellow-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://x.com/DevJulioMachado"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-yellow-400 transition-colors"
                aria-label="Twitter/X"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/radiotatuapefm/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-yellow-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
            
            {/* Company Information */}
            <div className="flex flex-col items-center space-y-2 mb-4">
              <p className="text-yellow-400 font-semibold">Like Look Solutions</p>
              <div className="flex items-center space-x-2">
                <a 
                  href="https://likelook.wixsite.com/solutions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-300 hover:text-yellow-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  <span>likelook.wixsite.com/solutions</span>
                </a>
              </div>
              <div className="flex items-center text-purple-300">
                <Phone className="w-4 h-4 mr-1" />
                <span>WhatsApp: +55 11 97060-3441</span>
              </div>
            </div>
            <p className="text-purple-400 text-xs">
              Desenvolvido por Julio Campos Machado &copy; {new Date().getFullYear()}
            </p>
          </div>

          {/* No modal here - moved to individual page components */}
        </div>
      </div>
    </>
  );
}

export default App;
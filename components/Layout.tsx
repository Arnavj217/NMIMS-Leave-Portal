import React from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  user?: { name: string; role: string } | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-nmims-red text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* NMIMS Text Logo */}
            <div className="bg-white px-3 py-2 rounded shadow-sm flex flex-col items-center justify-center border border-gray-200">
              <span className="font-cinzel font-bold text-2xl leading-none text-black tracking-widest">
                NMIMS
              </span>
              <div className="w-full h-1.5 bg-nmims-red mt-1"></div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide font-cinzel text-white leading-tight">
              NMIMS Leave Application Portal
            </h1>
          </div>
          
          {user && (
            <button
              onClick={onLogout}
              className="bg-white text-nmims-red px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 relative">
        {user && (
           <div className="absolute top-2 left-4 md:top-8 md:left-4 z-10 bg-white border-l-4 border-nmims-red px-6 py-3 rounded shadow-md">
             <p className="text-nmims-black text-xl font-playfair capitalize">
               Welcome, {user.name}
             </p>
             <p className="text-nmims-red text-sm font-bold font-playfair uppercase tracking-wider">
               {user.role}
             </p>
           </div>
        )}
        
        {/* Spacer for welcome message on mobile/desktop */}
        {user && <div className="h-20 md:h-16"></div>}

        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
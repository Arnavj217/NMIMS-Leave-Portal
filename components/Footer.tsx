import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-nmims-red border-t border-white py-4 mt-auto">
      <div className="container mx-auto text-center">
        <h3 className="text-lg font-bold text-white mb-1 font-cinzel">NMIMS Leave Portal</h3>
        <p className="text-white font-medium text-sm mb-1">© 2025 All Rights Reserved</p>
        <p className="text-white font-medium text-sm">
          Made by <span className="font-bold text-white text-lg tracking-wide uppercase">Arav-Arnav</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
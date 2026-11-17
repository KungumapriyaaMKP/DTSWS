import React from 'react';
import { Instagram, Heart } from 'lucide-react';

export const DocumentaryFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#0B0D12]/10 bg-[#FAF8F2] px-6 py-10 text-[#525661] sm:px-10">
      <div className="mx-auto flex max-w-[1380px] items-center justify-center">
        <a
          href="https://www.instagram.com/sumya.web.studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex w-fit items-center gap-2.5 border border-[#0B0D12]/15 bg-white px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B0D12] shadow-sm transition-all duration-300 hover:border-[#FFD60A] hover:bg-[#FFD60A] hover:shadow-[0_10px_28px_rgba(255,214,10,0.45)]"
        >
          <span>Made with</span>
          <Heart className="h-3.5 w-3.5 fill-[#E11D48] text-[#E11D48] transition-transform duration-300 group-hover:scale-125" />
          <span>by</span>
          <span className="font-semibold">Sumya Web Studio</span>
          <Instagram className="ml-1 h-4 w-4 text-[#0B0D12]" />
        </a>
      </div>
    </footer>
  );
};

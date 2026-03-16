'use client';

import React, { useState, useEffect } from 'react';
import InfiniteSpinnerAnimation from '@/components/animations/InfiniteSpinnerAnimation';

interface PDFRendererProps {
  url: string;
}

const PDFRenderer: React.FC<PDFRendererProps> = ({ url }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Logic to handle ArXiv URL conversion:
     * Standard: https://arxiv.org/abs/2403.01234
     * Direct PDF: https://arxiv.org/pdf/2403.01234.pdf
     */
    let processedUrl = url;
    
    if (url.includes('arxiv.org')) {
      if (url.includes('/abs/')) {
        processedUrl = url.replace('/abs/', '/pdf/') + '.pdf';
      } else if (!url.endsWith('.pdf')) {
        processedUrl = url + '.pdf';
      }
    }

    // Add PDF viewer parameters for a cleaner AlphaXiv look
    // #toolbar=0 hides the default browser header
    // #navpanes=0 hides the sidebar
    // #view=FitH fits to horizontal width
    const finalUrl = `${processedUrl}#toolbar=0&navpanes=0&view=FitH`;
    
    setPdfUrl(finalUrl);
  }, [url]);

  return (
    <div className="relative h-full w-full bg-zinc-800 flex items-center justify-center">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
          <div className="w-12 h-12">
            <InfiniteSpinnerAnimation color="#3b82f6" strokeWidth={12} />
          </div>
          <p className="mt-4 text-xs font-medium text-zinc-400 uppercase tracking-widest">
            Loading Manuscript...
          </p>
        </div>
      )}

      {/* The actual viewer */}
      <iframe
        src={pdfUrl}
        className="h-full w-full border-none shadow-2xl"
        title="Document Viewer"
        onLoad={() => setIsLoading(false)}
      />

      {/* Small UI Guard for Browser PDF Download Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-zinc-900 pointer-events-none" />
    </div>
  );
};

export default PDFRenderer;
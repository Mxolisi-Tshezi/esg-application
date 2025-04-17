// src/types/html2pdf.d.ts

declare module 'html2pdf.js' {
    function html2pdf(): html2pdf.Worker;
    
    namespace html2pdf {
      interface Options {
        margin?: number | [number, number, number, number];
        filename?: string;
        image?: {
          type?: string;
          quality?: number;
        };
        html2canvas?: {
          scale?: number;
          useCORS?: boolean;
          logging?: boolean;
        };
        jsPDF?: {
          unit?: string;
          format?: string;
          orientation?: string;
        };
      }
      
      class Worker {
        from(element: HTMLElement | string): Worker;
        set(options: Options): Worker;
        save(): Worker;
        outputPdf(type?: string): Promise<Blob>;
      }
    }
    
    export default html2pdf;
  }
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Set worker path before any PDF.js usage
GlobalWorkerOptions.workerSrc = '/pdf.worker.js';


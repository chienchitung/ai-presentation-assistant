
// This assumes jspdf, html2canvas, and pptxgenjs are loaded from a CDN in index.html
import { Presentation } from '../types';

// Helper to wait for a library to be available on the window object
const getLibrary = <T>(name: string, timeout = 30000): Promise<T> => {
    return new Promise((resolve, reject) => {
        // Check if library is already there
        if ((window as any)[name]) {
            return resolve((window as any)[name]);
        }

        const started = Date.now();
        const intervalId = setInterval(() => {
            if ((window as any)[name]) {
                clearInterval(intervalId);
                resolve((window as any)[name]);
            } else if (Date.now() - started > timeout) {
                clearInterval(intervalId);
                reject(new Error(
                    `${name} library not found. Please check your internet connection and try again.`
                ));
            }
        }, 100);
    });
};

export const exportToPdf = async (fileName: string, slidesContainer: HTMLElement) => {
    try {
        const [jspdfModule, html2canvas] = await Promise.all([
            getLibrary<any>('jspdf'),
            getLibrary<any>('html2canvas')
        ]);

        const { jsPDF } = jspdfModule;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1280, 720],
        });

        const slideElements = slidesContainer.querySelectorAll('.aspect-video');
        
        for (let i = 0; i < slideElements.length; i++) {
            const slideElement = slideElements[i] as HTMLElement;
            const canvas = await html2canvas(slideElement, { scale: 1, width: 1280, height: 720 });
            const imgData = canvas.toDataURL('image/png');

            if (i > 0) {
                pdf.addPage([1280, 720], 'landscape');
            }
            pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
        }

        pdf.save(`${fileName.replace(/ /g, '_')}.pdf`);
    } catch (error) {
        console.error("Failed to export to PDF:", error);
        alert(`An error occurred while exporting to PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const exportToPptx = async (presentation: Presentation) => {
    try {
        const PptxgenJS = await getLibrary<any>('PptxgenJS');

        let pptx = new PptxgenJS();
        pptx.layout = 'LAYOUT_16X9';

        presentation.slides.forEach(s => {
            let slide = pptx.addSlide();
            
            // A simple mapping from our layout to pptxgenjs positions.
            // These can be made more sophisticated.
            switch (s.layout) {
                case 'TITLE_SLIDE':
                    slide.addText(s.title, { x: 0.5, y: 2.0, w: 9, h: 1, align: 'center', fontSize: 44, bold: true });
                    if (s.content[0]) {
                        slide.addText(s.content[0], { x: 0.5, y: 3.2, w: 9, h: 1, align: 'center', fontSize: 24 });
                    }
                    break;
                
                case 'SECTION_HEADER':
                     slide.addText(s.title, { x: 0.5, y: 2.5, w: 9, h: 1, align: 'center', fontSize: 36, bold: true });
                     if (s.content[0]) {
                         slide.addText(s.content[0], { x: 0.5, y: 3.5, w: 9, h: 1, align: 'center', fontSize: 20, color: '666666' });
                     }
                     break;

                case 'TWO_COLUMN':
                    slide.addText(s.title, { x: 0.5, y: 0.2, w: 9, h: 0.75, fontSize: 32, bold: true });
                    const mid = Math.ceil(s.content.length / 2);
                    const col1 = s.content.slice(0, mid);
                    const col2 = s.content.slice(mid);
                    slide.addText(col1, { x: 0.5, y: 1.0, w: 4.5, h: 4, fontSize: 18, bullet: true });
                    slide.addText(col2, { x: 5.0, y: 1.0, w: 4.5, h: 4, fontSize: 18, bullet: true });
                    break;
                
                case 'TITLE_CONTENT':
                default:
                    slide.addText(s.title, { x: 0.5, y: 0.2, w: 9, h: 0.75, fontSize: 32, bold: true });
                    slide.addText(s.content, { x: 0.5, y: 1.0, w: 9, h: 4, fontSize: 20, bullet: true });
                    break;
            }
        });

        pptx.writeFile({ fileName: `${presentation.title.replace(/ /g, '_')}.pptx` });

    } catch (error) {
        console.error("Failed to export to PPTX:", error);
        alert(`An error occurred while exporting to PPTX: ${error instanceof Error ? error.message : String(error)}`);
    }
}

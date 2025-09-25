
// Add declarations for global libraries from CDN, as they are not imported via ES modules.
declare const pdfjsLib: any;
declare const mammoth: any;

export const parseFile = (file: File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    if (fileName.endsWith('.txt') || fileType === 'text/plain' || fileName.endsWith('.md') || fileType === 'text/markdown') {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
                resolve(event.target.result);
            } else {
                reject(new Error('Failed to read file content.'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading the file.'));
        reader.readAsText(file);
    } else if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (event.target && event.target.result) {
                try {
                    const pdf = await pdfjsLib.getDocument(event.target.result).promise;
                    let textContent = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const text = await page.getTextContent();
                        textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
                    }
                    resolve(textContent);
                } catch (err) {
                    console.error("PDF Parsing Error:", err);
                    reject(new Error('Could not parse the PDF file. It might be corrupted or protected.'));
                }
            } else {
                reject(new Error('Failed to read PDF file.'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading the file.'));
        reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.doc')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
             if (event.target && event.target.result) {
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
                    resolve(result.value);
                } catch (err) {
                    console.error("DOCX Parsing Error:", err);
                    reject(new Error('Could not parse the DOCX file.'));
                }
             } else {
                reject(new Error('Failed to read DOCX file.'));
             }
        };
        reader.onerror = () => reject(new Error('Error reading the file.'));
        reader.readAsArrayBuffer(file);
    }
    else {
      reject(new Error('Unsupported file type. Please upload a .txt, .md, .pdf, or .docx file.'));
    }
  });
};

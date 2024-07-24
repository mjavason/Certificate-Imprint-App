import pdf2html from 'pdf2html';
import fs from 'fs';
import path from 'path';

// Function to convert PDF to HTML using pdf2html library
function convertPdfToHtmlUsingLibrary(inputPdf){
  return new Promise((resolve, reject) => {
    pdf2html.html(inputPdf, (err, html) => {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
}

// Example usage
const inputPdfPath = path.join(__dirname, 'input.pdf');
const outputHtmlPath = path.join(__dirname, 'output.html');

convertPdfToHtmlUsingLibrary(inputPdfPath)
  .then((html) => {
    fs.writeFileSync(outputHtmlPath, html);
    console.log('PDF successfully converted to HTML and saved to file.');
  })
  .catch((error) => {
    console.error('Failed to convert PDF to HTML:', error);
  });

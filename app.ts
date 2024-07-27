import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import os from 'os';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import imageSize from 'image-size';
import puppeteer from 'puppeteer';
import archiver from 'archiver';

//#region App Setup
const app = express();
dotenv.config({ path: './.env' });

const SWAGGER_OPTIONS = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Typescript SFA',
      version: '1.0.0',
      description:
        'This is a single file typescript template app for faster idea testing and prototyping. It contains tests, one demo root API call, basic async error handling, one demo axios call and .env support.',
      contact: {
        name: 'Orji Michael',
        email: 'orjimichael4886@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Environment',
      },
      {
        url: 'https://certificate-imprint-app-backend.onrender.com',
        description: 'Staging Environment',
      },
    ],
    tags: [
      {
        name: 'Default',
        description: 'Default API Operations that come inbuilt',
      },
    ],
  },
  apis: ['**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(SWAGGER_OPTIONS);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(morgan('dev'));
const tempDir = os.tmpdir(); // Get the system temporary directory

//#endregion

//#region Keys and Configs
const PORT = process.env.PORT || 3000;
const baseURL = 'https://httpbin.org';
//#endregion

//#region Code here
function applyStylesFromJSON(styleObject: {
  width: string;
  xAxis: string;
  yAxis: string;
  fontSize: string;
  color: string;
  fontStyle: string;
  alignment: string;
}) {
  // Construct CSS text from JSON object
  const cssText = `
    width: ${styleObject.width}px;
    left: ${styleObject.xAxis}px;
    top: ${styleObject.yAxis}px;
    font-size: ${styleObject.fontSize}px;
    color: ${styleObject.color};
    font-style: ${styleObject.fontStyle || 'normal'};
    text-align: ${styleObject.alignment};
    position: absolute;
  `;

  return cssText;
}

async function renderMailTemplate(templatePath: string, data: object) {
  // Load the email template
  // const templatePath = './email-templates/welcome-email.html';
  const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Compile the template
  const compiledTemplate = handlebars.compile(emailTemplate);
  return compiledTemplate(data);
}

async function convertHtmlToPdf(htmlContent: string, outputPath: string) {
  // Launch a new browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the HTML content
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Convert the page to PDF
  await page.pdf({
    path: outputPath, // Output file path
    format: 'A4', // Paper format (e.g., 'A4', 'Letter')
    printBackground: true, // Print background colors and images
  });

  // Close the browser
  await browser.close();
  return outputPath;
}

/**
 * Converts HTML content to an image and saves it to the specified output path.
 *
 * @param htmlPath - The path to the HTML file to be converted.
 * @param outputPath - The path where the output image will be saved.
 */
async function convertHtmlToImage(
  htmlContent: string,
  outputPath: string,
  imageWidth: number,
  imageHeight: number
) {
  // Launch a new browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the HTML content
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Set the viewport size
  await page.setViewport({ width: imageWidth, height: imageHeight });

  // Capture a screenshot of the page
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    type: 'jpeg',
    quality: 100,
  });

  // Close the browser
  await browser.close();

  return outputPath;
}

/**
 * Send a file as a download to the client.
 *
 * @param res - The Express response object.
 * @param filePath - The path to the file to be downloaded.
 * @param fileName - Optional. The name to use for the downloaded file.
 */
function sendFileAsDownload(
  res: Response,
  filePath: string,
  fileName?: string
): void {
  const options: { headers?: { 'Content-Disposition': string } } = {};

  // If a fileName is provided, set the Content-Disposition header with the filename
  if (fileName) {
    options.headers = {
      'Content-Disposition': `attachment; filename="${fileName}"`,
    };
  }

  // Use res.download to send the file
  res.download(
    filePath,
    fileName || path.basename(filePath),
    options,
    (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error downloading file.');
      }
    }
  );
}

/**
 * Get the dimensions of an image from a URL.
 *
 * @param url - The URL of the image.
 * @returns A promise that resolves with the width and height of the image.
 */
async function getImageSizeFromUrl(
  url: string
): Promise<{ width: number; height: number }> {
  try {
    // Fetch the image as a buffer using axios
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Get the image dimensions
    const dimensions = await imageSize(buffer);

    if (!dimensions || !dimensions.width || !dimensions.height) {
      throw new Error('Unable to determine image dimensions');
    }

    return { width: dimensions.width, height: dimensions.height };
  } catch (error: any) {
    throw new Error(`Failed to get image size: ${error.message}`);
  }
}

/**
 * Creates a zip file from an array of file paths.
 * @param filePaths - An array of file paths to include in the zip file.
 * @param outputZipPath - The path where the zip file will be saved.
 */
async function createZipFromFiles(
  filePaths: string[],
  outputZipPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a write stream for the output zip file
    const output = fs.createWriteStream(outputZipPath);

    // Create a new archiver instance
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Listen for errors
    archive.on('error', (err) => reject(err));

    // Pipe archive data to the file
    output.on('close', () => resolve());
    archive.pipe(output);

    // Append files to the archive
    filePaths.forEach((filePath) => {
      const fileName = path.basename(filePath);
      archive.file(filePath, { name: fileName });
    });

    // Finalize the archive
    archive.finalize();
  });
}

/**
 * @swagger
 * /batch-imprint:
 *   post:
 *     summary: Upload imprint data to be processed
 *     description: With the coordinates, template, and data, just leave the rest to us. You'll get a zip file with all the images.
 *     tags:
 *       - Imprint
 *     requestBody:
 *       description: JSON object containing imprint data, coordinates, and template information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of strings for imprinting
 *               coordinates:
 *                 type: object
 *                 description: Coordinates for imprinting
 *                 properties:
 *                   x:
 *                     type: number
 *                     description: X coordinate
 *                   y:
 *                     type: number
 *                     description: Y coordinate
 *               template:
 *                 type: string
 *                 description: URL or identifier for the template to be used
 *     responses:
 *       '200':
 *         description: Successfully processed the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: string
 *       '400':
 *         description: Bad request, invalid data
 */
app.post('/batch-imprint', async (req: Request, res: Response) => {
  const templatePath = req.body.template; //'https://via.placeholder.com/1500';
  const textData = req.body.data;
  const coordinates = req.body.coordinates;

  if (!templatePath || !textData || !coordinates)
    return res.status(400).send({ success: false, message: 'Data missing' });

  const imageDimensions = await getImageSizeFromUrl(templatePath);
  const styles = applyStylesFromJSON(coordinates);
  const savedImages: string[] = [];

  for (let i = 0; i < textData.length; i++) {
    const renderedHtml = await renderMailTemplate('template.txt', {
      imageUrl: 'https://via.placeholder.com/1500', //filePath,
      imageWidth: imageDimensions.width,
      imageHeight: imageDimensions.height,
      bodyWithConfigs: `<div style="${styles}">${textData[i]}</div>`,
    });

    let imagePath = await convertHtmlToImage(
      renderedHtml,
      `${tempDir}/${i}${Date.now()}.jpg`,
      imageDimensions.width,
      imageDimensions.height
    );

    savedImages.push(imagePath);
  }
  let zipFilePath = `${tempDir}/${Date.now()}.zip`;
  await createZipFromFiles(savedImages, zipFilePath);

  return sendFileAsDownload(res, zipFilePath);
});
//#endregion

//#region Server Setup

// Function to ping the server itself
async function pingSelf() {
  try {
    const { data } = await axios.get(`http://localhost:5000`);
    console.log(`Server pinged successfully: ${data.message}`);
    return true;
  } catch (e: any) {
    console.error(`Error pinging server: ${e.message}`);
    return false;
  }
}

// Route for external API call
/**
 * @swagger
 * /api:
 *   get:
 *     summary: Call a demo external API (httpbin.org)
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/api', async (req: Request, res: Response) => {
  try {
    const result = await axios.get(baseURL);
    return res.send({
      message: 'Demo API called (httpbin.org)',
      data: result.status,
    });
  } catch (error: any) {
    console.error('Error calling external API:', error.message);
    return res.status(500).send({ error: 'Failed to call external API' });
  }
});

// Route for health check
/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health check
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/', (req: Request, res: Response) => {
  return res.send({ message: 'API is Live!' });
});

// Middleware to handle 404 Not Found
/**
 * @swagger
 * /obviously/this/route/cant/exist:
 *   get:
 *     summary: API 404 Response
 *     description: Returns a non-crashing result when you try to run a route that doesn't exist
 *     tags: [Default]
 *     responses:
 *       '404':
 *         description: Route not found
 */
app.use((req: Request, res: Response) => {
  return res
    .status(404)
    .json({ success: false, message: 'API route does not exist' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // throw Error('This is a sample error');

  console.log(err);
  console.log(`${'\x1b[31m'}${err.message}${'\x1b][0m]'} `);
  return res
    .status(500)
    .send({ success: false, status: 500, message: err.message });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

// (for render services) Keep the API awake by pinging it periodically
// setInterval(pingSelf, 600000);

//#endregion

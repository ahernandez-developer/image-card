import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { imageGenerator } from './src/imageGenerator.js';
import { apiKeyAuth } from './middleware/apiKeyAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/v1/generate-social-card', apiKeyAuth, async (req, res) => {
  try {
    const headlineText = req.body?.headlineText;
    const options = req.body?.options;
    
    if (!headlineText || !req.files || !req.files.mainImage) {
      return res.status(400).send({ error: 'headlineText and mainImage are required' });
    }

    const mainImage = req.files.mainImage;

    // Convert the uploaded image file to a buffer
    const mainImageBuffer = mainImage.data;

    // Create a data URL from the buffer to pass to the imageGenerator
    const mainImageUrl = `data:${mainImage.mimetype};base64,${mainImageBuffer.toString('base64')}`;


    const imageBuffer = await imageGenerator({
      headlineText,
      mainImageUrl,
      options
    });

    const outputFormat = options?.outputFormat === 'png' ? 'png' : 'jpeg';
    res.set('Content-Type', `image/${outputFormat}`);
    res.send(imageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to generate image' });
  }
});

export default app;
import request from 'supertest';
import { jest } from '@jest/globals';

process.env.API_KEY = 'your-secret-api-key';

const mockImageGenerator = jest.fn();
jest.unstable_mockModule('../src/imageGenerator.js', () => ({
  imageGenerator: mockImageGenerator,
}));

// Dynamically import the app after mocking and setting env var
const { default: app } = await import('../index.js');

describe('POST /api/v1/generate-social-card', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 200 OK with an image', async () => {
    const mockImageBuffer = Buffer.from('mock-image-data');
    mockImageGenerator.mockResolvedValue(mockImageBuffer);

    const response = await request(app)
      .post('/api/v1/generate-social-card')
      .set('x-api-key', 'your-secret-api-key')
      .field('headlineText', 'Test Headline')
      .attach('mainImage', Buffer.from('mock-image-data'), 'test.jpg');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/jpeg');
    expect(response.body).toEqual(mockImageBuffer);
    expect(mockImageGenerator).toHaveBeenCalledTimes(1);
  });

  it('should return 401 if api key is missing', async () => {
    const response = await request(app)
      .post('/api/v1/generate-social-card')
      .field('headlineText', 'Test Headline')
      .attach('mainImage', Buffer.from('mock-image-data'), 'test.jpg');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });
  
  it('should return 401 if api key is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/generate-social-card')
      .set('x-api-key', 'invalid-api-key')
      .field('headlineText', 'Test Headline')
      .attach('mainImage', Buffer.from('mock-image-data'), 'test.jpg');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });


  it('should return a 400 Bad Request if headlineText is missing', async () => {
    const response = await request(app)
      .post('/api/v1/generate-social-card')
      .set('x-api-key', 'your-secret-api-key')
      .attach('mainImage', Buffer.from('mock-image-data'), 'test.jpg');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'headlineText and mainImage are required' });
    expect(mockImageGenerator).not.toHaveBeenCalled();
  });

  it('should return a 400 Bad Request if mainImage is missing', async () => {
    const response = await request(app)
      .post('/api/v1/generate-social-card')
      .set('x-api-key', 'your-secret-api-key')
      .field('headlineText', 'Test Headline');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'headlineText and mainImage are required' });
    expect(mockImageGenerator).not.toHaveBeenCalled();
  });

  it('should return a 500 Internal Server Error if imageGenerator fails', async () => {
    mockImageGenerator.mockRejectedValue(new Error('Image generation failed'));

    const response = await request(app)
      .post('/api/v1/generate-social-card')
      .set('x-api-key', 'your-secret-api-key')
      .field('headlineText', 'Test Headline')
      .attach('mainImage', Buffer.from('mock-image-data'), 'test.jpg');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to generate image' });
  });
});
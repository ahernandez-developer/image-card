# Social Image Generator API

A robust and high-performance RESTful API to dynamically generate social media images from a predefined template. Built with Node.js, Express, and the powerful `sharp` library for image manipulation.

![Example Image](https://i.imgur.com/your-example-image.jpg) <!-- It's a good idea to add a real example image here -->

## Features

- **Dynamic Image Composition:** Create social media cards by providing a background image and headline text.
- **High-Performance:** Leverages `sharp` for fast image processing.
- **Customizable Template:**
  - Circular logo overlay.
  - Dynamic gradient to ensure text readability.
  - Customizable accent bar color.
  - Automatic text wrapping.
- **Simple RESTful API:** Easy to integrate with any application.
- **Frontend App:** A simple, beautiful welcome app to test the API directly.
- **Dockerized:** Ready for deployment with Docker and `docker-compose`.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/image-edit.git
    cd image-edit
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the root of the project and add the following environment variables:

    ```env
    API_KEY=your-secret-api-key
    ```

## Usage

### Running the Server

To start the server, run the following command:

```bash
npm start
```

The server will be running at `http://localhost:3000`.

### Using the Frontend

Navigate to `http://localhost:3000` in your browser to use the welcome app. You can upload an image, enter your headline text, and provide your API key to generate an image.

### Using the API with `curl`

You can also use `curl` to interact with the API directly:

```bash
curl -X POST http://localhost:3000/api/v1/generate-social-card \
  -H "x-api-key: your-secret-api-key" \
  -F "headlineText=Your headline text here" \
  -F "mainImage=@/path/to/your/image.jpg"
```

## API Reference

### `POST /api/v1/generate-social-card`

Generates a social media image.

**Headers:**

- `x-api-key` (string, required): Your secret API key.

**Request Body (`multipart/form-data`):**

- `headlineText` (string, required): The text to be displayed on the image.
- `mainImage` (file, required): The background image file.
- `options` (string, optional): A JSON string with additional options.
  - `accentColor` (string, optional): The hex color for the accent bar (e.g., `#FFD700`).
  - `outputFormat` (string, optional): `jpeg` or `png`. Defaults to `jpeg`.

**Example `options` JSON string:**

```json
{
  "accentColor": "#FF5733",
  "outputFormat": "png"
}
```

## Environment Variables

- `API_KEY` (required): Your secret API key.
- `PORT`: The port the server should run on. Defaults to `3000`.

## Running with Docker

This project is fully dockerized and ready for deployment.

### Build and Run with Docker

1.  **Build the image:**
    ```bash
    docker build -t image-generator .
    ```

2.  **Run the container:**
    ```bash
    docker run -p 3000:3000 -e API_KEY=your-secret-api-key image-generator
    ```

### Run with `docker-compose`

A `docker-compose.yml` file is included for easy deployment, especially with a reverse proxy like Traefik.

1.  **Create a `.env` file** on your VPS with your domain and API key:
    ```env
    DOMAIN_NAME=your-domain.com
    API_KEY=your-secret-api-key
    ```

2.  **Start the services:**
    ```bash
    docker-compose up -d --build
    ```

This will build the image and start the container, making it available at the subdomain you configured in `docker-compose.yml`.

## Running Tests

To run the unit tests, use the following command:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0.

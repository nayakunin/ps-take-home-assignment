# Picsart Take Home Assignment

## Getting Started

### Prerequisites

- Node.js (>= 22)
- pnpm (>= 9)

### Installation

```sh
pnpm install
```

### Running the Project

To start the development server:

```sh
pnpm dev
```

This will start the development server and you can view the application at `http://localhost:5173`.

### Building the Project

To build the project for production:

```sh
pnpm build
```

The build artifacts will be stored in the `build/` directory.

### Starting the Production Server

To start the production server:

```sh
pnpm start
```

This will serve the built application.

## Design Decisions

### Performance Optimization

- **Virtualization**: The list of images is virtualized using `@tanstack/react-virtual` to render only the visible images.
- **Image Loading**: The images have srcset and sizes attributes to load the appropriate image based on the screen size. This also loads the image progressively.
- **Image Lazy Loading**: The images are lazy-loaded using the `loading="lazy"` attribute.
- **Image Loading Placeholder**: The images have a placeholder to show the average background color while the actual image is loading.

- **Code Splitting**: The application is split into multiple chunks based on routes.
- **Web Vital Optimization**: The application is optimized for web vitals like LCP, FID, and CLS.

### Responsiveness

The application is responsive, though it doesn't handle resizing the window. It is responsive as long as the screen stays the same after load.

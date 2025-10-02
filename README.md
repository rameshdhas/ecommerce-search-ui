# React Static Website with AWS CDK

This project creates a static React website hosted on AWS S3 and served through CloudFront using AWS CDK.

## Architecture

- **Frontend**: React app with Tailwind CSS (JavaScript)
- **Hosting**: AWS S3 bucket for static files
- **CDN**: AWS CloudFront for global distribution
- **Infrastructure**: AWS CDK for Infrastructure as Code

## Prerequisites

- Node.js and npm installed
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)

## Project Structure

```
├── lib/
│   └── ecommerce-search-ui-stack.ts  # CDK stack definition
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Main React component
│   │   ├── index.js                  # React entry point
│   │   └── index.css                 # Tailwind CSS imports
│   ├── public/
│   │   └── index.html                # HTML template
│   ├── package.json                  # React dependencies
│   ├── tailwind.config.js            # Tailwind configuration
│   └── postcss.config.js             # PostCSS configuration
├── bin/
└── package.json                      # CDK project dependencies
```

## Setup Instructions

### 1. Install Dependencies

First, install the CDK project dependencies:
```bash
npm install
```

Then, install the React app dependencies:
```bash
cd frontend
npm install
cd ..
```

### 2. Bootstrap CDK (First time only)

If you haven't used CDK in your AWS account/region before:
```bash
npx cdk bootstrap
```

### 3. Build and Deploy

Build the React app and deploy the infrastructure:
```bash
npm run deploy
```

This command will:
1. Build the React app with Tailwind CSS
2. Synthesize the CDK stack
3. Deploy the S3 bucket and CloudFront distribution
4. Upload the built React app to S3

## Available Scripts

- `npm run build-react` - Build the React app only
- `npm run deploy` - Build React app and deploy infrastructure
- `npm run synth` - Synthesize CDK stack to CloudFormation
- `npm run diff` - Compare deployed stack with current state
- `npm run destroy` - Destroy the deployed infrastructure

## Development

To work on the React app locally:

```bash
cd frontend
npm start
```

This will start the development server at `http://localhost:3000`.

## Outputs

After deployment, you'll see:
- **DistributionUrl**: The CloudFront URL where your site is available
- **BucketName**: The S3 bucket name where files are stored

## Features

- ✅ React app with JavaScript (not TypeScript)
- ✅ Tailwind CSS for styling
- ✅ S3 static website hosting
- ✅ CloudFront CDN with compression
- ✅ HTTPS redirect
- ✅ SPA routing support (404/403 redirects to index.html)
- ✅ Automatic deployment on CDK deploy

## Cleanup

To remove all AWS resources:
```bash
npm run destroy
```

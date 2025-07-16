This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
  "scripts": {
    "dev": "next dev -p 3003",
    "build": "next build",
    "start": "next start -p 3003",
    "lint": "next lint"
  },
# or
"scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "cross-env NODE_ENV=production node server.js",
    "lint": "next lint"
  },
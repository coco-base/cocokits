
# Project Structure

```
my-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── components/
│   ├── utils/
│   ├── hooks/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
├── public/
│   ├── images/
│   ├── favicon.ico
├── src/
│   ├── app/
│   ├── components/
│   ├── utils/
│   ├── hooks/
├── next.config.js
├── package.json
├── .env
```

This structure follows Next.js conventions:
- **app/**: Routes for Next.js v13+ (App Router).
- **pages/**: Routes for older versions (Pages Router).
- **public/**: Static assets.
- **src/**: Optional folder for application source code.
- **package.json**: Project dependencies and scripts.
- **.env**: Environment variables.
# React + Vite

<!-- This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
 -->

1.Make sure you have node.js in your computer,you can go to this website https://nodejs.org/en to download
2.Go to the vscode terminal,follow these steps:

    cd frontend

    npm install

    npm install react-leaflet leaflet

    npm install @mui/x-date-pickers @mui/material @emotion/react @emotion/styled dayjs

    npm install @mui/x-date-pickers-pro @mui/material @emotion/react @emotion/styled dayjs

    npm install rsuite --save

    npm install react-date-range

    npm install react-bootstrap
    
    npm install html2canvas jspdf

    npm install react-modal
    npm install antd

    npm run dev


You will get http://localhost:5173/, go to google get into that website


Backend:

    cd backend
    
    conda install django
    pip install -r requirements.txt
    
    python manage.py runserver


Gmail SMTP Configuration Tutorial:
1. Gmail Account Setup
* Ensure you have a Gmail account
* Enable Two-Factor Authentication:
* Sign in to your Google Account
* Go to "Security" settings
* Enable "2-Step Verification"
2. Get App Password
* Visit Google Account Settings
* Click "Security"
* Find "App passwords" under "Signing in to Google"
* Click "Generate new app password"
* Enter app name (e.g., Django App)
* Copy the generated 16-character password (the one in your config: fzte xgnl lccs zipy)
3. Django Settings
* Add these configurations to backend/config/settings.py:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = "smtp.gmail.com"
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = "your.email@gmail.com"
    EMAIL_HOST_PASSWORD = "your-app-password"
    DEFAULT_FROM_EMAIL = "your.email@gmail.com"


3.Test account and password for PayPal sandbox:
    
    Email:ProgSD_Team8@personal.example.com

    Password:12345678

4.Test account and password for Operator:

    Email:operator01@gmail.com

    Password:Operator123

5.Test account and password for Manager:

    Email:manager01@gmail.com

    Password:Manager123

6.Test account and password for User:

    Email:3620864080@qq.com

    Password:159753Aa
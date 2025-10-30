#  Billing Management System – Frontend (Next.js)

A modern **Next.js** frontend for the **Billing Management System**, providing an intuitive interface for **Billers** and **Customers** to manage bills, payments, and notifications.

This frontend communicates with the Django backend through REST APIs.

---

##  Features

✅ Built with **Next.js** and **React**  
✅ Communicates with the Django backend API  
✅ Environment-based backend configuration using `.env`  
✅ Developer-friendly setup with hot reloading (`npm run dev`)  
✅ Fully responsive and modern UI  

---

## Prerequisites

Before running the frontend, make sure you have:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)  
- [npm](https://www.npmjs.com/) (comes with Node.js)  
- A running backend (Django + Docker) on your local machine or remote server

Check your versions:
```bash
node -v
npm -v
- Setup Instructions
1️ - Clone the Repository
bash
Copy code
git clone https://github.com/Binyamkefela/billing_management_front.git
cd billing_management_front
2️ - Install Dependencies
bash
Copy code
npm install
3️ - Create a .env File
In the project root directory, create a .env file and add the following:

bash
Copy code
NEXT_PUBLIC_BACKEND_URL=http://localhost:8808/api
⚠️ This variable defines the base URL of your Django backend API.
If your backend is running on another host or port (e.g., production), update this value accordingly.

- Run the Development Server
Start the local development environment with:

bash
Copy code
npm run dev
Then open:
👉 http://localhost:3000

Your app will automatically reload when you modify any file.

- Build for Production
To create an optimized production build:

bash
Copy code
npm run build
To run the built version:

bash
Copy code
npm start
- Environment Summary
Variable	Description	Default
NEXT_PUBLIC_BACKEND_URL	Django backend API base URL	http://localhost:8808/api


- Connecting to Backend
Make sure your Django backend (running via Docker) is accessible at:

bash
Copy code
http://localhost:8808/api
If both the backend and frontend are running locally, everything should work out of the box.

- Author
Binyam Kefela
📧 binyamkefela196@gmail.com
🌐 https://github.com/Binyamkefela

⭐ Thanks! from Binyamkefela ⭐


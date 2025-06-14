AI-Powered Professional Calculator
Developed by Mohamed Ben Naima for the CodeAlpha Internship Program (June 2025)
✨ Live Demo
The application is fully deployed and accessible online.

Live Site: https://codealpha-mohamed-ben-naima-calculator.onrender.com/

Introduction
This project is a professional-grade, feature-rich calculator application developed as a key task during my Frontend Development Internship at CodeAlpha. It was built to demonstrate a deep understanding of modern web development concepts, from building a polished and responsive user interface to implementing a secure, full-stack architecture for advanced features.

This application goes far beyond a simple calculator. It is a testament to the hands-on application of knowledge, focusing on creating a secure, user-friendly, and globally accessible tool.

📸 Application Showcase
A visual tour of the calculator's primary features and design.

Light & Dark Themes

Multilingual Support

AI Word Problem Solver

AI Providing a Solution

Intuitive UI Feedback

🚀 Key Features
This application was engineered with a focus on user experience, security, and modern web standards.

Core Calculator Functions: Flawless arithmetic operations (+, −, ×, ÷), percentage calculation, and clear/delete functions.

Secure AI Word Problem Solver: A standout feature where users can type a math problem in natural language. A secure backend server calls the Google Gemini API to provide the step-by-step expression and the final answer, demonstrating full-stack integration.

API Key Protection: The Gemini API key is kept 100% secure on a Node.js backend server. The client never sees the key, following industry best practices to prevent exposure and misuse.

Full Multilingual Support: The entire UI, including error messages and AI prompts, is fully translated into English, Français, and Español. The user's language preference is saved in local storage for a persistent experience.

Dual Themes (Light & Dark): A sleek theme switcher allows users to toggle between a clean light mode and an eye-friendly dark mode. The user's choice is saved for their next visit.

Calculation History: All calculations are saved to a sliding history panel and persisted in local storage. Users can review their previous calculations and click on any result to load it back into the calculator for further use.

Polished Neumorphic UI/UX: The application features a stunning Neumorphic design with smooth animations, tactile button feedback, and a fully responsive layout that looks and works perfectly on desktop, tablet, and mobile devices.

Full Keyboard Support: All calculator functions are mapped to keyboard inputs for power users and accessibility.

Advanced Accessibility (A11y): Key controls are equipped with aria-label attributes for screen readers, and focus is managed intelligently for modals and pop-ups to ensure a seamless experience for all users.

🛠️ Tech Stack & Architecture
This project uses a modern client-server architecture to ensure security and performance.

Frontend
HTML5

CSS3 (with Custom Properties for dynamic theming)

JavaScript (ES6+)

Backend
Node.js

Express.js (as a lightweight and fast web server)

node-fetch (to make server-to-server requests to the Google API)

dotenv (to manage environment variables and keep the API key secret)

API
Google Gemini API

Secure Architecture
The client-side application (built with HTML/CSS/JS) does not call the Google API directly. Instead, it sends a request to a dedicated /api/solve endpoint on its own Node.js server. The server then securely retrieves the secret GEMINI_API_KEY from a .env file and proxies the request to the Google API. This architecture is the industry standard for protecting sensitive credentials.

⚙️ How to Run Locally
To run this project on your local machine, please follow these steps:

Clone the repository:

git clone https://github.com/Meeeeedd/CodeAlpha_Calculator.git
cd CodeAlpha_Calculator

Create a .env file in the root of the project folder. This file will hold your secret API key. Add the following line to it:

GEMINI_API_KEY=your_google_gemini_api_key_goes_here

You can get a free key from Google AI Studio.

Install the dependencies for the backend server.

npm install

Start the server.

npm start

Open the application in your browser at http://localhost:3000.
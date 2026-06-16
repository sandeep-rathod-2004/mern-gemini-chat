# 💬 MERN Gemini Chat

An AI-powered full-stack chat application built using the MERN stack and Google Gemini API. The application enables users to have real-time conversations with an AI assistant through an interactive and responsive interface.

🌐 **Live Demo:** https://mern-gemini-chat.vercel.app

📦 **Repository:** https://github.com/sandeep-rathod-2004/mern-gemini-chat

---

## 🚀 Features

* 💬 Real-time AI chat experience
* 🤖 Google Gemini API integration
* 📝 Context-aware responses
* 🌐 Responsive user interface
* ⚡ Fast backend API communication
* 🔒 Secure environment variable management
* ☁️ Cloud deployment using Vercel and Render

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### AI Integration

* Google Gemini API
* Prompt Engineering

### Deployment

* Vercel (Frontend)
* Render (Backend)

### Tools

* Git
* GitHub

---

## 📂 Project Structure

```text id="ehyqxe"
mern-gemini-chat/
│
├── client/
│   └── React application
│
├── server/
│   └── Express backend
│
├── .gitignore
├── vercel.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash id="z18wpn"
git clone https://github.com/sandeep-rathod-2004/mern-gemini-chat.git

cd mern-gemini-chat
```

---

## 2. Setup Backend

```bash id="xgt4lb"
cd server

npm install
```

Create a `.env` file.

```env id="gwy4tq"
GEMINI_API_KEY=your_api_key

MONGODB_URI=your_mongodb_connection_string

PORT=5000
```

Start the backend server:

```bash id="saj2m3"
npm start
```

or

```bash id="0qv0f6"
npm run dev
```

---

## 3. Setup Frontend

Open a new terminal.

```bash id="g7mrcu"
cd client

npm install

npm start
```

or

```bash id="yyj1z9"
npm run dev
```

---

## 🎯 How It Works

1. User enters a prompt in the chat interface.
2. React sends the request to the Express backend.
3. Backend communicates with Google Gemini API.
4. Gemini generates an AI response.
5. The response is displayed in real time.

---

## 🧠 Skills Demonstrated

* Full Stack Development
* MERN Stack Architecture
* REST API Development
* AI Integration
* Prompt Engineering
* Frontend-Backend Communication
* Environment Variable Management
* Cloud Deployment

---

## 📌 Future Improvements

* User authentication (JWT)
* Chat history storage
* Multi-session conversations
* File upload support
* Voice input/output
* Dark mode
* Streaming AI responses

---

## 👨‍💻 Author

**Sandeep Rathod**

GitHub: https://github.com/sandeep-rathod-2004

Repository:

https://github.com/sandeep-rathod-2004/mern-gemini-chat

Live Demo:

https://mern-gemini-chat.vercel.app

# 💬 Real-Time Chat Application

A full-stack real-time chat system that allows **users and admins** to communicate instantly using WebSockets.  
Built with **.NET 8**, **SignalR**, **Next.js**, and **MySQL**.

---

## ✨ Features

- 🔐 User Registration (supports multiple users)
- 🔑 Secure Login & Logout using JWT Authentication
- 🛡 Role-Based Authorization Filter
- 💬 Real-Time chat between Users and Admin
- 🟢 Real-Time Online/ Offline status for recipients
- 📋 Chatted user list for Admin Dashboard
- 🔍 Search chatted users by username
- ✏ Message input character limit
- 🕘 Message History with auto-scroll to latest messages
- 📜 Load older messages using scroll pagination
- 📱 Fully Responsive (Mobile + Desktop)

---

## 🧱 Technologies Used

### 🔹 Backend
- .NET 8 Web API  
- SignalR (Real-time communication)  
- Entity Framework Core  
- MySQL Server  
- JWT Authentication  
- Custom Middleware & Authorization Filters  
- Text Logging  

### 🔹 Frontend
- Next.js  
- React  
- Tailwind CSS  
- Axios  

---

## 📋 Requirements

Make sure the following are installed:

- .NET 8 SDK or Runtime  
- Node.js (v18+) and npm or yarn  
- MySQL Server 8+

---

## ⚙️ Installation Guide

### 1️⃣ Clone the repository and enter the app from command

```bash
git clone https://github.com/htetpyie/real-time-chat-app
cd real-time-chat-app
```

---

### 2️⃣ Database Setup

- Open MySQL Server  
- Run the SQL script:

👉 [`chat_app.sql`](https://github.com/htetpyie/real-time-chat-app/blob/63087ee50089988a9629d4096af0b6194f5e5e01/chat_app.sql)

---

### 3️⃣ Backend Setup

```bash
cd ChatApp/ChatApp.Server
dotnet restore
dotnet run
```

Then update **`appsettings.json`** with your database connection:

```json
"ConnectionStrings": {
  "DefaultConnection": "server=localhost;database=chat_app;user=root;password=root;"
}
```

---

### 4️⃣ Frontend Setup

```bash
cd ChatApp/chatapp.frontend
npm install
npm run dev
```

---

## 🚀 Application Ports

| Service  | URL |
|----------|-----|
| Backend  | http://localhost:5001 |
| Frontend | http://localhost:3000 |

---

## 👤 Default Admin Account

| Username | Password |
|----------|----------|
| admin    | admin    |

---

## 🧪 How to Test the Application

1. Open browser → **http://localhost:3000**
2. Login as **Admin**
3. Open another browser or incognito window
4. Register a new user or multiple users
5. Login as the new user
6. Start chatting with the Admin in real time

---

## 🔐 Authentication

All protected API endpoints require JWT:

```
Authorization: Bearer your_token_here
```
---

## 🙏 Thank You

Thank you for checking out this project!  
I truly appreciate your time, feedback, and interest in this application.


---

## 👨‍💻 Author

**Htet Pyie Phyoe Maung**  
Full Stack Developer (.NET + React)

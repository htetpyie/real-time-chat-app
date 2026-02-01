# Real Time Chat App

## Features
* User Registration
* Login/Logout (Authentication with JWT)
* Real-time Chatting between Users and Admin
* Chatted User List for Admin
* Message History and auto reload to latest messages
* Responsive Design for Mobile and Desktop

## Used Technologies
* Backend: .Net 8, SignalR, Entity Framework Core, MySQL Server
* Frontend: Next.js, React, Tailwind CSS, Axios

## Requirements
* .Net 8 Runtime or SDK
* Node.js 18 or above
* npm or yarn
* MySQL Server 8 or above

 
## Installation Guide
1. ### Clone the repository 
 ```
  git clone https://github.com/htetpyie/real-time-chat-app
```
2. ### Database Setup
   - Download and run the script file in MySQL [chat_app.sql]()
3. ### Backend Setup
   - Navigate to the `ChatApp/ChatApp.Server` directory
   - Install dependencies: `dotnet restore`
   - Configure the database connection string in `appsettings.json`
   - Run the backend server: `dotnet run`
4. ### Frontend Setup
   - Navigate to the `ChatApp/ChatApp.Client` directory
   - Install dependencies: `npm install` or `yarn install`
   - Run the frontend server: `npm run dev` or `yarn dev`

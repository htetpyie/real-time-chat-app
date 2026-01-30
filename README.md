# ChatApp

dotnet ef dbcontext scaffold "Server=localhost;port=3306;Database=chat_app;User=root;Password=root;" Pomelo.EntityFrameworkCore.MySql -o AppDbContextModels --context AppDbContext -f

used material ui

cd chatapp.client
npm install
npm run dev
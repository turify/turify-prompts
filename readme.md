# Turify Prompts

**AI Prompt Engineering Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.8.2-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 What is Turify Prompts?

Turify Prompts is an open-source AI prompt engineering platform designed to help developers, content creators, and AI enthusiasts craft better prompts for AI tools like ChatGPT, Claude, Midjourney, and others. Get consistent, high-quality results from your AI interactions through intelligent prompt optimization.

### ✨ Key Features

- **🚀 Intelligent Prompt Builder** - Transform simple ideas into structured, effective prompts
- **📊 Advanced Evaluation System** - Score prompts based on clarity, specificity, and effectiveness
- **🌟 Community Library** - Browse, share, and discover high-quality prompts
- **📈 Performance Analytics** - Track and optimize prompt performance over time
- **🤝 Team Collaboration** - Share and collaborate on prompts with your team
- **🔗 API Integration** - Seamlessly integrate with your existing AI workflows

---

## 📸 Screenshots

### Main Dashboard
![Turify Prompts Main Dashboard](./public/Turify_main.png)
*The central hub for creating and managing your AI prompts with an intuitive, modern interface.*

### Prompt Creation & Management
![Turify Prompts Interface](./public/Turify_prompts.png)
*Powerful prompt builder with real-time suggestions and structured formatting for optimal AI interactions.*

### Evaluation & Analytics
![Turify Prompts Evaluation](./public/Turify_prompt_evaluation.png)
*Comprehensive prompt evaluation system with detailed scoring and actionable improvement suggestions.*

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v18 or higher)
- **[pnpm](https://pnpm.io/)** package manager
- **[Docker](https://docker.com/)** and Docker Compose
- **[Git](https://git-scm.com/)** for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/turify-prompts.git
   cd turify-prompts
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the PostgreSQL database:**
   ```bash
   pnpm run db:up
   ```

4. **Configure environment variables:**
   
   Create a `.env` file in the project root:
   ```bash
   # Database Configuration
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/turify"

   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-nextauth-secret-change-this-in-production"

   # AI Integration (Optional)
   OPENAI_API_KEY="your-openai-api-key"
   
   # LangChain/LangSmith Tracing (Optional)
   LANGCHAIN_API_KEY="your-langsmith-api-key"
       LANGCHAIN_PROJECT="turify-prompts-development"
   ```

5. **Initialize the database:**
   ```bash
   pnpm run db:push
   ```

6. **Start the development server:**
   ```bash
   pnpm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless backend functions
- **Prisma ORM** - Type-safe database toolkit
- **PostgreSQL** - Robust relational database
- **NextAuth.js** - Authentication solution

### AI & Analytics
- **LangChain** - AI application framework
- **OpenAI API** - GPT integration
- **Vercel Analytics** - Performance monitoring

### DevOps
- **Docker Compose** - Containerized development
- **ESLint & Prettier** - Code quality tools
- **Prisma Studio** - Database management GUI

---

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build production application |
| `pnpm run start` | Start production server |
| `pnpm run lint` | Run ESLint code analysis |
| `pnpm run db:up` | Start PostgreSQL container |
| `pnpm run db:down` | Stop PostgreSQL container |
| `pnpm run db:reset` | Reset database and restart container |
| `pnpm run db:push` | Push schema changes to database |
| `pnpm run db:migrate` | Run database migrations |
| `pnpm run db:studio` | Open Prisma Studio |

---

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgresql://postgres:postgres@localhost:5432/turify` |
| `NEXTAUTH_URL` | Application URL | ✅ | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | ✅ | - |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ❌ | - |
| `LANGCHAIN_API_KEY` | LangSmith API key for tracing | ❌ | - |
| `LANGCHAIN_PROJECT` | LangSmith project name | ❌ | `turify-prompts-default` |

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Guidelines

- Follow TypeScript best practices
- Use TailwindCSS for styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📖 Documentation

- **[API Documentation](./docs/api.md)** - Complete API reference
- **[Deployment Guide](./docs/deployment.md)** - Production deployment instructions
- **[Contributing Guide](./docs/contributing.md)** - Detailed contribution guidelines
- **[Database Schema](./docs/database.md)** - Database structure and relationships

---

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up a production PostgreSQL database (Supabase, Neon, etc.)
4. Deploy automatically on push to main branch

### Docker

```bash
# Build the application
docker build -t turify-prompts .

# Run with docker-compose
docker-compose up -d
```

---

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Clear Docker containers and volumes
docker rm -f $(docker ps -aq) && docker rmi -f $(docker images -q) && docker volume rm $(docker volume ls -q)

# Check if port 5432 is in use
sudo lsof -i:5432
kill [process_id]
```

**Installation Problems:**
```bash
# Clear package manager cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Support

- **⭐ Star this repository** if you find it helpful
- **🐛 Report bugs** via [GitHub Issues](https://github.com/your-username/turify-prompts/issues)
- **💡 Request features** via [GitHub Discussions](https://github.com/your-username/turify-prompts/discussions)
- **📧 Contact us** at support@turify.dev

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment
- [Prisma](https://prisma.io/) for the excellent ORM
- [TailwindCSS](https://tailwindcss.com/) for the utility-first approach
- All contributors and community members

---

<p align="center">
  <strong>Built with ❤️ by the Turify Prompts team</strong>
</p>

<p align="center">
  <a href="https://turify.dev">🌐 Website</a> •
  <a href="https://twitter.com/turifydev">🐦 Twitter</a> •
  <a href="https://github.com/your-username/turify-prompts">⭐ GitHub</a>
</p>
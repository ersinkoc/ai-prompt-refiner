<div align="center">
  <h1>🚀 AI Prompt Refiner</h1>
  <p>
    <em>Transform simple ideas into powerful, production-ready prompts through intelligent conversation</em>
  </p>

  <p>
    <a href="#-features">✨ Features</a> •
    <a href="#-getting-started">🚀 Getting Started</a> •
    <a href="#-how-it-works">🤖 How It Works</a> •
    <a href="#-example-prompts">💡 Example Prompts</a> •
    <a href="#🐳-docker-deployment">🐳 Docker</a>
  </p>

  <p>
    <a href="https://github.com/ersinkoc/ai-prompt-refiner/blob/main/LICENSE">
      <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
    </a>
    <a href="https://github.com/ersinkoc/ai-prompt-refiner">
      <img alt="GitHub repository" src="https://img.shields.io/badge/GitHub-Repository-blue.svg" />
    </a>
    <a href="https://github.com/ersinkoc/ai-prompt-refiner/stargazers">
      <img alt="GitHub stars" src="https://img.shields.io/github/stars/ersinkoc/ai-prompt-refiner?style=social" />
    </a>
    <a href="https://github.com/ersinkoc/ai-prompt-refiner/network/members">
      <img alt="GitHub forks" src="https://img.shields.io/github/forks/ersinkoc/ai-prompt-refiner?style=social" />
    </a>
  </p>
</div>

---

<img src="screenshot.png" alt="AI Prompt Refiner - Screenshot" />

## 🎯 About

**AI Prompt Refiner** is a sophisticated web application that bridges the gap between basic ideas and high-quality, well-structured AI prompts. Using Google's advanced Gemini AI models, it engages users in a conversational process, asking targeted questions to understand context, requirements, and constraints before generating comprehensive, task-specific prompts.

Unlike traditional prompt engineering tools that require technical expertise, AI Prompt Refiner makes prompt optimization accessible to everyone—from developers and marketers to educators and content creators. The AI acts as your personal prompt engineering consultant, ensuring that every generated prompt is perfectly tailored to your specific needs.

---

## ✨ Features

### 🤖 **Intelligent Conversational Refinement**
- **Dynamic Questioning**: The AI asks up to 3 targeted questions per iteration to gather context
- **Smart Suggestions**: Pre-defined answer options for quick responses, with custom input capability
- **Context-Aware**: Maintains conversation history to build upon previous answers
- **Multi-Turn Dialog**: Continues refining until sufficient information is gathered

### 🔧 **Technology Stack Specialization**
- **80+ Technologies**: Support for popular frameworks, languages, databases, and tools
- **Categorized Selection**: Organized by Frontend, Backend, Cloud, DevOps, Testing, and more
- **Context Integration**: Automatically incorporates selected technologies into prompt generation
- **Industry-Standard**: Covers modern development ecosystems and best practices

### 💾 **Local Data Persistence**
- **Browser-Based Storage**: All prompt history saved locally for privacy and convenience
- **Session Recovery**: Access previously generated prompts anytime
- **Search & Filter**: Easy navigation through prompt history
- **No Server Dependencies**: Your data stays on your device

### 🎨 **Customizable Output Formats**
- **Multiple Formats**: Generate prompts in Markdown, JSON, or Plain Text
- **Template-Based**: Choose from professional prompt templates
- **Export Ready**: Format outputs suitable for different platforms and use cases

### 🌟 **Professional Templates & Examples**
- **6+ Prompt Templates**: Pre-built templates for common tasks like testing, documentation, and code review
- **Real-World Examples**: 5+ detailed examples showcasing practical applications
- **Interactive Library**: Browse and explore different prompt categories

### 🎯 **Advanced AI Capabilities**
- **Gemini Models**: Choose between Gemini 2.5 Pro (powerful) or Flash (fast)
- **Structured Output**: JSON-based responses for consistent, parseable results
- **Error Handling**: Comprehensive error detection and user-friendly messages
- **Debug Mode**: Technical insights for advanced users and troubleshooting

### 🎨 **User Experience Excellence**
- **Responsive Design**: Works flawlessly on desktop, tablet, and mobile devices
- **Dark/Light Themes**: Comfortable viewing in any lighting condition
- **Interactive Tour**: Guided onboarding for new users
- **Smooth Animations**: Professional micro-interactions and transitions
- **Smart Scrolling**: Optimized layout for long conversations and multiple prompts

### 🔒 **Privacy & Security**
- **Local Processing**: Prompts processed locally where possible
- **API Key Security**: Secure storage of API keys
- **No Data Collection**: Your prompts never leave your browser
- **Transparent Architecture**: Open source for full transparency

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm` or a compatible package manager
- A [Google Gemini API Key](https://ai.google.dev/gemini-api/docs/api-key)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ersinkoc/ai-prompt-refiner.git
   cd ai-prompt-refiner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API Key:**
   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY="YOUR_API_KEY_HERE"
   ```
   *Your API key remains private as `.env.local` is gitignored.*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🐳 Docker Deployment

For a production-ready, containerized deployment:

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Single Command Deployment

```bash
docker-compose up -d
```

The application will be available at [http://localhost:8080](http://localhost:8080).

### Architecture
- **Multi-stage Build**: Optimized for size and security
- **Nginx Production Server**: High-performance static file serving
- **Alpine Linux**: Minimal, secure runtime environment

### Stop the Container
```bash
docker-compose down
```

---

## 🤖 How It Works

### 1. **Initial Input**
Users start with a simple idea or concept in natural language.

### 2. **AI-Powered Refinement**
The Gemini AI analyzes the input and asks targeted questions to understand:
- **Context**: What is the specific use case?
- **Requirements**: What constraints or specifications exist?
- **Target Audience**: Who will use the final prompt?
- **Technical Stack**: What technologies or frameworks are involved?

### 3. **Interactive Dialog**
Users can:
- Select from AI-suggested answers for quick responses
- Type custom answers for specific requirements
- Review and modify any previous answers
- See the conversation progress in real-time

### 4. **Prompt Generation**
Once sufficient context is gathered, the AI generates:
- **2 Distinct Prompts**: Different approaches or perspectives
- **Professional Formatting**: Structured for readability and use
- **Context Integration**: Incorporates all conversation details
- **Best Practices**: Follows established prompt engineering principles

### 5. **History & Reuse**
All completed prompts are saved locally for:
- **Future Reference**: Access previous prompts anytime
- **Template Creation**: Reuse successful patterns
- **Learning**: Study prompt evolution and improvements

---

## 💡 Example Prompts

### 📝 **Documentation Generation**

**Input:** `"Generate API docs"`

**AI Questions:**
1. What programming language or framework is the API built with?
2. What type of documentation format do you prefer (Markdown, OpenAPI, JSDoc)?
3. Should the documentation include code examples and usage scenarios?

**Generated Output:**
```markdown
# RESTful API Documentation Generator

Generate comprehensive API documentation for [LANGUAGE/Framework] APIs. The documentation should include:
- Endpoint descriptions with HTTP methods and parameters
- Request/response schema specifications
- Authentication and authorization details
- Code examples in multiple programming languages
- Error handling and status code explanations

Focus on clarity and developer experience.
```

### 🧪 **Testing Strategy**

**Input:** `"Write unit tests for my code"`

**AI Questions:**
1. What testing framework are you using (Jest, Vitest, PyTest, etc.)?
2. What type of functionality needs to be tested (business logic, API endpoints, UI components)?
3. Do you need to mock external dependencies?

**Generated Output:**
```markdown
# Comprehensive Unit Testing Strategy for [FRAMEWORK]

## Test Coverage Requirements
- Unit tests for all business logic functions
- Edge cases and error handling scenarios
- Integration tests for external API calls
- Mock implementations for dependencies

## Test Structure
- Arrange-Act-Assert pattern
- Descriptive test names
- Setup and teardown procedures
- Test data factories and fixtures

## Best Practices
- AAA (Arrange-Act-Assert) pattern
- Single assertion per test
- Meaningful test data
- Proper mocking strategies
```

### 🔧 **Code Refactoring**

**Input:** `"Refactor this messy code"`

**AI Questions:**
1. What programming language is the code written in?
2. What are the main issues you're experiencing (performance, readability, maintainability)?
3. Are there any specific design patterns or principles you'd like to apply?

**Generated Output:**
```markdown
# Code Refactoring Plan for [LANGUAGE]

## Analysis Checklist
- Identify code smells and anti-patterns
- Assess SOLID principles violations
- Review complexity and coupling issues
- Check for performance bottlenecks

## Refactoring Strategies
- Extract methods and functions
- Apply design patterns appropriately
- Improve naming conventions
- Reduce code duplication
- Enhance error handling

## Validation Criteria
- Maintain existing functionality
- Improve code metrics
- Enhance test coverage
- Document changes made
```

### 🚀 **CI/CD Pipeline**

**Input:** `"Set up CI/CD pipeline"`

**AI Questions:**
1. What CI/CD platform are you using (GitHub Actions, GitLab CI, Jenkins)?
2. What deployment target do you need (Docker, Cloud, Static hosting)?
3. What testing and quality gates should be included?

**Generated Output:**
```markdown
# Complete CI/CD Pipeline Configuration

## Pipeline Stages
1. **Code Quality Checks**
   - Linting and formatting verification
   - Static code analysis
   - Security vulnerability scanning

2. **Testing Phase**
   - Unit test execution
   - Integration testing
   - Code coverage reporting

3. **Build & Package**
   - Application build process
   - Artifact creation
   - Version tagging

4. **Deployment**
   - Environment-specific deployments
   - Health checks
   - Rollback procedures

## Configuration Files
- [PLATFORM]-ci.yml
- Dockerfile
- deployment scripts
```

---

## 🛠️ Advanced Features

### Debug Mode
Enable detailed logging to understand AI behavior:
- Request/response analysis
- Error diagnostics
- Performance metrics

### Custom System Instructions
Tailor the AI's behavior for specific use cases:
- Industry-specific terminology
- Custom prompt templates
- Specialized output formats

### Technology Stacks
Select from 80+ technologies across categories:
- **Frontend**: React, Vue, Angular, Svelte, Next.js
- **Backend**: Node.js, Django, Flask, Spring Boot
- **Databases**: PostgreSQL, MongoDB, Redis
- **Cloud**: AWS, GCP, Azure, Docker, Kubernetes
- **Testing**: Jest, Cypress, Playwright
- **DevOps**: GitHub Actions, Terraform, Jenkins

---

## 🤝 Contributing

We welcome contributions, issues, and feature requests! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/ersinkoc/ai-prompt-refiner/blob/main/LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini API** for providing the powerful AI capabilities
- **React Team** for the excellent UI framework
- **Vite** for the fast development experience
- **Tailwind CSS** for the utility-first CSS framework
- The open-source community for the amazing tools and libraries that make this project possible

---

## 📞 Support

If you encounter any issues or have questions:

- 📋 [Create an Issue](https://github.com/ersinkoc/ai-prompt-refiner/issues)
- 💬 [Discussions](https://github.com/ersinkoc/ai-prompt-refiner/discussions)
- 📧 [Report Bug](https://github.com/ersinkoc/ai-prompt-refiner/issues/new?template=bug_report.md)

---

<div align="center">
  <p><em>Built with ❤️ by the developer community</em></p>
  <p><strong>Transform your ideas into powerful AI prompts today!</strong></p>
</div>
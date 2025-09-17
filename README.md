# SMW Web Admin Panel

A modern Next.js admin panel for SMW with Redux state management, shadcn/ui components, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn package manager

### Installation & Setup
```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

## 🔧 Pre-commit Hooks

This project uses **husky** and **lint-staged** for automated code quality checks:

- **Linting**: Automatically fixes ESLint issues on staged files
- **Build Check**: Ensures the project builds successfully
- **Auto-fix**: Fixes formatting and simple issues automatically

**What happens during commit:**
1. Lints only the files you're committing
2. Automatically fixes fixable issues
3. Runs full project build to ensure everything works
4. Blocks commit if any checks fail

## 📚 Developer Guide

For detailed development guidelines, coding standards, and best practices, see our [Developer Guide](./DEVELOPER_GUIDE.md).

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Redux Toolkit
- **Theme**: Dark/Light mode support
- **Code Quality**: ESLint + Pre-commit hooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── redux/                  # Redux store and slices
└── lib/                    # Utility functions
```

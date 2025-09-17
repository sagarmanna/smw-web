# SMW Web Developer Guide

This guide outlines the coding standards, best practices, and project structure for the SMW Web admin panel.

## 📁 Project Structure

### Pages
- **Folder**: `src/app/<page-name>/`
- **Main file**: `page.tsx`
- **Optional subfolder**: `components/`
- **Naming**: **kebab-case** (`user-details`, `dashboard-home`)
- **Responsibilities**:
  - Compose reusable components
  - Use hooks for data fetching/state
  - Minimal business logic

**Example:**
```
src/app/user-details/
├── page.tsx
└── components/
    ├── UserProfile/
    │   └── index.tsx
    └── UserSettings/
        └── index.tsx
```

### Components
- **Folder**: `src/components/<ComponentName>/`
- **Main file**: `index.tsx`
- **Optional files**:
  - `styles.ts` → Tailwind classes or shadcn/ui extensions
  - `types.ts` → TypeScript interfaces
  - `ComponentName.test.tsx` → Unit/component test
- **Naming**: **PascalCase** (`Button`, `DataTable`, `UserCard`)
- **Guidelines**:
  - Pure presentational
  - Props-driven
  - No API calls (unless special container component)
  - Use `React.memo` if performance critical

### Hooks
- **Folder**: `src/hooks/`
- **File**: `use<Feature>.ts` (`useUserDetails.ts`, `useDashboardData.ts`)
- **Responsibilities**:
  - Encapsulate API calls or page-specific logic
  - Return `{ data, isLoading, isError, error }` for API hooks
  - Avoid global state unless shared widely
- **Patterns**:
  - Use Redux for global state management
  - Keep hooks single-purpose

### Utilities
- **Folder**: `src/utils/`
- **Naming**: **camelCase** (`formatDate.ts`, `validateEmail.ts`)
- **Pure functions, no side-effects**
- **Shared across components/pages**

### State Management (Redux)
- **Folder**: `src/redux/`
- **Slice**: `<feature>Slice.ts` (`userSlice.ts`, `themeSlice.ts`)
- **Store**: `store.ts`
- **Naming**:
  - Slice files: PascalCase
  - State fields: camelCase
- **Guidelines**:
  - Use Redux for global state only
  - Prefer React Query for API/server state

## 🎨 Styling & Theming

### Tailwind CSS + shadcn/ui
- **Dark mode**: `dark` classes + `next-themes`
- **Responsive**: mobile-first, use breakpoints `sm`, `md`, `lg`, `xl`
- **Layout**: Flex & Grid utilities
- **Avoid hardcoding colors/sizes, use Tailwind themes**
- **Maintain consistent spacing** (`px-4`, `py-2`, `gap-4`)

### Custom Primary Color
- **Primary Color**: `#f5503b` (defined in CSS variables)
- **Usage**: Use `bg-primary`, `text-primary`, etc.

## 📝 Forms

- **Use `react-hook-form` + `zod` for validation**
- **Modular components**: Input, Select, Checkbox
- **Handle loading, error, and success states**
- **Pass values via props, keep forms isolated**

## 🧪 Testing

- **Unit & Component**: Jest + React Testing Library
- **API mocking**: MSW
- **Hooks**: `useFeature.test.ts`
- **E2E**: Playwright in `tests/` folder (`*.spec.ts`)
- **Use `data-testid` for dynamic elements**

## 📱 Responsive Design

- **Mobile-first approach**
- **Flexible layouts**: `w-full`, `max-w-screen-md`, `grid-cols-1 md:grid-cols-3`
- **Touch targets ≥44px**
- **Relative units**: `rem`, `%`, `vw`, `vh`
- **Test across multiple devices, OS, and browsers**

## 🔧 Code Quality

### Pre-commit Hooks
- **Automatic linting** on staged files
- **Build verification** before commits
- **Auto-fix** formatting issues
- **Blocks commits** if checks fail

### ESLint Rules
- **TypeScript strict mode**
- **No `any` types** (use `unknown` instead)
- **Consistent import/export patterns**
- **No unused variables**

## 🚀 General Guidelines

- **Keep functions/components single-responsibility**
- **Prefer props over global state for local data**
- **Centralize API calls in Redux slices**
- **Optimize rendering**: `React.memo`, `useMemo`, `useCallback`
- **Use TypeScript interfaces for props and API data**
- **Document hooks, components, utilities**
- **DRY principle**: avoid duplicate code**
- **Consistent naming and folder structure**

## 📋 Naming Summary

- **Pages**: kebab-case (`user-details`)
- **Components**: PascalCase (`UserCard`)
- **Hooks**: `useFeature` (`useDashboardData`)
- **Utilities**: camelCase (`formatDate`)
- **Redux slices**: PascalCase (`userSlice`)

## 🏗️ Example Folder Skeleton

```
src/
├── app/
│   └── user-details/
│       ├── page.tsx
│       └── components/
│           ├── UserProfile/
│           │   └── index.tsx
│           └── UserSettings/
│               └── index.tsx
├── components/
│   └── Button/
│       ├── index.tsx
│       ├── styles.ts
│       └── Button.test.tsx
├── hooks/
│   └── useUserDetails.ts
├── redux/
│   ├── store.ts
│   └── userSlice.ts
└── utils/
    └── formatDate.ts
```

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

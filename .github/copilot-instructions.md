# BrainDrop Mobile - AI Coding Agent Instructions

## Architecture Overview

**BrainDrop** is a React Native/Expo mobile app for organized note-taking with offline-first design and sync capabilities. The app uses Expo SDK 52, TypeScript, and follows a feature-based architecture with file-based routing.

### Key Architectural Patterns

- **Expo Router**: File-based routing in `app/` directory with layouts and nested routes
- **Feature-based modules**: Each feature in `src/features/` contains `components/`, `hooks/`, `services/`, `context/`, and `types.ts`
- **Offline-first database**: SQLite with Drizzle ORM, includes `dirty` flag for sync tracking
- **Custom UI system**: Comprehensive design system at `@ui` with theme support and Geist fonts
- **React Query**: Server state management with optimistic updates and query invalidation

## Critical Development Workflows

### Database Management

```bash
# Generate migrations after schema changes
npx drizzle-kit generate

# The app auto-migrates on startup via LocalDatabaseProvider in app/_layout.tsx
```

### Development Commands

```bash
yarn start                    # Expo dev server
yarn ios/android             # Run on specific platform
yarn ios:clean/android:clean # Clean build and prebuild
yarn lint-check             # All linting (ESLint, TypeScript, Prettier)
yarn lint-fix              # Auto-fix linting issues
```

## Project-Specific Conventions

### Import Rules (Critical)

- **Always use `@ui` alias** for UI components - never import from `react-native` directly
- **Never import** `Text` or `Button` from `react-native` - use `@ui/Text`, `@ui/Button`
- **Use `@ui/constants/Colors`** for theming - access via `Theme.light` or `Theme.dark`
- **Typography from `@ui/constants/Typography`** - use predefined styles like `typography.h1`

### Database Schema Pattern

```typescript
// All tables include sync fields for offline-first design
dirty: integer("dirty").notNull().$default(() => 1), // 1 = needs sync
deletedAt: integer("deleted_at"), // Soft deletes
```

### Navigation Pattern

```typescript
// Use Expo Router hooks consistently
import { useRouter, useLocalSearchParams } from "expo-router";
const router = useRouter();
router.push("/note/123");
```

### Feature Organization

```
src/features/[feature]/
├── components/     # Feature-specific UI components
├── hooks/         # Custom hooks for the feature
├── services/      # API calls and business logic
├── context/       # React Context for state management
└── types.ts       # TypeScript types
```

## Integration Points

### State Management Layers

1. **Local DB**: SQLite via Drizzle ORM (`src/db/schema.ts`)
2. **Server state**: React Query with custom hooks pattern
3. **Component state**: React hooks + Context for feature-level state
4. **Global providers**: All wrapped in `app/_layout.tsx` (Database, Category, QueryClient)

### Error Handling & Monitoring

- **Sentry integration**: Configured in `app/_layout.tsx` with navigation tracking
- **Toast notifications**: Use `react-native-toast-message` with custom config
- **Database errors**: Auto-captured via `capturePrettyException` in LocalDatabaseProvider

### Authentication & Platform Features

- **Apple Sign-In**: Configured for iOS (`expo-apple-authentication`)
- **Google Sign-In**: Android/iOS support (`@react-native-google-signin`)
- **Deep linking**: Scheme `com.cyrelis.braindrop` configured in `app.json`

## Theme System Usage

```typescript
// ✅ Correct theme usage
import { Theme } from "@ui/constants/Colors";
import { typography } from "@ui/constants/Typography";

<View style={{ backgroundColor: Theme.light.background }}>
  <Text style={typography.h1}>Title</Text>
</View>

// ❌ Never hardcode colors or fonts
<View style={{ backgroundColor: "#fff" }}>
  <Text style={{ fontSize: 24 }}>Title</Text>
</View>
```

## Performance & Build Considerations

- **Geist fonts**: Custom fonts loaded via `useLoadFonts` hook before splash screen hide
- **Platform-specific builds**: Separate iOS/Android configurations in `app.json`
- **Asset optimization**: All assets in `assets/` directory with adaptive icons
- **Bundle splitting**: Native code in `ios/` and Android build configurations

When modifying this codebase, always respect the offline-first design, maintain the `@ui` import pattern, and ensure new features follow the established feature-based organization.

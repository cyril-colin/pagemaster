# PageMaster - GitHub Copilot Instructions

## Project Overview

PageMaster is a real-time collaborative tool for improvised tabletop role-playing games. The dungeon master can update player HP, inventories, statuses, and more in real-time, visible to all connected players.

## Architecture

This is a **monorepo** with three main components:
- **Backend** (`/back`): Node.js/Express API with TypeScript
- **Frontend** (`/front`): Angular 20 application with zoneless change detection
- **Docker**: Containerized deployment with MongoDB

### Why Monorepo?
- Solo development simplicity
- No separate artifact management needed
- Easy synchronization across the codebase
- Future-proof architecture (can split if needed)

## Technology Stack

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript 5.8+
- **Database**: MongoDB 6 (via Docker)
- **Real-time**: Socket.IO 4.8
- **Testing**: Jest 30
- **Validation**: AJV for JSON schema validation
- **Logging**: Winston

### Frontend
- **Framework**: Angular 20 (standalone components)
- **Change Detection**: Zoneless (no NgZone)
- **HTTP**: HttpClient with interceptors
- **Real-time**: Socket.IO client
- **Routing**: Angular Router
- **Markdown**: Marked with DOMPurify sanitization
- **Testing**: Jasmine + Karma

## Code Style & Conventions

### General
- Use **TypeScript strict mode**
- Prefer **functional programming** patterns where appropriate
- Use **async/await** over promise chains
- Follow **single responsibility principle**
- Keep files focused and modular

### Backend Patterns

#### Controllers
- Use decorator-based routing: `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`
- Controllers are plain classes (no decorator on the class itself)
- Inject dependencies via constructor
- Example:
  ```typescript
  export class GameDefController {
    constructor(private mongoClient: GameDefMongoClient) {}
    
    @Get('/gamedefs')
    public async getAllGameDefs(): Promise<GameDef[]> {
      // Implementation
    }
  }
  ```

#### API Routes
- All routes are prefixed with `/api` by default (configured in `apiPrefix`)
- Use `{withoutApiPrefix: true}` option to bypass this
- Route parameters use Express syntax: `/gamedefs/:id`

#### MongoDB
- Extend `BaseMongoClient` for database operations
- Always initialize indexes in `initializeIndexes()` method
- Remove MongoDB `_id` field before returning to clients
- Use shared connection via `serviceContainer.mongoConnection`

#### Dependency Injection
- Use `serviceContainer` (in `dependency-container.ts`) for dependency management
- Avoid creating new instances; inject from container

#### Logging
- Use Winston logger from `serviceContainer.logger`
- Log levels: `info`, `warn`, `error`, `debug`
- Include contextual data in log objects

### Frontend Patterns

#### Components
- Use **standalone components** only (no NgModules)
- Use **signal-based state management**
- Prefer **OnPush** change detection strategy (implicit with zoneless)
- Example:
  ```typescript
  @Component({
    standalone: true,
    selector: 'app-feature',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './feature.component.html',
  })
  export class FeatureComponent {
    // Use signals for state
    readonly myState = signal<MyType>(initialValue);
  }
  ```

#### State Management
- Use **services with signals** for shared state
- Examples: `CurrentGameInstanceState`, `CurrentParticipantState`, `CurrentSessionState`
- Keep state immutable; use `update()` or `set()` on signals

#### HTTP & API
- Use `HttpClient` from `@angular/common/http`
- Interceptors are configured in `app.config.ts`
- API calls should go through repository services (e.g., `GameDefRepository`)

#### Routing
- Define routes in `app.routes.ts`
- Use Angular Router guards for access control
- Lazy load page components when possible

#### Real-time Communication
- Use `GameInstanceSocketService` for Socket.IO connections
- Emit and listen to events in services, not components
- Handle disconnections gracefully

### Testing

#### Backend
- Use Jest for unit and integration tests
- Mock MongoDB clients in tests
- Test files: `*.spec.ts` or `*.test.ts`
- Run: `npm test` or `npm run test:watch`

#### Frontend
- Use Jasmine + Karma for unit tests
- Test files: `*.spec.ts`
- Run: `ng test`

### File Naming
- **Backend**: `kebab-case.ts` (e.g., `game-instance.controller.ts`)
- **Frontend**: `kebab-case.ts` (e.g., `game-instance.component.ts`)
- **Types/Interfaces**: PascalCase (e.g., `GameDef`, `GameInstance`)
- **Services**: Suffix with `.service.ts`
- **Controllers**: Suffix with `.controller.ts`
- **Repositories**: Suffix with `.repository.ts`

### Error Handling
- Use custom HTTP error classes from `core/router/http-errors.ts`
- Always handle promise rejections
- Return meaningful error messages to clients
- Log errors with full context

## Development Workflow

### Starting the Application
```bash
# Backend (starts MongoDB via Docker Compose)
cd ./back && npm start

# Frontend
cd ./front && npm start
```

### Environment Setup
- Backend config: `back/configuration.json` (copy from `configuration.dist.json`)
- Frontend uses proxy config: `front/proxy.conf.js`

### Commit Messages
- Use **Conventional Commits** format: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(backend): add game session API endpoints`
- Example: `fix(frontend): resolve signal update issue in participant state`

## Important Notes

- **Zoneless Angular**: No `NgZone`, so avoid relying on zone-based change detection
- **Shared Schemas**: Schema definitions are in `pagemaster-schemas/`
- **Static Files**: Backend serves frontend build when `staticFilesPath` is configured
- **SPA Fallback**: Backend serves `index.html` for non-API routes to support Angular routing
- **Real-time Updates**: Use Socket.IO for live game state synchronization

## When Adding Features

1. **Backend**: Create controller with decorators, add to `index.ts` controllers array
2. **Frontend**: Create standalone component, add route to `app.routes.ts`
3. **Shared Types**: Update `pagemaster-schemas/` if data models change
4. **Real-time**: Add Socket.IO events if live updates are needed
5. **Tests**: Write unit tests for new functionality

## Things to Avoid

- Don't use `any` type; use proper TypeScript types
- Don't create NgModules (project uses standalone components)
- Don't use zone-based APIs in Angular (project is zoneless)
- Don't bypass the dependency container in backend
- Don't expose MongoDB `_id` fields to frontend
- Don't skip error handling in async operations

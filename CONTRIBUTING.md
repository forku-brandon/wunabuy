# Contributing to Wunabuy

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/wunabuy.git`
3. Add upstream: `git remote add upstream https://github.com/forku-brandon/wunabuy.git`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Branch Strategy

- `main` — Production-ready code. Never commit directly.
- `develop` — Integration branch for the next release.
- `feature/*` — New features (e.g., `feature/escrow-payouts`)
- `fix/*` — Bug fixes (e.g., `fix/order-status-transition`)
- `release/*` — Release preparation (e.g., `release/v1.0.0`)
- `hotfix/*` — Urgent production fixes (e.g., `hotfix/payment-gateway-crash`)

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting, no code change
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `test` — Adding or correcting tests
- `chore` — Build process, auxiliary tools, dependencies

### Examples
```
feat(auth): add phone OTP verification
fix(payment): handle Flutterwave timeout gracefully
docs(api): update order endpoint documentation
refactor(search): extract ranking service
test(chat): add conversation service tests
```

## Pull Request Process

1. Update your branch with develop: `git pull upstream develop`
2. Run tests: `cd wunabuy-backend && npm run test`
3. Run linting: `cd wunabuy-backend && npm run lint`
4. Create PR targeting `develop` branch
5. Fill out the PR template
6. Request review from at least one team member
7. Address review feedback
8. Squash merge once approved

### PR Template

```
## Description
[What does this PR do?]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added for changes
```

## Code Style

### TypeScript
- Strict mode enabled
- No `any` types without justification
- Use Zod for input validation
- Prefer interfaces over type aliases for objects

### Naming
- Files: `kebab-case.ts` for utilities, `module.service.ts` for services
- Variables/functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case`
- API routes: `kebab-case`

### Module Structure
Each module follows:
```
module-name/
├── module-name.routes.ts       # Express route definitions
├── module-name.controller.ts   # Request handlers
├── module-name.service.ts      # Business logic
├── module-name.schema.ts       # Zod validation schemas
└── module-name.types.ts        # TypeScript types
```

## Database Migrations

1. Create a new migration file: `supabase/migrations/NNN_description.sql`
2. Test locally: `npm run migrate:local`
3. Never edit a migration that has been applied to staging or production
4. Destructive changes require team review

## Testing

- Write tests for all new features
- Maintain 80% coverage on critical modules
- E2E tests for key user journeys
- Run `npm run test:coverage` before PR

## Questions?

Contact the team lead or open an issue.

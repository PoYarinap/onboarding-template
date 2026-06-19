# Journals Feature

User-owned journal entries with full CRUD, pagination, search, and permission-gated access.

## Data Model

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | number | auto | Primary key |
| `title` | string | yes | Journal entry title |
| `content` | text | yes | Journal entry body |
| `date` | date | no | Date the entry is about (defaults to null) |
| `userId` | number | auto | Owner — set from JWT on create |
| `createdAt` | timestamp | auto | Record creation time |
| `updatedAt` | timestamp | auto | Last update time |
| `deletedAt` | timestamp | auto | Soft-delete timestamp |

## Permissions

| Permission | Who needs it | Effect |
|---|---|---|
| `menu.journals` | All journal users | Shows Journals in the sidebar |
| `journals.create` | Writers | Can create new journal entries |
| `journals.read` | All journal users | Can read **own** journals |
| `journals.read_all` | Admins | Can read **all users'** journals |
| `journals.update` | Writers | Can update **own** journals |
| `journals.delete` | Writers | Can delete **own** journals |

## API Endpoints

| Method | URL | Permission | Description |
|---|---|---|---|
| `GET` | `/api/journals` | `journals.read` | List journals (own, or all if `journals.read_all`) |
| `GET` | `/api/journals/:id` | `journals.read` | Get single journal |
| `POST` | `/api/journals` | `journals.create` | Create journal (userId from JWT) |
| `PATCH` | `/api/journals/:id` | `journals.update` | Update own journal |
| `DELETE` | `/api/journals/:id` | `journals.delete` | Soft-delete own journal |

## Backend Files

```
backend/src/journals/
├── entities/journal.entity.ts      ← TypeORM entity, table: journals
├── dto/base-journal.dto.ts         ← Shared fields (title, content, date)
├── dto/create-journal.dto.ts       ← extends BaseJournalDto
├── dto/update-journal.dto.ts       ← PartialType of CreateJournalDto
├── journals.service.ts             ← extends BaseService<Journal>
├── journals.controller.ts          ← REST endpoints
└── journals.module.ts              ← Module registration
```

Edited files:
- `app.module.ts` — added `JournalsModule`
- `auth/permissions.type.ts` — added journals permissions to `PermissionType` union
- `database/seeder/seeder.service.ts` — added permissions to `permissionsData`

## Frontend Files

```
frontend/src/
├── routes/(journals)/journals.tsx                  ← Page route
├── components/features/journals/
│   ├── columns.tsx                                 ← Table column definitions
│   └── modal.tsx                                   ← Create / Edit / View modal
├── hooks/use-journals.ts                           ← Page hook (data + mutations)
├── lib/
│   ├── services/journal.service.ts                 ← API calls
│   ├── schemas/journals.ts                         ← Zod validation schema
│   └── stores/journals-ui.store.ts                 ← Modal open/close state
```

Edited files:
- `lib/constants/sidebar.tsx` — added `journals` to `MENU_PERMISSIONS` and `sidebarData`

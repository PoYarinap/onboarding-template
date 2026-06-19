# Journals Feature

User-owned journal entries with full CRUD, pagination, search, and permission-gated access.

## Data Model

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | number | auto | Primary key |
| `title` | string | yes | Journal entry title |
| `content` | text | yes | Journal entry body |
| `date` | date | no | Date the entry is about |
| `userId` | number | auto | Owner — set from JWT on create |
| `createdAt` | timestamp | auto | Record creation time |
| `updatedAt` | timestamp | auto | Last update time |
| `deletedAt` | timestamp | auto | Soft-delete timestamp |

## Permissions

| Permission | Effect |
|---|---|
| `menu.journals` | Shows Journals in the sidebar |
| `journals.create` | Can create new journal entries |
| `journals.read` | Can read **own** journals |
| `journals.read_all` | Can read **all users'** journals (admin) |
| `journals.update` | Can update **own** journals |
| `journals.delete` | Can delete **own** journals |

## API Endpoints

| Method | URL | Permission | Description |
|---|---|---|---|
| `GET` | `/api/journals` | `journals.read` | List journals (own, or all if `journals.read_all`) |
| `GET` | `/api/journals/:id` | `journals.read` | Get single journal |
| `POST` | `/api/journals` | `journals.create` | Create journal (userId from JWT) |
| `PATCH` | `/api/journals/:id` | `journals.update` | Update own journal |
| `DELETE` | `/api/journals/:id` | `journals.delete` | Soft-delete own journal |

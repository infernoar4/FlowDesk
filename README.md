# FlowDesk Foundation

Build only the frontend foundation for a modern React application called **FlowDesk**, an Internal Workplace Operations Platform for small and medium-sized organizations.

Use:

- React

- JavaScript (ES6+)

- React Router

- Tailwind CSS

- Functional Components

IMPORTANT:

This is ONLY the frontend foundation.

Do NOT implement backend logic, authentication functionality, API calls, databases, business logic, state management libraries, or mock workflows.

Use only placeholder/static data.

The objective is to build a scalable UI architecture that future modules can plug into.

----------------------------------------------------

Create the following pages:

• Login

• Dashboard

• Tickets (placeholder)

• Leave Requests (placeholder)

• Assets (placeholder)

• Announcements (placeholder)

• Meeting Rooms (placeholder)

• Profile

----------------------------------------------------

Create reusable layout components:

• Sidebar

• Top Navbar

• Page Header

• Dashboard Cards

• Buttons

• Table Component

• Search Bar

• Status Badge

• Empty State Component

----------------------------------------------------

Dashboard should include:

• Welcome Card

• Statistics Cards (placeholder)

• Recent Activity Card

• Recent Announcements Card

• Quick Action Buttons

All using placeholder data.

----------------------------------------------------

Design Requirements

Modern SaaS Dashboard

Professional corporate look

Minimalistic

Rounded corners

Soft shadows

Blue/Indigo primary color

Excellent spacing

Responsive layout

Consistent typography

Reusable components

Avoid unnecessary animations.

----------------------------------------------------

Project Structure

Organize the code using a scalable folder structure suitable for future expansion.

Example:

src/

components/

layouts/

pages/

hooks/

services/

utils/

assets/

styles/

routes/

----------------------------------------------------

Use React Router for routing.

Do not implement authentication logic.

Only create the pages and navigation.

Navigation should already work between all pages.

----------------------------------------------------

Code Quality

Use clean, readable React code.

Keep components modular.

Avoid duplicated code.

Build this as if the application will later connect to a Spring Boot backend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f9eb01c-da6c-4a8a-ab8e-1325427c3cb1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

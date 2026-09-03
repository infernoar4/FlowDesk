# 🚀 FlowDesk — Workplace Operations & Service Management Platform

**FlowDesk** is a modern, enterprise-grade Workplace Operations & IT Service Management Platform designed for small to medium-sized organizations. Built with React, TypeScript, TanStack Router, Tailwind CSS, and powered by a MySQL database backend.

---

## 🌟 Key Features & Highlights

### ⚡ 1. Automated Workload Load-Balancer Engine
* **Intelligent Auto-Assignment**: When an employee submits a new ticket, FlowDesk's workload engine automatically inspects active support engineers and assigns the ticket to the engineer with the lowest current workload.
* **Strict Single-Engineer Ownership**: Only the assigned Support Engineer is authorized to update or resolve their ticket. Other engineers viewing the ticket see an authorized read-only mode warning.

### 📜 2. Real-Time System Audit Logs (`/audit-logs`)
* **Immutable Activity Trail**: Logs every major workplace action (ticket creation, auto-assignment, status change, leave approval, asset allocation, room booking).
* **Search & Module Filters**: Search audit logs by user, action details, or filter by module in real-time.

### 🛡️ 3. Support Engineer Dual Access & Role Switcher
* **Top Navbar Mode Switcher**: Support Engineers can seamlessly toggle between `🛡️ Support Engineer` mode and `👤 Employee View`.
* **Persistent Active Mode**: Toggling roles persists state across all pages (Dashboard, Assets, Leaves, Tickets) and browser refreshes.

### 🗄️ 4. Real MySQL Database Integration
* **22 Seeded User Accounts**: Real MySQL database (`flowdesk.users`) populated with 22 users across Employees, Support Engineers, and Managers/HR.
* **Dynamic Dashboard**: Computes all metrics, open tickets, pending leaves, and room bookings dynamically from live user data with zero static fallbacks.

### 📅 5. Smart Meeting Room Booking Engine
* **Past Date/Time Validation**: Prevents booking past dates or hours.
* **Room Availability Verification**: Live room status indicators (Available, Occupied, Reserved).

---

## 🔑 Demo Login Credentials

All seeded user accounts share the default password: **`password123`**

| Role | Name | Email / Username | Default Mode |
| :--- | :--- | :--- | :--- |
| **Support Engineer** | Aryan Giri | `aryangiri9999@gmail.com` / `aryan` | Support & Employee View |
| **Support Engineer (Lead)** | Rahul Verma | `rahul.verma@flowdesk.co` / `rahul.verma` | Support Engineer |
| **Employee** | Alex Morgan | `alex.morgan@company.com` / `alex.morgan` | Employee View |
| **Manager / HR** | Sarah Connor | `sarah.connor@flowdesk.co` / `sarah.connor` | Manager View |

---

## 🛠️ Enterprise Technology Stack

* **Backend Framework**: **Java 17**, **Spring Boot 3**, **Spring Web (REST APIs)**
* **ORM & Database Layer**: **Hibernate (JPA ORM)**, **Spring Data JPA**, **MySQL 8.0**
* **Core Java Engine**: **Java Collection Framework** (`List`, `Map`, `HashMap`, `Set`), **Java Streams API** (Workload Load-Balancer Engine)
* **Build System**: Apache Maven (`pom.xml`)
* **Frontend UI**: React 18, TypeScript, Tailwind CSS, Glassmorphism, Dark/Light Mode, Lucide React Icons
* **Routing Engine**: TanStack Router (File-Based Routing)

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)
* **MySQL Server** (Optional for full DB features, runs with fallback data)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/your-username/FlowDesk.git
cd FlowDesk

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open **[http://localhost:8080](http://localhost:8080)** in your browser.

---

## 📜 Project Structure

```
FlowDesk/
├── src/
│   ├── components/       # Reusable UI components (Sidebar, TopNavbar, Modals, Badges)
│   ├── context/          # State management (Auth, Role, Ticket, Leave, Asset, Room, Audit)
│   ├── data/             # Mock datasets & initial fallbacks
│   ├── lib/              # Database drivers & server utilities
│   ├── routes/           # TanStack file-based page routes
│   └── styles.css        # Core design system & theme tokens
├── scripts/              # Database setup & viewer tools
├── package.json          # Dependencies & build scripts
└── tsconfig.json         # TypeScript strict configuration
```

---

## 📄 License
This project is licensed under the MIT License — created for final-year graduation capstone evaluation.

-- FlowDesk Database Schema Definition

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS flowdesk;
USE flowdesk;

-- Drop existing tables to ensure clean structure matching FlowDesk models
DROP TABLE IF EXISTS ticket_comments;
DROP TABLE IF EXISTS ticket_internal_notes;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS asset_comments;
DROP TABLE IF EXISTS asset_requests;
DROP TABLE IF EXISTS room_bookings;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  company_email VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('employee', 'support', 'manager') NOT NULL DEFAULT 'employee',
  department VARCHAR(100),
  designation VARCHAR(100),
  phone VARCHAR(50),
  location VARCHAR(100),
  initials VARCHAR(10),
  account_status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial real users into MySQL (8 Employees, 7 Support Engineers, 7 Managers/HR)
INSERT INTO users (employee_id, full_name, company_email, username, password, role, department, designation, phone, location, initials)
VALUES 
  -- Employees (8)
  ('EMP-00214', 'Alex Morgan', 'alex.morgan@flowdesk.co', 'alex.morgan', 'password123', 'employee', 'Engineering', 'Software Engineer', '+1 555-0199', 'Main HQ', 'AM'),
  ('EMP-00555', 'David Miller', 'david.miller@flowdesk.co', 'david.miller', 'password123', 'employee', 'Operations', 'Operations Specialist', '+1 555-0188', 'Main HQ', 'DM'),
  ('EMP-00312', 'Emily Chen', 'emily.chen@flowdesk.co', 'emily.chen', 'password123', 'employee', 'Design', 'Product Designer', '+1 555-0177', 'San Francisco', 'EC'),
  ('EMP-00418', 'Michael Scott', 'michael.scott@flowdesk.co', 'michael.scott', 'password123', 'employee', 'Sales', 'Account Executive', '+1 555-0166', 'Scranton Branch', 'MS'),
  ('EMP-00522', 'Jessica Taylor', 'jessica.taylor@flowdesk.co', 'jessica.taylor', 'password123', 'employee', 'Marketing', 'Content Lead', '+1 555-0155', 'Main HQ', 'JT'),
  ('EMP-00631', 'James Wilson', 'james.wilson@flowdesk.co', 'james.wilson', 'password123', 'employee', 'Engineering', 'Backend Developer', '+1 555-0144', 'Austin Office', 'JW'),
  ('EMP-00744', 'Sophia Martinez', 'sophia.martinez@flowdesk.co', 'sophia.martinez', 'password123', 'employee', 'Finance', 'Financial Analyst', '+1 555-0133', 'Main HQ', 'SM'),
  ('EMP-00855', 'Daniel Lee', 'daniel.lee@flowdesk.co', 'daniel.lee', 'password123', 'employee', 'Quality Assurance', 'QA Engineer', '+1 555-0122', 'Main HQ', 'DL'),

  -- Support Engineers (7)
  ('EMP-00108', 'Rahul Verma', 'rahul.verma@flowdesk.co', 'rahul.verma', 'password123', 'support', 'IT Support', 'Support Lead', '+91 98450 33127', 'Bengaluru Office', 'RV'),
  ('EMP-00112', 'Priya Nair', 'priya.nair@flowdesk.co', 'priya.nair', 'password123', 'support', 'IT Support', 'Systems Engineer', '+91 98450 44218', 'Bengaluru Office', 'PN'),
  ('EMP-00115', 'Arjun Mehta', 'arjun.mehta@flowdesk.co', 'arjun.mehta', 'password123', 'support', 'IT Support', 'Hardware Specialist', '+91 98450 55329', 'Bengaluru Office', 'AM'),
  ('EMP-00119', 'Vikram Rao', 'vikram.rao@flowdesk.co', 'vikram.rao', 'password123', 'support', 'Network Support', 'Network Administrator', '+91 98450 66430', 'Bengaluru Office', 'VR'),
  ('EMP-00123', 'Ananya Sen', 'ananya.sen@flowdesk.co', 'ananya.sen', 'password123', 'support', 'IT Support', 'Service Desk Analyst', '+91 98450 77541', 'Bengaluru Office', 'AS'),
  ('EMP-00127', 'Kabir Sharma', 'kabir.sharma@flowdesk.co', 'kabir.sharma', 'password123', 'support', 'Infrastructure', 'Cloud Support Engineer', '+91 98450 88652', 'Bengaluru Office', 'KS'),
  ('EMP-00130', 'Neha Kapoor', 'neha.kapoor@flowdesk.co', 'neha.kapoor', 'password123', 'support', 'Security Operations', 'Security Analyst', '+91 98450 99763', 'Bengaluru Office', 'NK'),

  -- Managers & HR (7)
  ('EMP-00005', 'Sarah Connor', 'sarah.connor@flowdesk.co', 'sarah.connor', 'password123', 'manager', 'People Operations', 'Engineering Director / HR', '+1 555-0144', 'Main HQ', 'SC'),
  ('EMP-00012', 'Marcus Lin', 'marcus.lin@flowdesk.co', 'marcus.lin', 'password123', 'manager', 'Finance', 'VP of Finance', '+1 555-0111', 'Main HQ', 'ML'),
  ('EMP-00018', 'Sofia Almeida', 'sofia.almeida@flowdesk.co', 'sofia.almeida', 'password123', 'manager', 'Engineering', 'Engineering Manager', '+1 555-0222', 'Main HQ', 'SA'),
  ('EMP-00024', 'Robert Vance', 'robert.vance@flowdesk.co', 'robert.vance', 'password123', 'manager', 'Operations', 'Director of Operations', '+1 555-0333', 'Main HQ', 'RV'),
  ('EMP-00030', 'Patricia Adams', 'patricia.adams@flowdesk.co', 'patricia.adams', 'password123', 'manager', 'Human Resources', 'Head of HR', '+1 555-0444', 'Main HQ', 'PA'),
  ('EMP-00036', 'William Zhang', 'william.zhang@flowdesk.co', 'william.zhang', 'password123', 'manager', 'Product Management', 'VP of Product', '+1 555-0555', 'Main HQ', 'WZ'),
  ('EMP-00042', 'Amanda White', 'amanda.white@flowdesk.co', 'amanda.white', 'password123', 'manager', 'Legal & Compliance', 'Chief Compliance Officer', '+1 555-0666', 'Main HQ', 'AW');

-- Tickets table
CREATE TABLE tickets (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Hardware', 'Software', 'Network', 'Account Access', 'Printer', 'Other') NOT NULL,
  status ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  assignee_id INT NULL,
  reporter_id INT NOT NULL,
  attachment VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- Ticket Comments table
CREATE TABLE ticket_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(20) NOT NULL,
  author_id INT NOT NULL,
  role ENUM('Employee', 'Support') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Leaves table
CREATE TABLE leave_requests (
  id VARCHAR(20) PRIMARY KEY,
  employee_id INT NOT NULL,
  type ENUM('Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp Off', 'Half Day') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reviewer_id INT NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- Assets table
CREATE TABLE asset_requests (
  id VARCHAR(20) PRIMARY KEY,
  employee_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  status ENUM('pending', 'approved', 'rejected', 'assigned', 'return_requested', 'returned') DEFAULT 'pending',
  asset_id VARCHAR(50) NULL,
  asset_name VARCHAR(150) NULL,
  rejection_reason TEXT NULL,
  assigned_on DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Room Bookings table
CREATE TABLE room_bookings (
  id VARCHAR(20) PRIMARY KEY,
  room_id VARCHAR(20) NOT NULL,
  organizer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  attendees_count INT NOT NULL DEFAULT 1,
  notes TEXT NULL,
  status ENUM('booked', 'confirmed', 'checked_in', 'completed', 'cancelled') DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

SET FOREIGN_KEY_CHECKS = 1;

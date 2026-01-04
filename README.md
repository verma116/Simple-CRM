# Simple CRM Application

## Overview

The **Simple CRM Application** is a lightweight customer relationship management system designed to help users manage customers, track interactions, and schedule follow-ups through a clean and simple interface.

This project was developed as part of a technical assessment to demonstrate practical skills in frontend development, authentication, backend integration, and clean project structure.

---

## Purpose of the Project

The goal of this project is to:

* Build a functional CRM with essential features
* Implement secure user authentication
* Manage customer data efficiently
* Track interactions and follow-ups
* Deliver a stable and demo-ready application within a limited timeframe

---

## Tech Stack

* **Frontend:** React.js
* **Backend & Authentication:** Supabase
* **Database:** Supabase PostgreSQL
* **Version Control:** Git & GitHub

---

## Features

### Authentication

* User signup using email and password
* User login
* Secure logout

### Customer Management

* Add new customer profiles
* View customer list
* Search customers
* Update customer status
* Add notes for customers

### Interaction Management

* Log customer interactions (calls, emails, meetings)
* View interaction history for each customer

### Follow-Ups

* Set follow-up reminders
* View upcoming follow-ups

### Dashboard

* Clean and simple dashboard
* Overview of customers and follow-ups

---

## Application Flow

1. User signs up or logs in
2. User is redirected to the dashboard
3. Customers are added and managed
4. Interactions are logged for customers
5. Follow-ups are scheduled and tracked
6. User logs out securely

---

## Project Structure

```
src/
│── components/
│── pages/
│── services/
│── utils/
│── App.js
│── index.js
```

---

## How to Run the Project Locally

1. Clone the repository:

```bash
git clone https://github.com/verma116/Simple-CRM.git
```

2. Navigate to the project folder:

```bash
cd Simple-CRM
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file and add Supabase credentials:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the application:

```bash
npm start
```

6. Open in browser:

```
http://localhost:3000
```

---

## Demo Highlights

During the demo, the following features are showcased:

* User authentication (login and logout)
* Adding a customer profile
* Logging a customer interaction
* Viewing customer list and interaction history

---

## Assessment Alignment

This project fulfills all the requirements of the technical assessment:

* Login system
* Customer management
* Interaction tracking
* Follow-up reminders
* Clean dashboard
* GitHub repository submission

---

## Future Enhancements

* Role-based access control
* Email or SMS notifications for follow-ups
* Advanced analytics dashboard
* Export customer data

---

## Author

**Adithya Verma**
Engineering Student | Aspiring Software Developer

---

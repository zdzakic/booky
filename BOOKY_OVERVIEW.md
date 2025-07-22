# 📘 Booky – Modular Booking System

## 🎯 Project Goal

Booky is a lightweight, modular, and easily customizable booking system.  
It is designed to be quickly adapted for different types of local businesses such as:
- car service shops
- dentists
- hair salons
- massage studios
- beauty services
- test drive centers
- and similar appointment-based services

---

## 💡 Core Philosophy

**One client – one application.**

Booky is not a centralized SaaS platform.  
Instead, each client gets their own standalone version of the app that is:

- ⚙️ Easy to customize (texts, services, durations, UI)
- 💻 Locally developed and deployed
- 🧱 Modular in structure (`ServiceType`, `TimeSlot`, `Reservation`)
- 🚫 No multi-user complexity or tenant separation

---

## 🧱 Technical Stack

- **Backend:** Django + Django REST Framework
- **Frontend:** React (Vite)
- **Core Entities:**
  - `ServiceType` – defines a service and its duration
  - `TimeSlot` – available time slots for booking
  - `Reservation` – reservation tied to a service and slot
- **Features:**
  - List of available services
  - View free time slots
  - Submit reservations
  - Simple admin dashboard to view/manage reservations and holidays
- **UI Language:** Default is German (DE), with full support for EN, IT, FR

---

## ✅ Usage Scenario

Initial version targets a **mechanic workshop for tire changes**.  
The same logic can be easily reused for:

- Dental clinics
- Hairdressers
- Physical therapy & massage
- Cosmetic salons
- Test drives
- bike shops and more 

---

## 🔁 Deployment Strategy

1. Clone the project for each new client
2. Adjust service types (`ServiceType`)
3. Define daily/weekly schedule (`TimeSlot`)
4. Customize translations and texts (i18n)
5. Deploy locally or on preferred hosting

---

## 🚫 What Booky is NOT

- It is **not** a centralized multi-tenant SaaS
- It does **not** support complex user roles or accounts
- It is **not** meant to be shared between unrelated businesses

---

## ✂️ Basic Package – What’s Included
Booky’s standard package includes:

- Up to 2 services (e.g. “Tire Change”, “Oil Change”)
- One resource (e.g. 1 lift, 1 chair, 1 room, etc.)
- Fixed opening hours (e.g. 8:00–18:00, with 30-min slots)
- Option to block holidays and collective vacation days
- Simple admin panel for managing reservations and blocked dates

### Additions (on request, for an extra fee):
- More than 2 services
- More resources/lines/chairs
- Custom admin dashboard features (e.g. adding lines, services, prices)
- SMS/email customization or integration
- Per-day or seasonal opening hours
- Integration with other calendars (Google, Outlook)
- Any advanced/“out of the box” needs


# Get Driven Loon Calculator - PRD

## Original Problem Statement
Private chauffeur salary calculator for "Get Driven" company. Belgian law compliant. Student (no income tax). Landing page, auth, dashboard with stats/charts, ride management, adjustable settings.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Frontend**: React + Tailwind CSS + Shadcn UI + Recharts
- **Auth**: JWT-based (email/password)
- **Database**: MongoDB collections: users, rides, settings

## Core Requirements (Static)
- Salary: first 9h at €12.83/hr, overtime 150%, night surcharge €1.46 (20:00-06:00)
- WWV: €0.26/km reimbursement
- Social contribution: 2.71%
- Student Belgium: no income tax
- All rates adjustable in settings

## User Personas
- Belgian student working as private chauffeur for Get Driven
- Needs quick salary tracking per ride

## What's Been Implemented (Feb 2026)
- Landing page with hero, dark theme, lime accent
- JWT auth (register/login)
- Dashboard with stat cards, monthly earnings bar chart, car distribution pie chart, recent rides
- Add/Edit/Delete rides with full salary calculation
- Ride history with search, expandable details
- Settings page with all adjustable rates
- Night hours calculation (20:00-06:00)
- Overtime calculation (>9h threshold)
- WWV km reimbursement
- Social contribution deduction

## Prioritized Backlog
### P0 (Done)
- [x] Auth system
- [x] Ride CRUD
- [x] Salary calculation engine
- [x] Dashboard with charts
- [x] Settings management

### P1 (Next)
- [ ] Export ritten naar CSV/PDF
- [ ] Maandelijkse rapportage
- [ ] Student uren teller (600u limiet/jaar)

### P2 (Nice to have)
- [ ] Google Auth login
- [ ] Dark/Light theme toggle
- [ ] Meerdere gebruikers/chauffeurs
- [ ] Push notificaties

## Next Tasks
- Export functionality (CSV/PDF)
- Monthly report generation
- Student hours counter (600h/year Belgian limit)

## Update Feb 2026 - Iteration 2
### Changes Made:
1. **Bruto/Netto formule gecorrigeerd**: Bruto = uurloon + WWV + extra kosten + sociale bijdrage. Netto = Bruto - sociale bijdrage
2. **Auto merk logo's**: CarBrandLogo component met Google favicon API (50+ merken ondersteund, fallback naar initialen)
3. **Uitgebreid Dashboard**: 
   - 8 stat cards (ritten, uren, bruto, netto, overuren, nachturen, gem/rit, gem/uur)
   - 4 tabs: Verdiensten, Uren, Auto's, Patronen
   - Filters: maand, klant, automerk (met Select dropdowns)
   - Charts: maandelijkse verdiensten bar, wekelijkse trend area, uren breakdown, merk pie, weekdag radar, werktijden distributie
   - Top klanten ranking, auto details overzicht
4. **Backend stats uitgebreid**: filterable op month/client_name/car_brand, meer datapoints

# PG Finder — Agent Instructions

## Directory Structure
```
PG-finder/
├── frontend/                         # Next.js 16 App Router + TypeScript + Tailwind CSS
│   ├── src/                          # Application source
│   │   ├── app/                      # Pages (/, /search, /city/[city], /area/[area], /pg/[slug])
│   │   ├── components/               # React components (CompanySearch, BranchSelector, ChatAssistant, Map, etc.)
│   │   ├── hooks/                    # React Query hooks (useSearch, useChat)
│   │   ├── lib/                      # API client, Supabase clients, utilities
│   │   ├── providers/                # QueryProvider, ThemeProvider
│   │   └── types/                    # TypeScript types
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── backend/                          # Spring Boot 3 + Java 21 + Maven
│   ├── src/main/java/com/pgfinder/
│   │   ├── config/                   # CORS, OpenAPI, Async, RestTemplate
│   │   ├── controller/               # REST APIs
│   │   ├── service/                  # Business logic + RAG Chat + OSM ingestion
│   │   ├── repository/               # JPA + PostGIS queries
│   │   ├── entity/                   # JPA entities (Company, Branch, PGListing, City)
│   │   ├── dto/response/             # Response DTOs
│   │   ├── mapper/                   # MapStruct mappers
│   │   └── exception/                # GlobalExceptionHandler
│   ├── pom.xml
│   └── src/main/resources/
├── supabase-schema.sql               # Full database schema (PostGIS + pgvector)
```

## Running
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && ./mvnw spring-boot:run`
- Build: `cd frontend && npm run build`

## Architecture
- Frontend → Spring Boot API → PostgreSQL/Supabase (PostGIS + pgvector)
- No authentication, no login, no booking
- Company-based search flow: company name → branch selection → nearby PGs
- RAG chatbot using Spring AI + OpenAI + pgvector
- Clean Architecture in backend (controller → service → repository → entity)
- React Query for client data fetching

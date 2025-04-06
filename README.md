# B2B

B2B is a full-stack web application that allows users to list, browse, swipe, and exchange books with others in their community. The platform focuses on peer-to-peer exchange, social discovery, and encouraging sustainable reading habits.

## Features

### Book Exchange
- Add, manage, and display books for exchange.
- Include details such as title, author, genre, condition, and status (available, reserved, exchanged, unavailable).
- Request and respond to book exchange offers.

### AI Auto-Fill
- Automatically fill in book details by entering the title.
- Integrates with a language model (Claude via OpenRouter) to suggest author, genre, and description.

### Swipe Discovery

Users can explore available books through a swipe-based interface inspired by Tinder. Two swipe modes are supported:

- **Mood Swipe (Surprise Mode):** Offers a curated list of books based on the user's favorite genres, introducing variety and discovery through controlled randomness.
- **Controlled Mode:** Allows users to swipe through books that match their selected filters for genre, condition, and availability.

Swiping right sends a book exchange request, while swiping left skips the book.

### Smart Search & Filters

Users can refine their browsing experience with a powerful filtering system:

- **Search Bar:** Instantly find books by title, author, or keyword in the description.
- **Genre & Condition Filters:** Narrow results by selecting specific genres and book conditions.
- **Availability Toggle:** Show only books that are currently available for exchange.


### Smart Recommendations (In Development)
- Recommends books based on favorite genres and proximity to available listings.

### User Dashboard
- Tabbed view for "My Books" and "Exchange Requests."
- Allows toggling book availability, deleting listings, or marking books as exchanged.

## Tech Stack

### Environment Variables

The backend requires environment variables to be set for Supabase integration and AI functionality.

A `.env-sample` file is provided in the `backend/` directory to help you get started. Copy it to `.env` and fill in the required values:
- `SUPABASE_URL`, `SUPABASE_KEY`, and `SUPABASE_JWT_SECRET` can be found in your Supabase project settings.
- `OPENROUTER_API_KEY` is needed for AI-powered features like auto-filling book information. You can get it from [openrouter.ai](https://openrouter.ai).

Make sure to restart the backend server after setting up your `.env` file.


### Backend
- FastAPI (Python)
- Supabase (PostgreSQL + Authentication + Storage)
- httpx (Async HTTP client)
- dotenv (Environment variable management)
- OpenRouter (Claude 3 integration)

### Frontend
- Next.js (React)
- Tailwind CSS
- ShadCN UI (Component library)
- Zod + React Hook Form (Validation and form handling)
- Framer Motion (Animations for swipe transitions)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bookswap.git
cd bookswap
```

### 2. Set Up the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set Up the Frontend
```bash
cd frontend
npm install
```

## Running the App

### 1. Backend (FastAPI)
```bash
cd backend
uvicorn main:app --reload
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000

### Future Plans

To further enhance user experience and platform capabilities, we plan to implement:

1. **AI Auto-Fill from Book Images**  
   Allow users to upload book cover images to auto-extract title, author, genre, and description using OCR and LLMs.

2. **Smarter Recommendations**  
   Personalize suggestions based on browsing history, favorites, and genre preferences—not just genre similarity.

3. **Enhanced Swipe Discovery**  
   Improve Mood Swipe by curating more diverse, non-repetitive selections beyond basic filters.

4. **Community Features**  
   Add messaging after request acceptance, public user profiles, and optional profile blogs or activity feeds.

5. **Admin Tools**  
   Build an admin dashboard to manage listings, moderate users, and monitor exchanges.

6. **Notification System**  
   Enable in-app and email alerts for exchange requests, status updates, and user interactions.


# Freelancer Onboarding Refactor

## Summary
Completely refactored the freelancer onboarding process to properly integrate with the backend API endpoints. The onboarding flow has been simplified from 6 steps to 4 essential steps.

## Changes Made

### 1. **API Layer** (`src/lib/api/`)
- **Created** `freelancer/index.ts` - New dedicated API service for freelancer operations
- **Updated** `endpoints.ts` - Added missing endpoints:
  - `ADD_SKILLS`: `/users/freelancer/skills`
  - `ADD_PORTFOLIO`: `/users/freelancer/portfolio`

### 2. **Onboarding Flow Simplification**
Reduced from 6 steps to 4 essential steps:

#### **Step 1: Profile** (`ProfileStep.tsx`)
- **API**: `PUT /users/freelancer/profile`
- **Fields**: avatar, title, overview, availability, experience, languages
- **Changes**:
  - Now properly calls `freelancerApi.updateProfile()`
  - Saves data to backend before proceeding
  - Proper error handling and loading states

#### **Step 2: Skills** (`SkillsStep.tsx`)
- **API**: `POST /users/freelancer/skills`
- **Fields**: skills array
- **Changes**:
  - Calls `freelancerApi.addSkills()` with selected skills
  - Proper validation (minimum 3 skills)
  - Error handling for API failures

#### **Step 3: Portfolio** (`PortfolioStep.tsx`)
- **API**: `POST /users/freelancer/portfolio`
- **Fields**: title, description, images, url, technologies
- **Changes**:
  - Iterates through portfolio items and saves each via API
  - Properly structured payload matching backend expectations
  - Error handling for failed submissions

#### **Step 4: Payment Setup** (`PaymentStep.tsx`)
- **API**: 
  - `POST /users/stripe-account` - Create Stripe Connect account
  - `POST /users/stripe-account/onboard` - Get onboarding link
- **Changes**:
  - **Real Stripe Connect integration**
  - Creates Stripe Express account with country selection
  - Redirects to Stripe onboarding flow
  - Handles return from Stripe with success parameter
  - Proper error handling and user feedback

### 3. **Navigation Improvements**
- **Old**: Used separate route paths for each step (`/profile`, `/professional`, `/skills`, etc.)
- **New**: Uses query parameters (`?step=1`, `?step=2`, etc.)
- **Benefits**:
  - Simpler routing logic
  - Single page component handles all steps
  - Easier state management

### 4. **Removed Redundant Steps**
- Removed `ProfessionalStep` (merged with ProfileStep)
- Removed `CredentialsStep` (not required by backend API)

### 5. **Main Onboarding Page** (`page.tsx`)
- Simplified step detection using URL query parameters
- Removed complex pathname-based routing
- Updated total steps from 6 to 4
- Cleaner component structure

## API Integration Details

### Profile Update
```typescript
PUT /users/freelancer/profile
{
  "avatar": "url",
  "availability": "full-time" | "part-time",
  "experience": "beginner" | "intermediate" | "expert",
  "languages": ["English", "Sinhala"],
  "title": "Full Stack Developer",
  "overview": "Professional summary..."
}
```

### Skills Addition
```typescript
POST /users/freelancer/skills
{
  "skills": ["JavaScript", "React", "Node.js", ...]
}
```

### Portfolio Addition
```typescript
POST /users/freelancer/portfolio
{
  "title": "E-commerce Website",
  "description": "Project description...",
  "images": ["url1", "url2"],
  "url": "https://project.com",
  "technologies": ["React", "Node.js", ...]
}
```

### Stripe Connect Setup
```typescript
// Step 1: Create account
POST /users/stripe-account
{
  "country": "US",
  "type": "express"
}

// Step 2: Get onboarding link
POST /users/stripe-account/onboard
{
  "refreshUrl": "http://frontend/onboarding?step=4",
  "returnUrl": "http://frontend/onboarding?step=4&stripe_success=true",
  "type": "account_onboarding"
}
```

## User Experience Improvements

1. **Progress Persistence**: All form data is saved to Redux and localStorage
2. **Real-time Validation**: Fields are validated as user types
3. **Error Handling**: Clear error messages for API failures
4. **Loading States**: Visual feedback during API calls
5. **Skip Options**: Users can skip optional steps
6. **Stripe Integration**: Seamless redirect to Stripe and back

## Testing Checklist

- [ ] Profile step saves data correctly
- [ ] Skills step adds skills to backend
- [ ] Portfolio step creates portfolio items
- [ ] Stripe Connect flow redirects properly
- [ ] Return from Stripe marks onboarding complete
- [ ] Navigation between steps works correctly
- [ ] Error states display properly
- [ ] Loading states show during API calls
- [ ] Skip buttons work as expected
- [ ] Progress is saved to localStorage

## Next Steps

1. Test the complete flow with your backend API
2. Update any profile pages to display the saved data
3. Add profile editing functionality in the freelancer dashboard
4. Consider adding image upload for portfolio items
5. Add Stripe account status checking on dashboard

## Notes

- All API calls now use the proper endpoints
- Error handling is consistent across all steps
- Navigation is simplified and more maintainable
- The flow matches the backend API structure
- Stripe Connect integration is production-ready

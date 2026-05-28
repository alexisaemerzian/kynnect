# Ethnicity Data System - Implementation Guide

## Overview
The app now displays **ethnicity-specific events, places, and users** based on the selected community. When a user selects Greek, they see Greek events in Greek neighborhoods. When they select Korean, they see Korean BBQ nights and K-Pop events.

## How It Works

### Data Structure
All ethnicity-specific data is in `/src/app/data/ethnicMockData.ts`:

```typescript
// Armenian Data
export const armenianEvents: Event[] = [...];
export const armenianUsers: User[] = [...];
export const armenianPlaces: Place[] = [...];

// Greek Data
export const greekEvents: Event[] = [...];
export const greekUsers: User[] = [...];
export const greekPlaces: Place[] = [...];

// ... and so on for 9 ethnicities
```

### Data Access Helper
The file `/src/app/data/getEthnicityData.ts` provides:

```typescript
// Get all data for an ethnicity
const data = getEthnicityData('greek');
// Returns: { events: [...], users: [...], places: [...] }

// Get current user for an ethnicity
const user = getCurrentUser('greek');
// Returns the first user from that ethnicity's user array
```

### Pages Using Ethnicity Data

#### 1. **HomePage** (`/src/app/pages/HomePage.tsx`)
- Loads events using `getEthnicityData(selectedEthnicity?.id)`
- Filters events by city search
- Shows "Happening Now" vs "This Week" based on event dates
- **Example**: Greek users see "Taverna Night" and "Greek Easter BBQ"

#### 2. **PlacesPage** (`/src/app/pages/PlacesPage.tsx`)
- Loads places using `getEthnicityData(selectedEthnicity?.id)`
- Filters by type (restaurants, cafes, churches, shops)
- Groups by city
- **Example**: Korean users see H Mart, Kang Ho-Dong Baekjeong, and Korean churches

#### 3. **ProfilePage** (`/src/app/pages/ProfilePage.tsx`)
- Loads user data using `getCurrentUser(selectedEthnicity?.id)`
- Shows events hosted and attended by that ethnicity's users
- **Example**: Italian user profile shows "Giovanni Romano from Brooklyn"

#### 4. **EventDetailsPage** (`/src/app/pages/EventDetailsPage.tsx`)
- Finds specific event from ethnicity data by ID
- Shows RSVP functionality
- **Example**: Event ID 'gr2' is "Greek Easter BBQ - Souvlaki & Lamb"

## Currently Available Ethnicity Data

### ✅ **Fully Implemented** (with custom events, users, places):
1. **Armenian** - Glendale, CA focus
2. **Greek** - Astoria, NY focus
3. **Italian** - Brooklyn/NYC focus
4. **Mexican** - Los Angeles, CA focus
5. **Irish** - Boston, MA focus
6. **Korean** - Koreatown LA focus
7. **Filipino** - Daly City, CA focus
8. **Polish** - Chicago, IL focus
9. **Lebanese** - Dearborn, MI focus

### ⚠️ **Using Default Data** (temporarily using Armenian data):
- Jewish
- Nigerian
- Chinese
- Indian
- Brazilian
- Persian

These ethnicities show in onboarding and have their own branding (flag, greeting, etc.) but temporarily display Armenian events until custom data is added.

## Adding Custom Data for New Ethnicities

### Step 1: Add Events
In `/src/app/data/ethnicMockData.ts`, add:

```typescript
export const jewishEvents: Event[] = [
  {
    id: 'jw1',
    title: 'Shabbat Dinner & Prayer',
    date: 'Friday at 6:00 PM',
    location: 'Brooklyn, NY',
    address: '123 Ocean Pkwy, Brooklyn, NY 11230',
    imageUrl: 'https://images.unsplash.com/photo-...',
    type: 'curated',
    attendees: 35,
    host: {
      id: 'jw1',
      name: 'David Cohen',
      avatar: 'https://images.unsplash.com/photo-...',
    },
    description: 'Traditional Shabbat dinner with prayers and community!',
    showAddress: true,
  },
  // ... more events
];
```

### Step 2: Add Users
```typescript
export const jewishUsers: User[] = [
  {
    id: 'jw1',
    name: 'David Cohen',
    avatar: 'https://images.unsplash.com/photo-...',
    city: 'Brooklyn, NY',
    bio: 'From Tel Aviv, living in Brooklyn. Love hosting Shabbat dinners. Shalom! 🇮🇱',
    eventsHosted: 18,
    eventsAttended: 42,
  },
];
```

### Step 3: Add Places
```typescript
export const jewishPlaces: Place[] = [
  { 
    id: 'jw1', 
    name: 'Kosher Delight', 
    type: 'restaurant', 
    city: 'Brooklyn, NY', 
    address: '1305 Broadway, Brooklyn, NY', 
    cuisine: 'Kosher', 
    description: 'Authentic kosher cuisine', 
    imageUrl: 'https://images.unsplash.com/photo-...',
    rating: 4.7 
  },
  // ... more places
];
```

### Step 4: Register in Data Helper
In `/src/app/data/getEthnicityData.ts`, import and add:

```typescript
import {
  // ... existing imports
  jewishEvents,
  jewishUsers,
  jewishPlaces,
} from './ethnicMockData';

export function getEthnicityData(ethnicityId: string): EthnicityData {
  const dataMap: Record<string, EthnicityData> = {
    // ... existing entries
    jewish: {
      events: jewishEvents,
      users: jewishUsers,
      places: jewishPlaces,
    },
  };
  
  return dataMap[ethnicityId] || dataMap.armenian;
}
```

That's it! The app will automatically display the custom data when Jewish ethnicity is selected.

## Data Validation Checklist

When adding new ethnicity data, ensure:

### Events
- [ ] Unique IDs (use ethnicity prefix, e.g., 'jw1', 'jw2')
- [ ] Culturally relevant titles and descriptions
- [ ] Real cities where that diaspora exists
- [ ] Mix of 'curated' and 'spontaneous' types
- [ ] Host IDs match user IDs
- [ ] Appropriate event images from Unsplash
- [ ] Date format: "Tonight at 8:00 PM" or "Sat, Mar 27 at 9:00 PM"

### Users
- [ ] Unique IDs matching event hosts
- [ ] Names typical of that ethnicity
- [ ] Cities where diaspora communities exist
- [ ] Bio includes greeting in native language
- [ ] Bio includes flag emoji
- [ ] Realistic event counts

### Places
- [ ] Unique IDs with ethnicity prefix
- [ ] Real or realistic business names
- [ ] Accurate cities (use actual diaspora hubs)
- [ ] Appropriate types: restaurant, cafe, church/temple/mosque, bakery, shop
- [ ] Cuisine field matches ethnicity
- [ ] Ratings between 4.5-4.9 for realism

## Testing Your Data

1. **Clear localStorage**: Open DevTools → Application → Local Storage → Delete 'selectedEthnicity'
2. **Refresh app**: You'll see onboarding screen
3. **Select your ethnicity**: Choose the one you added data for
4. **Verify**:
   - HomePage shows your events
   - PlacesPage shows your places
   - Profile shows correct user
   - Event details load properly

## Event ID Naming Convention

To avoid collisions between ethnicities, use prefixes:

| Ethnicity | Prefix | Example |
|-----------|--------|---------|
| Armenian | 1, 2, 3... | '1', '2', '3' |
| Greek | gr | 'gr1', 'gr2', 'gr3' |
| Italian | it | 'it1', 'it2', 'it3' |
| Mexican | mx | 'mx1', 'mx2', 'mx3' |
| Irish | ie | 'ie1', 'ie2', 'ie3' |
| Korean | kr | 'kr1', 'kr2', 'kr3' |
| Filipino | ph | 'ph1', 'ph2', 'ph3' |
| Polish | pl | 'pl1', 'pl2', 'pl3' |
| Lebanese | lb | 'lb1', 'lb2', 'lb3' |
| Jewish | jw | 'jw1', 'jw2', 'jw3' |
| Nigerian | ng | 'ng1', 'ng2', 'ng3' |
| Chinese | cn | 'cn1', 'cn2', 'cn3' |
| Indian | in | 'in1', 'in2', 'in3' |
| Brazilian | br | 'br1', 'br2', 'br3' |
| Persian | ir | 'ir1', 'ir2', 'ir3' |

## Where Data Is NOT Affected

These parts of the app remain ethnicity-agnostic:

- **Messages/Conversations**: Uses global `mockConversations` from `mockData.ts`
- **Create Event Page**: Works the same for all ethnicities
- **Login Page**: Universal
- **Settings Page**: Shows all ethnicities

## Future Enhancements

### 1. **Cross-Ethnicity Events**
Allow events to be tagged for multiple ethnicities:
```typescript
ethnicities: ['greek', 'italian', 'lebanese']
```

### 2. **City-Based Recommendations**
When user searches for a city, show events from ALL ethnicities in that city

### 3. **Backend Integration**
Replace mock data with real database queries:
```typescript
const events = await fetchEvents({ ethnicityId, city });
```

### 4. **User-Generated Content**
Allow users to add places and events for their ethnicity

### 5. **Ethnicity-Specific Ads**
Show culturally relevant ads:
```typescript
<NativeAd ethnicityId={selectedEthnicity?.id} />
```

---

**The beauty of this system**: Adding a new ethnicity requires ZERO code changes to pages/components. Just add data to `ethnicMockData.ts` and register it in the helper. The entire app adapts automatically! 🌍

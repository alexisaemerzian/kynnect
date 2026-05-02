# Multi-Ethnicity Community Platform

## Overview
The app has been transformed from an Armenian-only community platform (HYE) to a **universal platform supporting 15+ ethnic communities worldwide**. Users select their ethnicity on first launch, and the entire app dynamically adapts to their community.

## How It Works

### 1. **Onboarding Flow**
When users first open the app, they see an onboarding screen where they select their ethnicity:
- **15+ ethnicities available**: Armenian, Greek, Italian, Mexican, Irish, Polish, Lebanese, Korean, Jewish, Filipino, Nigerian, Chinese, Indian, Brazilian, Persian, and more
- Beautiful grid interface with flags and native greetings
- Search functionality to quickly find their community
- Once selected, the choice is saved in localStorage

### 2. **Dynamic App Configuration**
Each ethnicity has its own configuration in `/src/app/config/ethnicities.ts`:

```typescript
{
  id: 'armenian',
  name: 'Armenian',
  displayName: 'HYE',              // App name for this community
  flag: '🇦🇲',                      // National flag emoji
  primaryColor: '#9333EA',         // Purple
  secondaryColor: '#F97316',       // Orange
  tagline: 'A private network for Armenians to connect in real life',
  greeting: 'Բարև',                // Hello in Armenian
  greetingTranslation: 'Hello',
  placesTitle: 'Armenian Places',
  placesDescription: 'Find Armenian-owned businesses & churches',
}
```

### 3. **Context-Based System**
The `EthnicityContext` provides global access to:
- Selected ethnicity configuration
- Function to change ethnicity
- Onboarding state

```typescript
const { selectedEthnicity, setEthnicity, isOnboarding } = useEthnicity();
```

### 4. **Dynamic UI Elements**

#### HomePage
- **App name**: Changes to community-specific name (HYE, ELLINAS, PAESANO, etc.)
- **Flag**: Displays the ethnicity's flag emoji
- **Greeting**: Shows native language greeting
- **Tagline**: Community-specific tagline

#### PlacesPage
- **Title**: "Armenian Places", "Greek Places", "Korean Places", etc.
- **Description**: Culturally relevant description
- Events and places are shown for all cities worldwide

#### ProfilePage
- **Share button**: "Share HYE" → "Share ELLINAS" etc.
- **Description**: "Invite other Armenians" → "Invite other Greeks" etc.

### 5. **Settings**
Users can change their community at any time:
- Navigate to Profile → Settings (gear icon)
- Browse all available ethnicities
- Select a new community
- App reloads with new configuration

## Supported Ethnicities

| Ethnicity | Display Name | Flag | Primary Color | Greeting |
|-----------|--------------|------|---------------|----------|
| Armenian | HYE | 🇦🇲 | Purple | Բարև |
| Greek | ELLINAS | 🇬🇷 | Blue | Γεια σου |
| Italian | PAESANO | 🇮🇹 | Green | Ciao |
| Mexican | RAZA | 🇲🇽 | Green | Hola |
| Irish | CRAIC | 🇮🇪 | Green | Dia dhuit |
| Polish | POLAK | 🇵🇱 | Red | Cześć |
| Lebanese | LEBNAN | 🇱🇧 | Red | Marhaba |
| Korean | HAN | 🇰🇷 | Red | 안녕 |
| Jewish | MISHPACHA | 🇮🇱 | Blue | Shalom |
| Filipino | KABAYAN | 🇵🇭 | Blue | Kumusta |
| Nigerian | NAIJA | 🇳🇬 | Green | Bawo ni |
| Chinese | HUAREN | 🇨🇳 | Red | 你好 |
| Indian | DESI | 🇮🇳 | Saffron | Namaste |
| Brazilian | BRASIL | 🇧🇷 | Green | Oi |
| Persian | IRANI | 🇮🇷 | Green | Salam |

## Adding New Ethnicities

### Step 1: Add Configuration
Edit `/src/app/config/ethnicities.ts` and add a new entry:

```typescript
{
  id: 'japanese',
  name: 'Japanese',
  displayName: 'NAKAMA',
  flag: '🇯🇵',
  primaryColor: '#BC002D',
  secondaryColor: '#FFFFFF',
  tagline: 'A private network for Japanese to connect in real life',
  greeting: 'こんにちは',
  greetingTranslation: 'Hello',
  placesTitle: 'Japanese Places',
  placesDescription: 'Find Japanese restaurants, cultural centers & shops',
}
```

### Step 2: That's It!
The app automatically:
- Shows the new ethnicity in onboarding
- Applies the configuration when selected
- Updates all UI elements dynamically

## Global City Support

The app supports **any city, anywhere in the world**:
- Users can search events by city
- Places directory is organized by city
- No restrictions on locations
- Perfect for:
  - Travelers meeting their community abroad
  - Diaspora communities in any country
  - International networking
  - Cultural events worldwide

## Use Cases

### 1. **Traveling**
Greek user traveling to Tokyo? Switch to Tokyo in the search, find Greek events and restaurants.

### 2. **Diaspora Communities**
Lebanese community in São Paulo? Create events and discover places right in your city.

### 3. **Cultural Exchange**
Users can see how different ethnicities organize events and gather in different cities.

### 4. **Multi-Ethnic Families**
Person with Armenian-Lebanese heritage? Switch between communities as needed.

## Technical Architecture

```
App.tsx
  └── EthnicityProvider (Context)
        ├── OnboardingPage (shown if no ethnicity selected)
        └── RouterProvider (main app)
              ├── HomePage (uses selectedEthnicity)
              ├── PlacesPage (uses selectedEthnicity)
              ├── ProfilePage (uses selectedEthnicity)
              └── SettingsPage (allows changing ethnicity)
```

## Data Storage

- **Ethnicity selection**: Stored in `localStorage` with key `selectedEthnicity`
- **Persistence**: Selection persists across page reloads
- **Privacy**: All data stays on user's device (no backend needed for selection)

## Future Enhancements

### 1. **Multi-Community Events**
Allow events to be tagged for multiple ethnicities (e.g., "Greek-Armenian Cultural Night")

### 2. **Cross-Community Discovery**
Optional feature to see events from other communities in your city

### 3. **Custom Colors**
Use the `primaryColor` and `secondaryColor` to theme the entire app per ethnicity

### 4. **Language Support**
Translate entire UI to native language based on ethnicity

### 5. **Community-Specific Features**
- Religious calendars (e.g., Ramadan for Lebanese, Passover for Jewish)
- Cultural holidays
- Community-specific place types (e.g., Halal restaurants, Kosher delis)

### 6. **Analytics**
- Track which ethnicities have the most users
- Geographic distribution of communities
- Most active cities per ethnicity

## Developer Notes

### Adding New Dynamic Fields
To make a new field dynamic based on ethnicity:

1. Add the field to `EthnicityConfig` type
2. Add values for all ethnicities in the array
3. Use in components via `selectedEthnicity?.yourNewField`

Example:
```typescript
// In config/ethnicities.ts
export interface EthnicityConfig {
  // ... existing fields
  customMessage: string;
}

// In any component
const { selectedEthnicity } = useEthnicity();
<p>{selectedEthnicity?.customMessage}</p>
```

### Testing Different Ethnicities
1. Open browser DevTools
2. Go to Application → Local Storage
3. Delete `selectedEthnicity` key
4. Refresh the page
5. Select a different ethnicity on onboarding

## Vision

**"Connect every diaspora community worldwide"**

This platform enables any ethnic group to have their own private network for:
- Finding events in any city
- Discovering cultural businesses
- Meeting people from their community while traveling
- Maintaining cultural connections across borders

Whether you're Armenian in Glendale, Greek in Melbourne, Korean in London, or Nigerian in Houston - your community is just a tap away.

---

**Built to unite communities, one ethnicity at a time.** 🌍

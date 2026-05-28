# 🌍 Community Names for Each Ethnicity

## What Users See

When users select their ethnicity during onboarding, the app transforms to show their **community-specific branding**:

---

## Community Names By Ethnicity

| Flag | Ethnicity | Community Name | Meaning | Greeting |
|------|-----------|----------------|---------|----------|
| 🇦🇲 | **Armenian** | **HYE** | "Armenian" in Armenian | Բարև (Hello) |
| 🇬🇷 | **Greek** | **ELLINAS** | "Greek" in Greek | Γεια σου (Hello) |
| 🇮🇹 | **Italian** | **PAESANO** | "Countryman/Fellow Italian" | Ciao (Hello) |
| 🇲🇽 | **Mexican** | **RAZA** | "The People/The Race" | Hola (Hello) |
| 🇮🇪 | **Irish** | **CRAIC** | "Fun/Good Times" (Irish slang) | Dia dhuit (Hello) |
| 🇵🇱 | **Polish** | **POLAK** | "Polish Person" | Cześć (Hello) |
| 🇱🇧 | **Lebanese** | **LEBNAN** | "Lebanon" in Arabic | Marhaba (Hello) |
| 🇰🇷 | **Korean** | **HAN** | "Korean People" | 안녕 (Hello) |
| 🇮🇱 | **Jewish** | **MISHPACHA** | "Family" in Hebrew | Shalom (Hello) |
| 🇵🇭 | **Filipino** | **KABAYAN** | "Countryman/Fellow Filipino" | Kumusta (Hello) |
| 🇳🇬 | **Nigerian** | **NAIJA** | Nigerian slang for Nigeria | Bawo ni (Hello) |
| 🇨🇳 | **Chinese** | **HUAREN** | "Chinese Person/People" | 你好 (Hello) |
| 🇮🇳 | **Indian** | **DESI** | "Person from South Asia" | Namaste (Hello) |
| 🇧🇷 | **Brazilian** | **BRASIL** | "Brazil" in Portuguese | Oi (Hello) |
| 🇮🇷 | **Persian** | **IRANI** | "Iranian/Persian Person" | Salam (Hello) |

---

## Example User Experience

### Armenian User Sees:
```
🇦🇲 HYE
Բարև (Hello)

Events:
- Armenian Wine Tasting at Ararat Winery
- Dolma Making Class & Dinner
- System of a Down Tribute Night
```

### Nigerian User Sees:
```
🇳🇬 NAIJA  
Bawo ni (Hello)

Events:
- Jollof Rice Cook-Off - Naija vs Ghana
- Afrobeats Dance Party - Burna Boy Night
- Nigerian Independence Day Celebration
```

### Chinese User Sees:
```
🇨🇳 HUAREN
你好 (Hello)

Events:
- Hot Pot Night - Sichuan Style
- Lunar New Year Celebration - Year of the Dragon
- Mahjong Tournament & Dim Sum
```

### Jewish User Sees:
```
🇮🇱 MISHPACHA
Shalom (Hello)

Events:
- Shabbat Dinner - Homemade Challah
- Purim Carnival & Megillah Reading
- Israeli Dancing & Falafel Night
```

### Indian User Sees:
```
🇮🇳 DESI
Namaste (Hello)

Events:
- Desi House Party - Bollywood Night
- Diwali Festival of Lights Celebration
- Cricket Watch Party - India vs Pakistan
```

### Brazilian User Sees:
```
🇧🇷 BRASIL
Oi (Hello)

Events:
- Feijoada Sunday - Brazilian BBQ
- Carnaval Block Party - Samba All Night
- Brazilian Football Watch Party - Seleção
```

---

## Key Features

### 🎨 Visual Branding Changes
- **Logo:** Displays the ethnicity's flag emoji
- **Community Name:** Shows in large letters at top
- **Color Scheme:** Adapts to flag colors
  - Armenian: Purple & Orange
  - Nigerian: Green & White
  - Chinese: Red & Gold
  - Indian: Saffron & Green
  - Brazilian: Green & Yellow
  - Persian: Green & Red
  - And so on...

### 📱 App Header Example

**For Armenian Users:**
```
┌─────────────────────────────┐
│  🇦🇲 HYE                     │
│  Բարև                       │
│  A private network for      │
│  Armenians to connect in    │
│  real life                  │
└─────────────────────────────┘
```

**For Nigerian Users:**
```
┌─────────────────────────────┐
│  🇳🇬 NAIJA                   │
│  Bawo ni                    │
│  A private network for      │
│  Nigerians to connect in    │
│  real life                  │
└─────────────────────────────┘
```

**For Chinese Users:**
```
┌─────────────────────────────┐
│  🇨🇳 HUAREN                  │
│  你好                        │
│  A private network for      │
│  Chinese to connect in      │
│  real life                  │
└─────────────────────────────┘
```

---

## Cultural Authenticity

Each community name was chosen to:
1. **Resonate with the community** - Uses terms they actually call themselves
2. **Be memorable** - Short, punchy, easy to remember
3. **Sound authentic** - Not generic or corporate
4. **Create belonging** - Makes users feel "this is for MY people"

### Examples:
- **"RAZA"** (Mexican) - Commonly used in Mexican-American communities
- **"CRAIC"** (Irish) - Irish slang everyone knows
- **"NAIJA"** (Nigerian) - How Nigerians proudly refer to Nigeria
- **"DESI"** (Indian) - What South Asians call themselves
- **"MISHPACHA"** (Jewish) - Hebrew for family, emphasizes community
- **"KABAYAN"** (Filipino) - Term of endearment for fellow Filipinos

---

## Implementation

All community names are defined in:
```typescript
// /src/app/config/ethnicities.ts

export interface EthnicityConfig {
  id: string;
  name: string;           // "Armenian"
  displayName: string;    // "HYE" ← This is what users see!
  flag: string;           // "🇦🇲"
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  greeting: string;       // Native language
  greetingTranslation: string;
  placesTitle: string;
  placesDescription: string;
}
```

The app automatically uses `displayName` wherever the community name needs to be shown, making each ethnicity feel like **their own app**! 🎉

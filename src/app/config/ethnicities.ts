export interface EthnicityConfig {
  id: string;
  name: string;
  displayName: string;
  flag: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  greeting: string;
  greetingTranslation: string;
  placesTitle: string;
  placesDescription: string;
}

export const ethnicities: EthnicityConfig[] = [
  {
    id: 'armenian',
    name: 'Armenian',
    displayName: 'HYE',
    flag: '🇦🇲',
    primaryColor: '#9333EA', // purple
    secondaryColor: '#F97316', // orange
    tagline: 'A private network for Armenians to connect in real life',
    greeting: 'Բարև',
    greetingTranslation: 'Hello',
    placesTitle: 'Armenian Places',
    placesDescription: 'Find Armenian-owned businesses & churches',
  },
  {
    id: 'greek',
    name: 'Greek',
    displayName: 'ELLINAS',
    flag: '🇬🇷',
    primaryColor: '#0066CC', // blue
    secondaryColor: '#FFFFFF', // white
    tagline: 'A private network for Greeks to connect in real life',
    greeting: 'Γεια σου',
    greetingTranslation: 'Hello',
    placesTitle: 'Greek Places',
    placesDescription: 'Find Greek-owned businesses & churches',
  },
  {
    id: 'italian',
    name: 'Italian',
    displayName: 'PAESANO',
    flag: '🇮🇹',
    primaryColor: '#009246', // green
    secondaryColor: '#CE2B37', // red
    tagline: 'A private network for Italians to connect in real life',
    greeting: 'Ciao',
    greetingTranslation: 'Hello',
    placesTitle: 'Italian Places',
    placesDescription: 'Find Italian-owned businesses & churches',
  },
  {
    id: 'mexican',
    name: 'Mexican',
    displayName: 'RAZA',
    flag: '🇲🇽',
    primaryColor: '#006847', // green
    secondaryColor: '#CE1126', // red
    tagline: 'A private network for Mexicans to connect in real life',
    greeting: 'Hola',
    greetingTranslation: 'Hello',
    placesTitle: 'Mexican Places',
    placesDescription: 'Find Mexican-owned businesses & cultural sites',
  },
  {
    id: 'irish',
    name: 'Irish',
    displayName: 'CRAIC',
    flag: '🇮🇪',
    primaryColor: '#169B62', // green
    secondaryColor: '#FF883E', // orange
    tagline: 'A private network for Irish to connect in real life',
    greeting: 'Dia dhuit',
    greetingTranslation: 'Hello',
    placesTitle: 'Irish Places',
    placesDescription: 'Find Irish pubs, cultural centers & churches',
  },
  {
    id: 'polish',
    name: 'Polish',
    displayName: 'POLAK',
    flag: '🇵🇱',
    primaryColor: '#DC143C', // red
    secondaryColor: '#FFFFFF', // white
    tagline: 'A private network for Polish to connect in real life',
    greeting: 'Cześć',
    greetingTranslation: 'Hello',
    placesTitle: 'Polish Places',
    placesDescription: 'Find Polish-owned businesses & churches',
  },
  {
    id: 'lebanese',
    name: 'Lebanese',
    displayName: 'LEBNAN',
    flag: '🇱🇧',
    primaryColor: '#ED1C24', // red
    secondaryColor: '#00A651', // green
    tagline: 'A private network for Lebanese to connect in real life',
    greeting: 'Marhaba',
    greetingTranslation: 'Hello',
    placesTitle: 'Lebanese Places',
    placesDescription: 'Find Lebanese restaurants, cafes & cultural sites',
  },
  {
    id: 'korean',
    name: 'Korean',
    displayName: 'HAN',
    flag: '🇰🇷',
    primaryColor: '#C60C30', // red
    secondaryColor: '#003478', // blue
    tagline: 'A private network for Koreans to connect in real life',
    greeting: '안녕',
    greetingTranslation: 'Hello',
    placesTitle: 'Korean Places',
    placesDescription: 'Find Korean restaurants, cafes & cultural sites',
  },
  {
    id: 'jewish',
    name: 'Jewish',
    displayName: 'MISHPACHA',
    flag: '🇮🇱',
    primaryColor: '#0038B8', // blue
    secondaryColor: '#FFFFFF', // white
    tagline: 'A private network for Jewish community to connect in real life',
    greeting: 'Shalom',
    greetingTranslation: 'Hello',
    placesTitle: 'Jewish Places',
    placesDescription: 'Find synagogues, kosher restaurants & cultural sites',
  },
  {
    id: 'filipino',
    name: 'Filipino',
    displayName: 'KABAYAN',
    flag: '🇵🇭',
    primaryColor: '#0038A8', // blue
    secondaryColor: '#CE1126', // red
    tagline: 'A private network for Filipinos to connect in real life',
    greeting: 'Kumusta',
    greetingTranslation: 'Hello',
    placesTitle: 'Filipino Places',
    placesDescription: 'Find Filipino restaurants, stores & cultural sites',
  },
  {
    id: 'nigerian',
    name: 'Nigerian',
    displayName: 'NAIJA',
    flag: '🇳🇬',
    primaryColor: '#008751', // green
    secondaryColor: '#FFFFFF', // white
    tagline: 'A private network for Nigerians to connect in real life',
    greeting: 'Bawo ni',
    greetingTranslation: 'Hello',
    placesTitle: 'Nigerian Places',
    placesDescription: 'Find Nigerian restaurants, stores & cultural sites',
  },
  {
    id: 'chinese',
    name: 'Chinese',
    displayName: 'HUAREN',
    flag: '🇨🇳',
    primaryColor: '#DE2910', // red
    secondaryColor: '#FFDE00', // gold
    tagline: 'A private network for Chinese to connect in real life',
    greeting: '你好',
    greetingTranslation: 'Hello',
    placesTitle: 'Chinese Places',
    placesDescription: 'Find Chinese restaurants, shops & cultural sites',
  },
  {
    id: 'indian',
    name: 'Indian',
    displayName: 'DESI',
    flag: '🇮🇳',
    primaryColor: '#FF9933', // saffron
    secondaryColor: '#138808', // green
    tagline: 'A private network for Indians to connect in real life',
    greeting: 'Namaste',
    greetingTranslation: 'Hello',
    placesTitle: 'Indian Places',
    placesDescription: 'Find Indian restaurants, temples & cultural sites',
  },
  {
    id: 'brazilian',
    name: 'Brazilian',
    displayName: 'BRASIL',
    flag: '🇧🇷',
    primaryColor: '#009C3B', // green
    secondaryColor: '#FFDF00', // yellow
    tagline: 'A private network for Brazilians to connect in real life',
    greeting: 'Oi',
    greetingTranslation: 'Hello',
    placesTitle: 'Brazilian Places',
    placesDescription: 'Find Brazilian restaurants, shops & cultural sites',
  },
  {
    id: 'persian',
    name: 'Persian',
    displayName: 'IRANI',
    flag: '🇮🇷',
    primaryColor: '#239F40', // green
    secondaryColor: '#DA0000', // red
    tagline: 'A private network for Persians to connect in real life',
    greeting: 'Salam',
    greetingTranslation: 'Hello',
    placesTitle: 'Persian Places',
    placesDescription: 'Find Persian restaurants, cafes & cultural sites',
  },
];

export function getEthnicityConfig(ethnicityId: string): EthnicityConfig {
  return ethnicities.find(e => e.id === ethnicityId) || ethnicities[0];
}

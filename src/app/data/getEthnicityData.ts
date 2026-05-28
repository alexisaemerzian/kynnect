import { Event, User, Place } from '../types';
import {
  armenianEvents,
  armenianUsers,
  armenianPlaces,
  greekEvents,
  greekUsers,
  greekPlaces,
  italianEvents,
  italianUsers,
  italianPlaces,
  mexicanEvents,
  mexicanUsers,
  mexicanPlaces,
  irishEvents,
  irishUsers,
  irishPlaces,
  koreanEvents,
  koreanUsers,
  koreanPlaces,
  filipinoEvents,
  filipinoUsers,
  filipinoPlaces,
  polishEvents,
  polishUsers,
  polishPlaces,
  lebaneseEvents,
  lebaneseUsers,
  lebanesePlaces,
  jewishEvents,
  jewishUsers,
  jewishPlaces,
  nigerianEvents,
  nigerianUsers,
  nigerianPlaces,
  chineseEvents,
  chineseUsers,
  chinesePlaces,
  indianEvents,
  indianUsers,
  indianPlaces,
  brazilianEvents,
  brazilianUsers,
  brazilianPlaces,
  persianEvents,
  persianUsers,
  persianPlaces,
} from './ethnicMockData';

interface EthnicityData {
  events: Event[];
  users: User[];
  places: Place[];
}

export function getEthnicityData(ethnicityId: string): EthnicityData {
  const dataMap: Record<string, EthnicityData> = {
    armenian: {
      events: armenianEvents,
      users: armenianUsers,
      places: armenianPlaces,
    },
    greek: {
      events: greekEvents,
      users: greekUsers,
      places: greekPlaces,
    },
    italian: {
      events: italianEvents,
      users: italianUsers,
      places: italianPlaces,
    },
    mexican: {
      events: mexicanEvents,
      users: mexicanUsers,
      places: mexicanPlaces,
    },
    irish: {
      events: irishEvents,
      users: irishUsers,
      places: irishPlaces,
    },
    korean: {
      events: koreanEvents,
      users: koreanUsers,
      places: koreanPlaces,
    },
    filipino: {
      events: filipinoEvents,
      users: filipinoUsers,
      places: filipinoPlaces,
    },
    polish: {
      events: polishEvents,
      users: polishUsers,
      places: polishPlaces,
    },
    lebanese: {
      events: lebaneseEvents,
      users: lebaneseUsers,
      places: lebanesePlaces,
    },
    jewish: {
      events: jewishEvents,
      users: jewishUsers,
      places: jewishPlaces,
    },
    nigerian: {
      events: nigerianEvents,
      users: nigerianUsers,
      places: nigerianPlaces,
    },
    chinese: {
      events: chineseEvents,
      users: chineseUsers,
      places: chinesePlaces,
    },
    indian: {
      events: indianEvents,
      users: indianUsers,
      places: indianPlaces,
    },
    brazilian: {
      events: brazilianEvents,
      users: brazilianUsers,
      places: brazilianPlaces,
    },
    persian: {
      events: persianEvents,
      users: persianUsers,
      places: persianPlaces,
    },
  };

  return dataMap[ethnicityId] || dataMap.armenian;
}

// Helper to get current user based on ethnicity
export function getCurrentUser(ethnicityId: string): User {
  const data = getEthnicityData(ethnicityId);
  return data.users[0]; // Return first user as current user
}

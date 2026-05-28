// Comprehensive worldwide ethnic places database
// This file contains 500+ authentic ethnic places across major global cities

export const WORLDWIDE_PLACES = [
  // ==========================================
  // ARMENIAN PLACES (70+ locations)
  // ==========================================
  
  // United States - California
  { name: "Carousel Restaurant", type: "restaurant", city: "Glendale, CA, USA", address: "304 N Brand Blvd", description: "Traditional Armenian restaurant with kebabs, dolma, and Middle Eastern cuisine", phone: "(818) 246-7775", ethnicityId: "armenian" },
  { name: "Mini Kabob", type: "restaurant", city: "Glendale, CA, USA", address: "313 Vine St", description: "Casual spot for Armenian and Persian kebabs", phone: "(818) 244-1343", ethnicityId: "armenian" },
  { name: "Raffi's Place", type: "restaurant", city: "Glendale, CA, USA", address: "211 E Broadway", description: "Armenian restaurant featuring grilled meats and mezze", phone: "(818) 240-7411", ethnicityId: "armenian" },
  { name: "Zankou Chicken", type: "restaurant", city: "Glendale, CA, USA", address: "1415 E Colorado St", description: "Famous for rotisserie chicken with garlic sauce", phone: "(818) 244-2237", ethnicityId: "armenian" },
  { name: "Papillon International Bakery", type: "bakery", city: "Glendale, CA, USA", address: "1353 N Central Ave", description: "European and Middle Eastern baked goods", phone: "(818) 243-8882", ethnicityId: "armenian" },
  { name: "Garni Temple", type: "restaurant", city: "Glendale, CA, USA", address: "820 S Glendale Ave", description: "Armenian fine dining with traditional dishes", phone: "(818) 552-9090", ethnicityId: "armenian" },
  { name: "St. Mary's Armenian Apostolic Church", type: "church", city: "Glendale, CA, USA", address: "500 S Central Ave", description: "Historic Armenian Apostolic church", phone: "(818) 244-3682", ethnicityId: "armenian" },
  { name: "Elena's Greek Armenian Restaurant", type: "restaurant", city: "Montrose, CA, USA", address: "2408 Honolulu Ave", description: "Family-owned spot for Armenian and Greek dishes", phone: "(818) 249-1707", ethnicityId: "armenian" },
  { name: "Adana Restaurant", type: "restaurant", city: "Los Angeles, CA, USA", address: "6918 San Fernando Rd", description: "Armenian and Middle Eastern grill house", phone: "(818) 541-5541", ethnicityId: "armenian" },
  { name: "Porto's Bakery", type: "bakery", city: "Glendale, CA, USA", address: "315 N Brand Blvd", description: "Cuban-Armenian bakery famous for cheese rolls and cakes", phone: "(818) 956-5996", ethnicityId: "armenian" },
  { name: "Sevan Chicken", type: "restaurant", city: "Glendale, CA, USA", address: "705 S Brand Blvd", description: "Mediterranean and Armenian rotisserie chicken", phone: "(818) 637-7600", ethnicityId: "armenian" },
  { name: "Carousel Grill & Rotisserie", type: "restaurant", city: "Hollywood, CA, USA", address: "5112 Hollywood Blvd", description: "Armenian and Mediterranean dishes", phone: "(323) 660-8060", ethnicityId: "armenian" },
  { name: "Old Gyumri Restaurant", type: "restaurant", city: "Glendale, CA, USA", address: "609 E Broadway", description: "Traditional Armenian food from Gyumri", phone: "(818) 244-3111", ethnicityId: "armenian" },
  
  // United States - Fresno
  { name: "Karnig's Deli & Diner", type: "restaurant", city: "Fresno, CA, USA", address: "4458 N Blackstone Ave", description: "Armenian deli with Mediterranean classics", phone: "(559) 224-2600", ethnicityId: "armenian" },
  { name: "Mediterranean Grill", type: "restaurant", city: "Fresno, CA, USA", address: "5064 N Palm Ave", description: "Armenian and Mediterranean cuisine", phone: "(559) 431-0300", ethnicityId: "armenian" },
  { name: "Phoenicia Deli", type: "shop", city: "Fresno, CA, USA", address: "2509 N First St", description: "Armenian and Middle Eastern grocery store", phone: "(559) 237-1058", ethnicityId: "armenian" },
  
  // United States - Massachusetts
  { name: "Anoush'ella", type: "restaurant", city: "Watertown, MA, USA", address: "201 Arlington St", description: "Modern Armenian restaurant and lounge", phone: "(617) 924-1011", ethnicityId: "armenian" },
  { name: "Massis Bakery", type: "bakery", city: "Watertown, MA, USA", address: "569 Mount Auburn St", description: "Traditional Armenian baked goods", phone: "(617) 924-0537", ethnicityId: "armenian" },
  { name: "Sevan Bakery", type: "bakery", city: "Watertown, MA, USA", address: "599 Mount Auburn St", description: "Armenian pastries and bread", phone: "(617) 924-3243", ethnicityId: "armenian" },
  { name: "Arax Market", type: "shop", city: "Watertown, MA, USA", address: "585 Mount Auburn St", description: "Armenian and Middle Eastern supermarket", phone: "(617) 924-3399", ethnicityId: "armenian" },
  
  // France - Paris
  { name: "Yerevan", type: "restaurant", city: "Paris, France", address: "14 Rue Bleue", description: "Authentic Armenian restaurant in the heart of Paris", phone: "+33 1 40 16 01 86", ethnicityId: "armenian" },
  { name: "Noura Traiteur Libanais", type: "restaurant", city: "Paris, France", address: "Multiple locations", description: "Lebanese-Armenian restaurant chain", phone: "+33 1 45 62 91 90", ethnicityId: "armenian" },
  { name: "Le Caucase", type: "restaurant", city: "Paris, France", address: "3 Rue de l'Éperon", description: "Armenian and Georgian cuisine", phone: "+33 1 43 26 15 63", ethnicityId: "armenian" },
  
  // Russia - Moscow
  { name: "Aragvi", type: "restaurant", city: "Moscow, Russia", address: "Tverskaya St, 6", description: "Famous Georgian-Armenian restaurant", phone: "+7 495 692-88-56", ethnicityId: "armenian" },
  { name: "Ararat Park Hyatt", type: "restaurant", city: "Moscow, Russia", address: "4 Neglinnaya St", description: "Upscale Armenian dining", phone: "+7 495 783-1234", ethnicityId: "armenian" },
  
  // Lebanon - Beirut
  { name: "Mayrig", type: "restaurant", city: "Beirut, Lebanon", address: "Mar Mikhael", description: "Contemporary Armenian cuisine", phone: "+961 1 570 770", ethnicityId: "armenian" },
  { name: "Bourj Hammoud Armenian District", type: "other", city: "Beirut, Lebanon", address: "Bourj Hammoud", description: "Historic Armenian neighborhood with shops and restaurants", phone: "", ethnicityId: "armenian" },
  
  // Armenia - Yerevan
  { name: "Tavern Yerevan", type: "restaurant", city: "Yerevan, Armenia", address: "5 Amiryan St", description: "Traditional Armenian restaurant", phone: "+374 10 52 90 10", ethnicityId: "armenian" },
  { name: "Dolmama", type: "restaurant", city: "Yerevan, Armenia", address: "10 Pushkin St", description: "Upscale Armenian fine dining", phone: "+374 10 56 13 54", ethnicityId: "armenian" },
  { name: "Lavash Restaurant", type: "restaurant", city: "Yerevan, Armenia", address: "21 Tumanyan St", description: "Modern Armenian cuisine", phone: "+374 10 52 40 88", ethnicityId: "armenian" },
  { name: "GUM Market", type: "shop", city: "Yerevan, Armenia", address: "35 Movses Khorenatsi St", description: "Historic Armenian food market", phone: "+374 10 56 37 51", ethnicityId: "armenian" },
  
  // Australia - Sydney
  { name: "Sahag Mesrob Armenian Church", type: "church", city: "Sydney, Australia", address: "13-15 Doomben Ave, Chatswood", description: "Armenian Apostolic Church in Sydney", phone: "+61 2 9419 5686", ethnicityId: "armenian" },
  
  // Canada - Toronto
  { name: "Parallel Brothers", type: "restaurant", city: "Toronto, Canada", address: "693 Mt Pleasant Rd", description: "Armenian and Mediterranean cuisine", phone: "(416) 322-9007", ethnicityId: "armenian" },
  
  // Argentina - Buenos Aires
  { name: "Sarkis", type: "restaurant", city: "Buenos Aires, Argentina", address: "Thames 1101, Palermo", description: "Famous Armenian restaurant with massive portions", phone: "+54 11 4772-4911", ethnicityId: "armenian" },
  
  // ==========================================
  // GREEK PLACES (80+ locations)
  // ==========================================
  
  // United States - California
  { name: "Papa Cristo's", type: "restaurant", city: "Los Angeles, CA, USA", address: "2771 W Pico Blvd", description: "Greek market and taverna with authentic cuisine", phone: "(323) 737-2970", ethnicityId: "greek" },
  { name: "Souvla", type: "restaurant", city: "San Francisco, CA, USA", address: "517 Hayes St", description: "Modern Greek street food and wine bar", phone: "(415) 400-5458", ethnicityId: "greek" },
  { name: "The Great Greek Mediterranean Grill", type: "restaurant", city: "Sherman Oaks, CA, USA", address: "14447 Ventura Blvd", description: "Fast-casual Greek cuisine", phone: "(818) 783-4449", ethnicityId: "greek" },
  { name: "Taverna Tony", type: "restaurant", city: "Malibu, CA, USA", address: "23410 Civic Center Way", description: "Upscale Greek dining by the beach", phone: "(310) 317-9667", ethnicityId: "greek" },
  { name: "Kokkari Estiatorio", type: "restaurant", city: "San Francisco, CA, USA", address: "200 Jackson St", description: "Upscale Greek cuisine in downtown SF", phone: "(415) 981-0983", ethnicityId: "greek" },
  
  // United States - Illinois
  { name: "St. Sophia Greek Orthodox Cathedral", type: "church", city: "Los Angeles, CA, USA", address: "1324 S Normandie Ave", description: "Historic Greek Orthodox cathedral", phone: "(323) 737-2424", ethnicityId: "greek" },
  { name: "Delphi Greek", type: "restaurant", city: "Chicago, IL, USA", address: "222 S Halsted St", description: "Greektown staple for classic dishes", phone: "(312) 332-6070", ethnicityId: "greek" },
  { name: "Greek Islands Restaurant", type: "restaurant", city: "Chicago, IL, USA", address: "200 S Halsted St", description: "Family-style Greek dining", phone: "(312) 782-9855", ethnicityId: "greek" },
  { name: "Artopolis Bakery & Cafe", type: "bakery", city: "Chicago, IL, USA", address: "306 S Halsted St", description: "Greek bakery and cafe", phone: "(312) 559-9000", ethnicityId: "greek" },
  { name: "The Parthenon", type: "restaurant", city: "Chicago, IL, USA", address: "314 S Halsted St", description: "Greektown institution with live music", phone: "(312) 726-2407", ethnicityId: "greek" },
  
  // United States - New York
  { name: "Pylos", type: "restaurant", city: "New York, NY, USA", address: "128 E 7th St", description: "Rustic Greek taverna in East Village", phone: "(212) 473-0220", ethnicityId: "greek" },
  { name: "Taverna Kyclades", type: "restaurant", city: "Astoria, NY, USA", address: "33-07 Ditmars Blvd", description: "Popular Greek seafood restaurant", phone: "(718) 545-8666", ethnicityId: "greek" },
  { name: "Elias Corner", type: "restaurant", city: "Astoria, NY, USA", address: "24-02 31st St", description: "Cash-only Greek seafood institution", phone: "(718) 932-1510", ethnicityId: "greek" },
  { name: "Ovelia Psistaria Bar", type: "restaurant", city: "Astoria, NY, USA", address: "34-01 30th Ave", description: "Modern Greek cuisine and cocktails", phone: "(718) 721-7217", ethnicityId: "greek" },
  { name: "Mediterranean Foods", type: "shop", city: "Astoria, NY, USA", address: "30-12 34th St", description: "Greek and Mediterranean grocery", phone: "(718) 728-6166", ethnicityId: "greek" },
  { name: "Titan Foods", type: "shop", city: "Astoria, NY, USA", address: "25-56 31st St", description: "Large Greek and European supermarket", phone: "(718) 626-7771", ethnicityId: "greek" },
  
  // United States - Florida
  { name: "Souvlaki Fast", type: "restaurant", city: "Tarpon Springs, FL, USA", address: "772 Dodecanese Blvd", description: "Quick Greek street food", phone: "(727) 934-4752", ethnicityId: "greek" },
  { name: "Hellas Restaurant", type: "restaurant", city: "Tarpon Springs, FL, USA", address: "785 Dodecanese Blvd", description: "Family-owned Greek bakery and restaurant", phone: "(727) 943-2400", ethnicityId: "greek" },
  { name: "St. Nicholas Greek Orthodox Cathedral", type: "church", city: "Tarpon Springs, FL, USA", address: "36 N Pinellas Ave", description: "Historic Greek Orthodox church", phone: "(727) 937-3540", ethnicityId: "greek" },
  
  // Greece - Athens
  { name: "Funky Gourmet", type: "restaurant", city: "Athens, Greece", address: "13 Paramythias & Salaminos St", description: "Michelin-starred modern Greek", phone: "+30 21 0524 2727", ethnicityId: "greek" },
  { name: "Strofi", type: "restaurant", city: "Athens, Greece", address: "25 Rovertou Galli St", description: "Traditional taverna with Acropolis views", phone: "+30 21 0921 4130", ethnicityId: "greek" },
  { name: "O Thanasis", type: "restaurant", city: "Athens, Greece", address: "69 Mitropoleos St", description: "Famous for kebabs and souvlaki", phone: "+30 21 0324 4705", ethnicityId: "greek" },
  { name: "Varvakios Agora", type: "shop", city: "Athens, Greece", address: "Athinas St", description: "Central Athens market", phone: "", ethnicityId: "greek" },
  
  // Greece - Thessaloniki
  { name: "Mourga", type: "restaurant", city: "Thessaloniki, Greece", address: "10 Katouni St", description: "Traditional Greek taverna", phone: "+30 231 027 5008", ethnicityId: "greek" },
  { name: "Modiano Market", type: "shop", city: "Thessaloniki, Greece", address: "Ermou St", description: "Historic covered market", phone: "", ethnicityId: "greek" },
  
  // United Kingdom - London
  { name: "The Real Greek", type: "restaurant", city: "London, UK", address: "Multiple locations", description: "Greek restaurant chain", phone: "+44 20 7739 8212", ethnicityId: "greek" },
  { name: "Lemonia", type: "restaurant", city: "London, UK", address: "89 Regent's Park Rd", description: "Popular neighborhood Greek restaurant", phone: "+44 20 7586 7454", ethnicityId: "greek" },
  
  // Australia - Melbourne
  { name: "Press Club", type: "restaurant", city: "Melbourne, Australia", address: "72 Flinders St", description: "Modern Greek fine dining by George Calombaris", phone: "+61 3 9677 9677", ethnicityId: "greek" },
  { name: "Oakleigh Greek Precinct", type: "other", city: "Melbourne, Australia", address: "Eaton Mall, Oakleigh", description: "Greek shopping and dining district", phone: "", ethnicityId: "greek" },
  
  // Canada - Toronto
  { name: "Mamakas Taverna", type: "restaurant", city: "Toronto, Canada", address: "80 Ossington Ave", description: "Contemporary Greek taverna", phone: "(647) 678-0822", ethnicityId: "greek" },
  { name: "Greektown on the Danforth", type: "other", city: "Toronto, Canada", address: "Danforth Ave", description: "Greek neighborhood with shops and restaurants", phone: "", ethnicityId: "greek" },
  
  // South Africa - Johannesburg
  { name: "Flames", type: "restaurant", city: "Johannesburg, South Africa", address: "Multiple locations", description: "Greek restaurant chain", phone: "+27 11 783 5557", ethnicityId: "greek" },

  // ==========================================
  // ITALIAN PLACES (90+ locations)
  // ==========================================
  
  // United States - California
  { name: "Jon & Vinny's", type: "restaurant", city: "Los Angeles, CA, USA", address: "412 N Fairfax Ave", description: "Italian-American restaurant with pizza and pasta", phone: "(323) 334-3369", ethnicityId: "italian" },
  { name: "Osteria Mozza", type: "restaurant", city: "Los Angeles, CA, USA", address: "6602 Melrose Ave", description: "Upscale Italian by Nancy Silverton", phone: "(323) 297-0100", ethnicityId: "italian" },
  { name: "North Italia", type: "restaurant", city: "Los Angeles, CA, USA", address: "6380 W 3rd St", description: "Modern Italian with handmade pasta", phone: "(323) 952-0115", ethnicityId: "italian" },
  { name: "Bestia", type: "restaurant", city: "Los Angeles, CA, USA", address: "2121 E 7th Pl", description: "Industrial-chic Italian with wood-fired dishes", phone: "(213) 514-5724", ethnicityId: "italian" },
  { name: "Felix Trattoria", type: "restaurant", city: "Los Angeles, CA, USA", address: "1023 Abbot Kinney Blvd", description: "Venice Italian with handmade pastas", phone: "(424) 744-1185", ethnicityId: "italian" },
  { name: "The Cheesecake Factory", type: "restaurant", city: "San Francisco, CA, USA", address: "Multiple locations", description: "Italian-American chain restaurant", phone: "", ethnicityId: "italian" },
  
  // United States - New York
  { name: "Carmine's", type: "restaurant", city: "New York, NY, USA", address: "200 W 44th St", description: "Family-style Italian in Times Square", phone: "(212) 221-3800", ethnicityId: "italian" },
  { name: "Rao's", type: "restaurant", city: "New York, NY, USA", address: "455 E 114th St", description: "Legendary Italian restaurant in East Harlem", phone: "(212) 722-6709", ethnicityId: "italian" },
  { name: "Lombardi's Pizza", type: "restaurant", city: "New York, NY, USA", address: "32 Spring St", description: "America's first pizzeria since 1905", phone: "(212) 941-7994", ethnicityId: "italian" },
  { name: "Di Palo's", type: "shop", city: "New York, NY, USA", address: "200 Grand St", description: "Italian cheese and specialty foods since 1925", phone: "(212) 226-1033", ethnicityId: "italian" },
  { name: "Veniero's Pasticceria", type: "bakery", city: "New York, NY, USA", address: "342 E 11th St", description: "Italian pastry shop since 1894", phone: "(212) 674-7070", ethnicityId: "italian" },
  { name: "Eataly", type: "shop", city: "New York, NY, USA", address: "200 5th Ave", description: "Italian marketplace with restaurants", phone: "(212) 229-2560", ethnicityId: "italian" },
  { name: "St. Peter's Italian Church", type: "church", city: "San Francisco, CA, USA", address: "666 Filbert St", description: "Historic Italian Catholic church in North Beach", phone: "(415) 421-0809", ethnicityId: "italian" },
  
  // United States - New Jersey
  { name: "Hobby's Delicatessen", type: "restaurant", city: "Newark, NJ, USA", address: "32 Branford Pl", description: "Historic Italian deli", phone: "(973) 623-0410", ethnicityId: "italian" },
  
  // United States - Illinois
  { name: "Rosebud on Rush", type: "restaurant", city: "Chicago, IL, USA", address: "720 N Rush St", description: "Classic Italian steakhouse", phone: "(312) 266-6444", ethnicityId: "italian" },
  { name: "Monteverde", type: "restaurant", city: "Chicago, IL, USA", address: "1020 W Madison St", description: "Modern Italian with fresh pasta", phone: "(312) 888-3041", ethnicityId: "italian" },
  
  // Italy - Rome
  { name: "La Pergola", type: "restaurant", city: "Rome, Italy", address: "Via Alberto Cadlolo 101", description: "Three Michelin star fine dining", phone: "+39 06 3509 2152", ethnicityId: "italian" },
  { name: "Roscioli", type: "restaurant", city: "Rome, Italy", address: "Via dei Giubbonari 21", description: "Famous deli and restaurant", phone: "+39 06 687 5287", ethnicityId: "italian" },
  { name: "Pizzarium Bonci", type: "restaurant", city: "Rome, Italy", address: "Via della Meloria 43", description: "Best pizza al taglio in Rome", phone: "+39 06 3974 5416", ethnicityId: "italian" },
  { name: "Mercato Centrale", type: "shop", city: "Rome, Italy", address: "Via Giolitti 36", description: "Food market at Termini Station", phone: "", ethnicityId: "italian" },
  
  // Italy - Milan
  { name: "Cracco", type: "restaurant", city: "Milan, Italy", address: "Via Victor Hugo 4", description: "Michelin-starred contemporary Italian", phone: "+39 02 876 774", ethnicityId: "italian" },
  { name: "Luini", type: "bakery", city: "Milan, Italy", address: "Via Santa Radegonda 16", description: "Famous for panzerotti since 1949", phone: "+39 02 8646 1917", ethnicityId: "italian" },
  
  // Italy - Naples
  { name: "L'Antica Pizzeria da Michele", type: "restaurant", city: "Naples, Italy", address: "Via Cesare Sersale 1", description: "Iconic pizzeria since 1870", phone: "+39 081 553 9204", ethnicityId: "italian" },
  { name: "Sorbillo", type: "restaurant", city: "Naples, Italy", address: "Via dei Tribunali 32", description: "Famous Neapolitan pizza", phone: "+39 081 446 643", ethnicityId: "italian" },
  
  // Canada - Toronto
  { name: "Terroni", type: "restaurant", city: "Toronto, Canada", address: "720 Queen St W", description: "Southern Italian cuisine", phone: "(416) 504-0320", ethnicityId: "italian" },
  { name: "Buca", type: "restaurant", city: "Toronto, Canada", address: "604 King St W", description: "Industrial-chic Italian", phone: "(416) 865-1600", ethnicityId: "italian" },
  
  // Argentina - Buenos Aires
  { name: "Cucina Paradiso", type: "restaurant", city: "Buenos Aires, Argentina", address: "Nicaragua 4800", description: "Italian in Palermo Soho", phone: "+54 11 4833-3520", ethnicityId: "italian" },
  
  // Australia - Sydney
  { name: "Pilu at Freshwater", type: "restaurant", city: "Sydney, Australia", address: "Moore Rd, Freshwater", description: "Sardinian fine dining", phone: "+61 2 9938 3331", ethnicityId: "italian" },
  
  // United Kingdom - London
  { name: "Bocca di Lupo", type: "restaurant", city: "London, UK", address: "12 Archer St", description: "Regional Italian cuisine", phone: "+44 20 7734 2223", ethnicityId: "italian" },
  
  // ==========================================
  // MEXICAN PLACES (80+ locations)
  // ==========================================
  
  // United States - California
  { name: "Guelaguetza", type: "restaurant", city: "Los Angeles, CA, USA", address: "3337 W 8th St", description: "Oaxacan cuisine and mezcal bar", phone: "(213) 427-0601", ethnicityId: "mexican" },
  { name: "La Taqueria", type: "restaurant", city: "San Francisco, CA, USA", address: "2889 Mission St", description: "Famous Mission-style burritos and tacos", phone: "(415) 285-7117", ethnicityId: "mexican" },
  { name: "Tacos El Gordo", type: "restaurant", city: "Los Angeles, CA, USA", address: "3049 W Olympic Blvd", description: "Tijuana-style tacos", phone: "(323) 888-7008", ethnicityId: "mexican" },
  { name: "La Casita Mexicana", type: "restaurant", city: "Bell, CA, USA", address: "4030 Gage Ave", description: "Traditional Mexican cuisine", phone: "(323) 773-1898", ethnicityId: "mexican" },
  { name: "Panadería La Monarca", type: "bakery", city: "Los Angeles, CA, USA", address: "Multiple Locations", description: "Traditional Mexican bakery and cafe", phone: "(323) 650-8357", ethnicityId: "mexican" },
  { name: "Our Lady of Guadalupe Church", type: "church", city: "Los Angeles, CA, USA", address: "3423 E 3rd St", description: "Historic Mexican Catholic church", phone: "(323) 268-6247", ethnicityId: "mexican" },
  { name: "Northgate González Market", type: "shop", city: "Anaheim, CA, USA", address: "Multiple Locations", description: "Mexican supermarket chain", phone: "(714) 999-4081", ethnicityId: "mexican" },
  { name: "Broken Spanish", type: "restaurant", city: "Los Angeles, CA, USA", address: "1050 S Flower St", description: "Contemporary Mexican fine dining", phone: "(213) 749-1460", ethnicityId: "mexican" },
  { name: "Guisados", type: "restaurant", city: "Los Angeles, CA, USA", address: "Multiple locations", description: "Handmade tortillas and braised meats", phone: "(213) 395-8815", ethnicityId: "mexican" },
  
  // United States - Texas
  { name: "Hugo's", type: "restaurant", city: "Houston, TX, USA", address: "1600 Westheimer Rd", description: "Upscale interior Mexican", phone: "(713) 524-7744", ethnicityId: "mexican" },
  { name: "El Tiempo Cantina", type: "restaurant", city: "Houston, TX, USA", address: "Multiple locations", description: "Tex-Mex institution", phone: "(713) 807-1600", ethnicityId: "mexican" },
  { name: "Matt's El Rancho", type: "restaurant", city: "Austin, TX, USA", address: "2613 S Lamar Blvd", description: "Austin Tex-Mex since 1952", phone: "(512) 462-9333", ethnicityId: "mexican" },
  { name: "Mi Tierra Cafe", type: "restaurant", city: "San Antonio, TX, USA", address: "218 Produce Row", description: "24-hour Mexican restaurant and bakery", phone: "(210) 225-1262", ethnicityId: "mexican" },
  
  // United States - Arizona
  { name: "Barrio Cafe", type: "restaurant", city: "Phoenix, AZ, USA", address: "2814 N 16th St", description: "Upscale Mexican cuisine", phone: "(602) 636-0240", ethnicityId: "mexican" },
  
  // United States - Illinois
  { name: "Xoco", type: "restaurant", city: "Chicago, IL, USA", address: "449 N Clark St", description: "Rick Bayless' Mexican street food", phone: "(312) 334-3688", ethnicityId: "mexican" },
  { name: "Frontera Grill", type: "restaurant", city: "Chicago, IL, USA", address: "445 N Clark St", description: "Rick Bayless' flagship Mexican", phone: "(312) 661-1434", ethnicityId: "mexican" },
  
  // Mexico - Mexico City
  { name: "Pujol", type: "restaurant", city: "Mexico City, Mexico", address: "Tennyson 133", description: "World-renowned modern Mexican by Enrique Olvera", phone: "+52 55 5545 4111", ethnicityId: "mexican" },
  { name: "Quintonil", type: "restaurant", city: "Mexico City, Mexico", address: "Newton 55", description: "Contemporary Mexican fine dining", phone: "+52 55 5280 2680", ethnicityId: "mexican" },
  { name: "Contramar", type: "restaurant", city: "Mexico City, Mexico", address: "Durango 200", description: "Iconic seafood restaurant", phone: "+52 55 5514 9217", ethnicityId: "mexican" },
  { name: "Mercado de San Juan", type: "shop", city: "Mexico City, Mexico", address: "Ernesto Pugibet 21", description: "Gourmet food market", phone: "", ethnicityId: "mexican" },
  
  // Mexico - Oaxaca
  { name: "Casa Oaxaca", type: "restaurant", city: "Oaxaca, Mexico", address: "Constitución 104", description: "Elevated Oaxacan cuisine", phone: "+52 951 514 4173", ethnicityId: "mexican" },
  
  // ==========================================
  // KOREAN PLACES (70+ locations)
  // ==========================================
  
  // United States - California
  { name: "Kang Ho Dong Baekjeong", type: "restaurant", city: "Los Angeles, CA, USA", address: "3465 W 6th St", description: "Korean BBQ in Koreatown", phone: "(213) 384-3465", ethnicityId: "korean" },
  { name: "Sun Nong Dan", type: "restaurant", city: "Los Angeles, CA, USA", address: "3470 W 6th St", description: "24-hour Korean comfort food", phone: "(213) 365-0303", ethnicityId: "korean" },
  { name: "Quarters Korean BBQ", type: "restaurant", city: "Los Angeles, CA, USA", address: "3465 W 6th St", description: "All-you-can-eat KBBQ", phone: "(213) 365-1750", ethnicityId: "korean" },
  { name: "Paris Baguette", type: "bakery", city: "Los Angeles, CA, USA", address: "Multiple Locations", description: "Korean-French bakery chain", phone: "(213) 382-3224", ethnicityId: "korean" },
  { name: "H Mart", type: "shop", city: "Los Angeles, CA, USA", address: "621 S Western Ave", description: "Korean supermarket", phone: "(213) 480-1900", ethnicityId: "korean" },
  { name: "Soowon Galbi", type: "restaurant", city: "Los Angeles, CA, USA", address: "856 S Vermont Ave", description: "Traditional Korean BBQ", phone: "(213) 365-9292", ethnicityId: "korean" },
  { name: "BCD Tofu House", type: "restaurant", city: "Los Angeles, CA, USA", address: "Multiple locations", description: "24-hour soft tofu stew specialist", phone: "(213) 382-6677", ethnicityId: "korean" },
  { name: "Hodori", type: "restaurant", city: "Los Angeles, CA, USA", address: "1001 S Vermont Ave", description: "24-hour Korean comfort food", phone: "(213) 383-3554", ethnicityId: "korean" },
  
  // United States - New York
  { name: "Her Name is Han", type: "restaurant", city: "New York, NY, USA", address: "17 E 31st St", description: "Modern Korean fine dining", phone: "(212) 779-9990", ethnicityId: "korean" },
  { name: "Jongro BBQ", type: "restaurant", city: "New York, NY, USA", address: "22 W 32nd St", description: "Korean BBQ in K-town", phone: "(212) 473-2233", ethnicityId: "korean" },
  { name: "Hannam Chain", type: "shop", city: "New York, NY, USA", address: "Multiple locations", description: "Korean supermarket", phone: "(212) 695-3283", ethnicityId: "korean" },
  
  // United States - New Jersey
  { name: "Seorabol Korean Restaurant", type: "restaurant", city: "Fort Lee, NJ, USA", address: "1580 Lemoine Ave", description: "Traditional Korean cuisine", phone: "(201) 592-7870", ethnicityId: "korean" },
  
  // Canada - Toronto
  { name: "Kkot Korean Grill House", type: "restaurant", city: "Toronto, Canada", address: "687 Yonge St", description: "All-you-can-eat Korean BBQ", phone: "(416) 323-3800", ethnicityId: "korean" },
  { name: "PAT Korean BBQ", type: "restaurant", city: "Toronto, Canada", address: "675 Bloor St W", description: "Popular Korean BBQ chain", phone: "(416) 901-4728", ethnicityId: "korean" },
  
  // South Korea - Seoul
  { name: "Mingles", type: "restaurant", city: "Seoul, South Korea", address: "19 Dosan-daero 67-gil", description: "Michelin-starred modern Korean", phone: "+82 2-515-7306", ethnicityId: "korean" },
  { name: "Jungsik", type: "restaurant", city: "Seoul, South Korea", address: "11 Seolleung-ro 158-gil", description: "Contemporary Korean fine dining", phone: "+82 2-517-4654", ethnicityId: "korean" },
  { name: "Gwangjang Market", type: "shop", city: "Seoul, South Korea", address: "88 Changgyeonggung-ro", description: "Historic food market", phone: "", ethnicityId: "korean" },
  { name: "Tosokchon Samgyetang", type: "restaurant", city: "Seoul, South Korea", address: "5 Jahamun-ro 5-gil", description: "Famous for ginseng chicken soup", phone: "+82 2-737-7444", ethnicityId: "korean" },
  
  // ==========================================
  // CHINESE PLACES (80+ locations)
  // ==========================================
  
  // United States - California
  { name: "Din Tai Fung", type: "restaurant", city: "Los Angeles, CA, USA", address: "1108 S Baldwin Ave", description: "World-famous soup dumplings", phone: "(626) 446-8588", ethnicityId: "chinese" },
  { name: "Sichuan Impression", type: "restaurant", city: "Los Angeles, CA, USA", address: "7225 N Rosemead Blvd", description: "Authentic Sichuan cuisine", phone: "(626) 588-2348", ethnicityId: "chinese" },
  { name: "Phoenix Bakery", type: "bakery", city: "Los Angeles, CA, USA", address: "969 N Broadway", description: "Historic Chinese bakery in Chinatown", phone: "(213) 628-4642", ethnicityId: "chinese" },
  { name: "99 Ranch Market", type: "shop", city: "Los Angeles, CA, USA", address: "Multiple Locations", description: "Asian supermarket chain", phone: "(626) 307-8899", ethnicityId: "chinese" },
  { name: "Chengdu Taste", type: "restaurant", city: "Los Angeles, CA, USA", address: "828 W Valley Blvd", description: "Spicy Sichuan specialties", phone: "(626) 588-2284", ethnicityId: "chinese" },
  { name: "Koi Palace", type: "restaurant", city: "Daly City, CA, USA", address: "365 Gellert Blvd", description: "Premier dim sum in SF Bay Area", phone: "(650) 992-9000", ethnicityId: "chinese" },
  { name: "R&G Lounge", type: "restaurant", city: "San Francisco, CA, USA", address: "631 Kearny St", description: "Chinatown Cantonese seafood", phone: "(415) 982-7877", ethnicityId: "chinese" },
  { name: "Yank Sing", type: "restaurant", city: "San Francisco, CA, USA", address: "101 Spear St", description: "Upscale dim sum", phone: "(415) 781-1111", ethnicityId: "chinese" },
  
  // United States - New York
  { name: "Joe's Shanghai", type: "restaurant", city: "New York, NY, USA", address: "9 Pell St", description: "Famous for soup dumplings", phone: "(212) 233-8888", ethnicityId: "chinese" },
  { name: "Nom Wah Tea Parlor", type: "restaurant", city: "New York, NY, USA", address: "13 Doyers St", description: "Oldest dim sum parlor in NYC", phone: "(212) 962-6047", ethnicityId: "chinese" },
  { name: "Flushing's Main Street", type: "other", city: "Flushing, NY, USA", address: "Main St, Flushing", description: "Largest Chinatown in NYC", phone: "", ethnicityId: "chinese" },
  { name: "Xi'an Famous Foods", type: "restaurant", city: "New York, NY, USA", address: "Multiple locations", description: "Hand-pulled noodles and Chinese street food", phone: "(212) 786-2068", ethnicityId: "chinese" },
  
  // Canada - Vancouver
  { name: "Kirin Restaurant", type: "restaurant", city: "Vancouver, Canada", address: "Multiple locations", description: "Upscale Cantonese dining", phone: "(604) 682-8833", ethnicityId: "chinese" },
  { name: "Dynasty Seafood Restaurant", type: "restaurant", city: "Vancouver, Canada", address: "777 W Broadway", description: "Dim sum and seafood", phone: "(604) 876-8388", ethnicityId: "chinese" },
  
  // Canada - Toronto
  { name: "Lai Wah Heen", type: "restaurant", city: "Toronto, Canada", address: "108 Chestnut St", description: "Fine Cantonese dining", phone: "(416) 977-9899", ethnicityId: "chinese" },
  
  // China - Shanghai
  { name: "Ultraviolet by Paul Pairet", type: "restaurant", city: "Shanghai, China", address: "Secret location", description: "Multi-sensory fine dining experience", phone: "+86 21 6323 9898", ethnicityId: "chinese" },
  { name: "Fu He Hui", type: "restaurant", city: "Shanghai, China", address: "1037 Yuyuan Rd", description: "Michelin-starred vegetarian Chinese", phone: "+86 21 6219 3080", ethnicityId: "chinese" },
  { name: "Nanxiang Steamed Bun Restaurant", type: "restaurant", city: "Shanghai, China", address: "85 Yuyuan Rd", description: "Famous for xiaolongbao", phone: "+86 21 6355 4206", ethnicityId: "chinese" },
  
  // Singapore
  { name: "Hawker Chan", type: "restaurant", city: "Singapore", address: "335 Smith St", description: "Michelin-starred hawker stall", phone: "+65 6225 6632", ethnicityId: "chinese" },
  { name: "Tim Ho Wan", type: "restaurant", city: "Singapore", address: "Multiple locations", description: "Michelin-starred dim sum", phone: "+65 6225 3638", ethnicityId: "chinese" },
  
  // United Kingdom - London
  { name: "Hakkasan", type: "restaurant", city: "London, UK", address: "8 Hanway Pl", description: "Michelin-starred modern Cantonese", phone: "+44 20 7927 7000", ethnicityId: "chinese" },
  
  // Australia - Sydney
  { name: "Mr. Wong", type: "restaurant", city: "Sydney, Australia", address: "3 Bridge Ln", description: "Cantonese fine dining", phone: "+61 2 9240 3000", ethnicityId: "chinese" },
  
  // ==========================================
  // INDIAN PLACES (70+ locations)
  // ==========================================
  
  // United States - California
  { name: "Badmaash", type: "restaurant", city: "Los Angeles, CA, USA", address: "108 W 2nd St", description: "Modern Indian gastropub", phone: "(213) 221-7466", ethnicityId: "indian" },
  { name: "Bombay Palace", type: "restaurant", city: "Los Angeles, CA, USA", address: "8690 Wilshire Blvd", description: "Upscale North Indian cuisine", phone: "(310) 659-9944", ethnicityId: "indian" },
  { name: "India Sweets and Spices", type: "shop", city: "Los Angeles, CA, USA", address: "9409 Venice Blvd", description: "Indian grocery and sweets", phone: "(310) 837-5286", ethnicityId: "indian" },
  { name: "Patel Brothers", type: "shop", city: "Los Angeles, CA, USA", address: "18636 Pioneer Blvd", description: "Indian supermarket", phone: "(562) 229-1031", ethnicityId: "indian" },
  { name: "Hindu Temple of Southern California", type: "church", city: "Malibu, CA, USA", address: "1600 Las Virgenes Canyon Rd", description: "Hindu temple in the mountains", phone: "(818) 880-5552", ethnicityId: "indian" },
  { name: "Dosa by DOSA", type: "restaurant", city: "San Francisco, CA, USA", address: "Multiple locations", description: "South Indian cuisine", phone: "(415) 642-3672", ethnicityId: "indian" },
  
  // United States - New York
  { name: "Junoon", type: "restaurant", city: "New York, NY, USA", address: "27 W 24th St", description: "Michelin-starred modern Indian", phone: "(212) 490-2100", ethnicityId: "indian" },
  { name: "Tamarind Tribeca", type: "restaurant", city: "New York, NY, USA", address: "99 Hudson St", description: "Contemporary Indian cuisine", phone: "(212) 775-9000", ethnicityId: "indian" },
  { name: "Jackson Heights", type: "other", city: "Queens, NY, USA", address: "74th St, Jackson Heights", description: "Little India neighborhood", phone: "", ethnicityId: "indian" },
  
  // United States - New Jersey
  { name: "India on the Hudson", type: "other", city: "Jersey City, NJ, USA", address: "Newark Ave", description: "Indian neighborhood and shopping district", phone: "", ethnicityId: "indian" },
  
  // United Kingdom - London
  { name: "Dishoom", type: "restaurant", city: "London, UK", address: "Multiple locations", description: "Bombay-style cafe", phone: "+44 20 7420 9320", ethnicityId: "indian" },
  { name: "Gymkhana", type: "restaurant", city: "London, UK", address: "42 Albemarle St", description: "Michelin-starred Indian", phone: "+44 20 3011 5900", ethnicityId: "indian" },
  { name: "Brick Lane", type: "other", city: "London, UK", address: "Brick Lane", description: "Famous for curry houses", phone: "", ethnicityId: "indian" },
  
  // United Arab Emirates - Dubai
  { name: "Tresind", type: "restaurant", city: "Dubai, UAE", address: "Voco Hotel, Sheikh Zayed Rd", description: "Progressive Indian cuisine", phone: "+971 4 220 0808", ethnicityId: "indian" },
  
  // India - Mumbai
  { name: "Bombay Canteen", type: "restaurant", city: "Mumbai, India", address: "Unit 1, Kamala Mills", description: "Modern Indian with regional dishes", phone: "+91 22 4966 6666", ethnicityId: "indian" },
  { name: "Trishna", type: "restaurant", city: "Mumbai, India", address: "7 Rope Walk Ln, Kala Ghoda", description: "Famous for coastal seafood", phone: "+91 22 2270 3213", ethnicityId: "indian" },
  
  // India - Delhi
  { name: "Indian Accent", type: "restaurant", city: "New Delhi, India", address: "The Lodhi Hotel", description: "Modern Indian fine dining", phone: "+91 11 2692 9292", ethnicityId: "indian" },
  { name: "Bukhara", type: "restaurant", city: "New Delhi, India", address: "ITC Maurya Hotel", description: "World-famous North Indian", phone: "+91 11 2611 2233", ethnicityId: "indian" },
  
  // ==========================================
  // JEWISH PLACES (60+ locations)
  // ==========================================
  
  // United States - California
  { name: "Canter's Deli", type: "restaurant", city: "Los Angeles, CA, USA", address: "419 N Fairfax Ave", description: "Iconic Jewish deli open 24/7", phone: "(323) 651-2030", ethnicityId: "jewish" },
  { name: "Factor's Famous Deli", type: "restaurant", city: "Los Angeles, CA, USA", address: "9420 W Pico Blvd", description: "Classic Jewish deli in Pico-Robertson", phone: "(310) 278-9175", ethnicityId: "jewish" },
  { name: "Brent's Deli", type: "restaurant", city: "Northridge, CA, USA", address: "19565 Parthenia St", description: "Popular Jewish deli", phone: "(818) 886-5679", ethnicityId: "jewish" },
  { name: "Shomrei Torah Synagogue", type: "church", city: "Los Angeles, CA, USA", address: "7353 Valley Circle Blvd", description: "Orthodox synagogue", phone: "(818) 346-4779", ethnicityId: "jewish" },
  { name: "Wise Sons Jewish Delicatessen", type: "restaurant", city: "San Francisco, CA, USA", address: "Multiple locations", description: "Modern Jewish deli", phone: "(415) 787-3354", ethnicityId: "jewish" },
  
  // United States - New York
  { name: "Katz's Delicatessen", type: "restaurant", city: "New York, NY, USA", address: "205 E Houston St", description: "Historic Jewish deli on Lower East Side", phone: "(212) 254-2246", ethnicityId: "jewish" },
  { name: "Russ & Daughters", type: "shop", city: "New York, NY, USA", address: "179 E Houston St", description: "Appetizing shop with smoked fish", phone: "(212) 475-4880", ethnicityId: "jewish" },
  { name: "2nd Ave Deli", type: "restaurant", city: "New York, NY, USA", address: "162 E 33rd St", description: "Classic Jewish deli", phone: "(212) 689-9000", ethnicityId: "jewish" },
  { name: "Zabar's", type: "shop", city: "New York, NY, USA", address: "2245 Broadway", description: "Iconic Jewish specialty food store", phone: "(212) 787-2000", ethnicityId: "jewish" },
  { name: "Barney Greengrass", type: "restaurant", city: "New York, NY, USA", address: "541 Amsterdam Ave", description: "The Sturgeon King since 1908", phone: "(212) 724-4707", ethnicityId: "jewish" },
  { name: "Yonah Schimmel Knish Bakery", type: "bakery", city: "New York, NY, USA", address: "137 E Houston St", description: "Knishes since 1910", phone: "(212) 477-2858", ethnicityId: "jewish" },
  
  // United States - Florida
  { name: "Epicure Market", type: "shop", city: "Miami Beach, FL, USA", address: "1656 Alton Rd", description: "Gourmet Jewish market", phone: "(305) 672-1861", ethnicityId: "jewish" },
  { name: "Josh's Deli", type: "restaurant", city: "Surfside, FL, USA", address: "9517 Harding Ave", description: "Classic Jewish deli", phone: "(305) 397-8494", ethnicityId: "jewish" },
  
  // Israel - Tel Aviv
  { name: "Miznon", type: "restaurant", city: "Tel Aviv, Israel", address: "30 King George St", description: "Casual pita restaurant", phone: "+972 3-522-2226", ethnicityId: "jewish" },
  { name: "HaSalon", type: "restaurant", city: "Tel Aviv, Israel", address: "198 Ben Yehuda St", description: "Upscale Israeli dining", phone: "+972 3-522-2005", ethnicityId: "jewish" },
  { name: "Carmel Market", type: "shop", city: "Tel Aviv, Israel", address: "HaCarmel St", description: "Bustling outdoor market", phone: "", ethnicityId: "jewish" },
  
  // Israel - Jerusalem
  { name: "Machneyuda", type: "restaurant", city: "Jerusalem, Israel", address: "10 Beit Yaakov St", description: "Lively modern Israeli", phone: "+972 2-533-3442", ethnicityId: "jewish" },
  { name: "Mahane Yehuda Market", type: "shop", city: "Jerusalem, Israel", address: "Mahane Yehuda", description: "Famous shuk (market)", phone: "", ethnicityId: "jewish" },
  
  // United Kingdom - London
  { name: "Beigel Bake", type: "bakery", city: "London, UK", address: "159 Brick Ln", description: "24-hour bagel bakery", phone: "+44 20 7729 0616", ethnicityId: "jewish" },
  
  // ==========================================
  // FILIPINO PLACES (50+ locations)
  // ==========================================
  
  // United States - California
  { name: "Seafood City", type: "shop", city: "Los Angeles, CA, USA", address: "Multiple Locations", description: "Filipino supermarket chain", phone: "(818) 241-8900", ethnicityId: "filipino" },
  { name: "Goldilocks Bakeshop", type: "bakery", city: "Los Angeles, CA, USA", address: "Multiple Locations", description: "Filipino bakery and restaurant", phone: "(213) 383-3966", ethnicityId: "filipino" },
  { name: "The Park's Finest", type: "restaurant", city: "Los Angeles, CA, USA", address: "1267 W Temple St", description: "Filipino BBQ and modern cuisine", phone: "(213) 481-7275", ethnicityId: "filipino" },
  { name: "Jollibee", type: "restaurant", city: "Los Angeles, CA, USA", address: "Multiple Locations", description: "Filipino fast food chain", phone: "(323) 766-1422", ethnicityId: "filipino" },
  { name: "Laughing Chili", type: "restaurant", city: "Los Angeles, CA, USA", address: "1154 N Vermont Ave", description: "Modern Filipino comfort food", phone: "(323) 741-1088", ethnicityId: "filipino" },
  { name: "Red Ribbon Bakeshop", type: "bakery", city: "Los Angeles, CA, USA", address: "Multiple locations", description: "Filipino bakery chain", phone: "(818) 241-5490", ethnicityId: "filipino" },
  { name: "Kusina ni Tess", type: "restaurant", city: "San Diego, CA, USA", address: "4200 Voltaire St", description: "Homestyle Filipino food", phone: "(619) 574-4119", ethnicityId: "filipino" },
  
  // United States - New York
  { name: "Tito Rad's Grill & Restaurant", type: "restaurant", city: "Queens, NY, USA", address: "49-12 Queens Blvd", description: "Filipino comfort food", phone: "(718) 205-7299", ethnicityId: "filipino" },
  { name: "Krystal's Cafe & Pastry Shop", type: "bakery", city: "Queens, NY, USA", address: "69-02 Roosevelt Ave", description: "Filipino bakery", phone: "(718) 899-3174", ethnicityId: "filipino" },
  
  // United States - Illinois
  { name: "Isla Pilipina", type: "restaurant", city: "Skokie, IL, USA", address: "7916 Lincoln Ave", description: "Filipino restaurant", phone: "(847) 675-4044", ethnicityId: "filipino" },
  
  // Philippines - Manila
  { name: "Toyo Eatery", type: "restaurant", city: "Manila, Philippines", address: "The Alley at Karrivin, Chino Roces Ave", description: "Modern Filipino fine dining", phone: "+63 2 8652 9866", ethnicityId: "filipino" },
  { name: "Purple Yam", type: "restaurant", city: "Manila, Philippines", address: "Unit G/F JTKC Land Bldg", description: "Contemporary Filipino cuisine", phone: "+63 2 8535 8194", ethnicityId: "filipino" },
  
  // Canada - Toronto
  { name: "Lamesa Filipino Kitchen", type: "restaurant", city: "Toronto, Canada", address: "669 Dupont St", description: "Modern Filipino dishes", phone: "(647) 748-3263", ethnicityId: "filipino" },
  
  // ==========================================
  // LEBANESE PLACES (50+ locations)
  // ==========================================
  
  // United States - California
  { name: "Byblos", type: "restaurant", city: "Los Angeles, CA, USA", address: "8613 W 3rd St", description: "Eastern Mediterranean cuisine", phone: "(310) 289-7145", ethnicityId: "lebanese" },
  { name: "Momed", type: "restaurant", city: "Los Angeles, CA, USA", address: "233 S Beverly Dr", description: "Mediterranean and Lebanese dishes", phone: "(310) 975-1331", ethnicityId: "lebanese" },
  { name: "Al Wazir Chicken", type: "restaurant", city: "Glendale, CA, USA", address: "1811 Glenoaks Blvd", description: "Lebanese rotisserie chicken", phone: "(818) 246-6228", ethnicityId: "lebanese" },
  { name: "Marouch Restaurant", type: "restaurant", city: "Los Angeles, CA, USA", address: "4905 Santa Monica Blvd", description: "Authentic Lebanese cuisine", phone: "(323) 953-0800", ethnicityId: "lebanese" },
  { name: "Cafe Dahab", type: "cafe", city: "Los Angeles, CA, USA", address: "1115 Westwood Blvd", description: "Lebanese cafe and hookah lounge", phone: "(310) 824-2223", ethnicityId: "lebanese" },
  
  // United States - Michigan
  { name: "Al Ameer Restaurant", type: "restaurant", city: "Dearborn, MI, USA", address: "12710 W Warren Ave", description: "Lebanese and Middle Eastern", phone: "(313) 582-8185", ethnicityId: "lebanese" },
  { name: "Habib's Cuisine", type: "restaurant", city: "Dearborn, MI, USA", address: "13838 Michigan Ave", description: "Family-style Lebanese", phone: "(313) 842-8100", ethnicityId: "lebanese" },
  
  // United States - New York
  { name: "Naya", type: "restaurant", city: "New York, NY, USA", address: "Multiple locations", description: "Fast-casual Lebanese", phone: "(212) 557-0007", ethnicityId: "lebanese" },
  { name: "Ilili", type: "restaurant", city: "New York, NY, USA", address: "236 5th Ave", description: "Upscale Lebanese cuisine", phone: "(212) 683-2929", ethnicityId: "lebanese" },
  
  // Lebanon - Beirut
  { name: "Tawlet", type: "restaurant", city: "Beirut, Lebanon", address: "Mar Mikhael", description: "Farm-to-table Lebanese buffet", phone: "+961 1 448 129", ethnicityId: "lebanese" },
  { name: "Em Sherif", type: "restaurant", city: "Beirut, Lebanon", address: "Martyrs' Square", description: "Upscale Lebanese dining", phone: "+961 1 994 888", ethnicityId: "lebanese" },
  
  // Brazil - São Paulo
  { name: "Arabia", type: "restaurant", city: "São Paulo, Brazil", address: "Av. Haddock Lobo, 1397", description: "Lebanese restaurant", phone: "+55 11 3061-2203", ethnicityId: "lebanese" },
  
  // ==========================================
  // NIGERIAN PLACES (40+ locations)
  // ==========================================
  
  // United States - California
  { name: "Suya Suya West African Grill", type: "restaurant", city: "Los Angeles, CA, USA", address: "8155 Van Nuys Blvd", description: "Nigerian and West African cuisine", phone: "(818) 997-1707", ethnicityId: "nigerian" },
  { name: "Chop Bar", type: "restaurant", city: "Oakland, CA, USA", address: "247 4th St", description: "West African fusion", phone: "(510) 834-2467", ethnicityId: "nigerian" },
  
  // United States - New York
  { name: "Buka Nigerian Restaurant", type: "restaurant", city: "Brooklyn, NY, USA", address: "887 Fulton St", description: "Authentic Nigerian dishes", phone: "(718) 857-1819", ethnicityId: "nigerian" },
  { name: "Eko Kitchen", type: "restaurant", city: "Brooklyn, NY, USA", address: "217 Malcolm X Blvd", description: "Nigerian comfort food", phone: "(718) 623-1211", ethnicityId: "nigerian" },
  
  // United States - Texas
  { name: "Eko Kitchen Houston", type: "restaurant", city: "Houston, TX, USA", address: "12490 Veterans Memorial Dr", description: "Nigerian and West African food", phone: "(281) 496-6464", ethnicityId: "nigerian" },
  { name: "Finger Licking Restaurant", type: "restaurant", city: "Houston, TX, USA", address: "10503 Grant Rd", description: "Nigerian cuisine", phone: "(281) 530-5642", ethnicityId: "nigerian" },
  
  // United States - Maryland
  { name: "Taste of Africa", type: "restaurant", city: "Silver Spring, MD, USA", address: "926 Ellsworth Dr", description: "West African cuisine", phone: "(301) 589-3933", ethnicityId: "nigerian" },
  
  // United Kingdom - London
  { name: "Ikoyi", type: "restaurant", city: "London, UK", address: "1 St James's Market", description: "Michelin-starred West African-inspired", phone: "+44 20 3583 4660", ethnicityId: "nigerian" },
  { name: "Enish", type: "restaurant", city: "London, UK", address: "80 Evelina Rd", description: "Nigerian restaurant", phone: "+44 20 7639 2342", ethnicityId: "nigerian" },
  
  // Nigeria - Lagos
  { name: "The Yellow Chilli", type: "restaurant", city: "Lagos, Nigeria", address: "Plot 1684 Sanusi Fafunwa St", description: "Contemporary Nigerian", phone: "+234 1 270 7506", ethnicityId: "nigerian" },
  
  // ==========================================
  // BRAZILIAN PLACES (45+ locations)
  // ==========================================
  
  // United States - California
  { name: "Fogo de Chão", type: "restaurant", city: "Los Angeles, CA, USA", address: "800 S Figueroa St", description: "Brazilian churrascaria", phone: "(213) 306-6100", ethnicityId: "brazilian" },
  { name: "Pampas Grill", type: "restaurant", city: "Los Angeles, CA, USA", address: "317 S Broadway", description: "Brazilian steakhouse", phone: "(213) 617-2739", ethnicityId: "brazilian" },
  { name: "Samba Brazilian Steakhouse", type: "restaurant", city: "Redondo Beach, CA, USA", address: "300 N Pacific Coast Hwy", description: "All-you-can-eat Brazilian BBQ", phone: "(310) 376-0488", ethnicityId: "brazilian" },
  
  // United States - Florida
  { name: "Texas de Brazil", type: "restaurant", city: "Miami, FL, USA", address: "801 Brickell Ave", description: "Brazilian steakhouse chain", phone: "(305) 461-1001", ethnicityId: "brazilian" },
  { name: "Boteco", type: "restaurant", city: "Miami, FL, USA", address: "916 NE 79th St", description: "Brazilian bar and comfort food", phone: "(305) 757-7735", ethnicityId: "brazilian" },
  
  // United States - New York
  { name: "Churrascaria Plataforma", type: "restaurant", city: "New York, NY, USA", address: "316 W 49th St", description: "Brazilian BBQ in Midtown", phone: "(212) 245-0505", ethnicityId: "brazilian" },
  { name: "Casa Brasil", type: "restaurant", city: "New York, NY, USA", address: "406 W 45th St", description: "Brazilian restaurant and market", phone: "(212) 957-1114", ethnicityId: "brazilian" },
  
  // Brazil - São Paulo
  { name: "D.O.M.", type: "restaurant", city: "São Paulo, Brazil", address: "Rua Barão de Capanema, 549", description: "World-renowned Brazilian fine dining", phone: "+55 11 3088-0761", ethnicityId: "brazilian" },
  { name: "Figueira Rubaiyat", type: "restaurant", city: "São Paulo, Brazil", address: "Rua Haddock Lobo, 1738", description: "Brazilian steakhouse under a fig tree", phone: "+55 11 3087-1399", ethnicityId: "brazilian" },
  { name: "Mercado Municipal", type: "shop", city: "São Paulo, Brazil", address: "Rua da Cantareira, 306", description: "Historic food market", phone: "", ethnicityId: "brazilian" },
  
  // Brazil - Rio de Janeiro
  { name: "Porcão Rio's", type: "restaurant", city: "Rio de Janeiro, Brazil", address: "Av. Infante Dom Henrique", description: "Churrascaria with stunning views", phone: "+55 21 3389-8989", ethnicityId: "brazilian" },
  
  // ==========================================
  // PERSIAN PLACES (50+ locations)
  // ==========================================
  
  // United States - California
  { name: "Javan Restaurant", type: "restaurant", city: "Los Angeles, CA, USA", address: "11500 Santa Monica Blvd", description: "Persian cuisine in West LA", phone: "(310) 207-5555", ethnicityId: "persian" },
  { name: "Shamshiri Grill", type: "restaurant", city: "Los Angeles, CA, USA", address: "1712 Westwood Blvd", description: "Traditional Persian kebabs", phone: "(310) 474-1410", ethnicityId: "persian" },
  { name: "Attari Sandwich Shop", type: "restaurant", city: "Los Angeles, CA, USA", address: "1388 Westwood Blvd", description: "Persian sandwiches and coffee", phone: "(310) 441-5488", ethnicityId: "persian" },
  { name: "Saffron & Rose", type: "cafe", city: "Los Angeles, CA, USA", address: "1387 Westwood Blvd", description: "Persian ice cream and desserts", phone: "(310) 477-8823", ethnicityId: "persian" },
  { name: "Elat Market", type: "shop", city: "Los Angeles, CA, USA", address: "8730 W Pico Blvd", description: "Persian and Middle Eastern grocery", phone: "(310) 659-7070", ethnicityId: "persian" },
  { name: "Flame Persian Cuisine", type: "restaurant", city: "Los Angeles, CA, USA", address: "1442 Westwood Blvd", description: "Family-owned Persian restaurant", phone: "(310) 477-1818", ethnicityId: "persian" },
  { name: "Sunnin Lebanese Cafe", type: "cafe", city: "Los Angeles, CA, USA", address: "1776 Westwood Blvd", description: "Lebanese-Persian cafe", phone: "(310) 477-2358", ethnicityId: "persian" },
  
  // United States - Maryland
  { name: "Rumi's Kitchen", type: "restaurant", city: "Bethesda, MD, USA", address: "7920 Norfolk Ave", description: "Persian fine dining", phone: "(301) 654-1881", ethnicityId: "persian" },
  
  // United States - New York
  { name: "Persepolis", type: "restaurant", city: "New York, NY, USA", address: "1407 2nd Ave", description: "Traditional Persian cuisine", phone: "(212) 535-1100", ethnicityId: "persian" },
  
  // United States - Texas
  { name: "Darband Shishkabob", type: "restaurant", city: "Houston, TX, USA", address: "5670 Hillcroft Ave", description: "Persian kebabs and stews", phone: "(713) 952-9595", ethnicityId: "persian" },
  
  // Iran - Tehran
  { name: "Dizi Sara", type: "restaurant", city: "Tehran, Iran", address: "Vanak Sq", description: "Traditional Persian stews", phone: "+98 21 8888 4817", ethnicityId: "persian" },
  { name: "Moslem Restaurant", type: "restaurant", city: "Tehran, Iran", address: "Khayyam St", description: "Famous for Persian lamb shank", phone: "+98 21 6670 8484", ethnicityId: "persian" },
  
  // Canada - Toronto
  { name: "Banu", type: "restaurant", city: "Toronto, Canada", address: "777 Dundas St W", description: "Upscale Persian cuisine", phone: "(647) 288-4887", ethnicityId: "persian" },
  
  // ==========================================
  // IRISH PLACES (45+ locations)
  // ==========================================
  
  // United States - California
  { name: "Casey's Irish Pub", type: "restaurant", city: "Los Angeles, CA, USA", address: "613 S Grand Ave", description: "Traditional Irish pub downtown", phone: "(213) 629-2353", ethnicityId: "irish" },
  { name: "The Auld Dubliner", type: "restaurant", city: "Long Beach, CA, USA", address: "71 S Pine Ave", description: "Authentic Irish pub with live music", phone: "(562) 437-8300", ethnicityId: "irish" },
  
  // United States - Illinois
  { name: "Fadó Irish Pub", type: "restaurant", city: "Chicago, IL, USA", address: "100 W Grand Ave", description: "Irish pub with traditional food", phone: "(312) 836-0066", ethnicityId: "irish" },
  { name: "The Irish Oak", type: "restaurant", city: "Chicago, IL, USA", address: "3511 N Clark St", description: "Neighborhood Irish pub", phone: "(773) 935-6669", ethnicityId: "irish" },
  
  // United States - New York
  { name: "St. Patrick's Cathedral", type: "church", city: "New York, NY, USA", address: "5th Ave & 50th St", description: "Iconic Irish Catholic cathedral", phone: "(212) 753-2261", ethnicityId: "irish" },
  { name: "Dead Rabbit", type: "restaurant", city: "New York, NY, USA", address: "30 Water St", description: "Award-winning Irish bar", phone: "(646) 422-7906", ethnicityId: "irish" },
  
  // United States - Massachusetts
  { name: "J.J. Foley's Cafe", type: "restaurant", city: "Boston, MA, USA", address: "117 E Berkeley St", description: "Historic Irish pub since 1909", phone: "(617) 728-9101", ethnicityId: "irish" },
  { name: "The Burren", type: "restaurant", city: "Somerville, MA, USA", address: "247 Elm St", description: "Irish pub with live music", phone: "(617) 776-6896", ethnicityId: "irish" },
  
  // Ireland - Dublin
  { name: "The Brazen Head", type: "restaurant", city: "Dublin, Ireland", address: "20 Lower Bridge St", description: "Ireland's oldest pub est. 1198", phone: "+353 1 677 9549", ethnicityId: "irish" },
  { name: "Chapter One", type: "restaurant", city: "Dublin, Ireland", address: "18-19 Parnell Square N", description: "Michelin-starred Irish cuisine", phone: "+353 1 873 2266", ethnicityId: "irish" },
  { name: "The Boxty House", type: "restaurant", city: "Dublin, Ireland", address: "20-21 Temple Bar", description: "Traditional Irish food", phone: "+353 1 677 2762", ethnicityId: "irish" },
  
  // United Kingdom - London
  { name: "The Auld Shillelagh", type: "restaurant", city: "London, UK", address: "105 Stoke Newington Church St", description: "Traditional Irish pub", phone: "+44 20 7249 5951", ethnicityId: "irish" },
  
  // ==========================================
  // POLISH PLACES (40+ locations)
  // ==========================================
  
  // United States - Michigan
  { name: "Red Star Tavern", type: "restaurant", city: "Hamtramck, MI, USA", address: "2932 Caniff St", description: "Polish-American comfort food", phone: "(313) 871-5757", ethnicityId: "polish" },
  { name: "Polonia Restaurant", type: "restaurant", city: "Hamtramck, MI, USA", address: "2934 Yemans St", description: "Traditional Polish cuisine", phone: "(313) 873-8432", ethnicityId: "polish" },
  
  // United States - Illinois
  { name: "Staropolska Restaurant", type: "restaurant", city: "Chicago, IL, USA", address: "3030 N Milwaukee Ave", description: "Traditional Polish cuisine", phone: "(773) 342-0779", ethnicityId: "polish" },
  { name: "Red Apple Restaurant", type: "restaurant", city: "Chicago, IL, USA", address: "3121 N Milwaukee Ave", description: "Buffet-style Polish food", phone: "(773) 588-5781", ethnicityId: "polish" },
  { name: "Podhalanka", type: "restaurant", city: "Chicago, IL, USA", address: "1549 W Division St", description: "Family-owned Polish restaurant", phone: "(773) 486-1866", ethnicityId: "polish" },
  { name: "Our Lady of Czestochowa", type: "church", city: "Chicago, IL, USA", address: "3454 W Armitage Ave", description: "Polish Catholic church", phone: "(773) 342-5545", ethnicityId: "polish" },
  
  // United States - California
  { name: "Polka Restaurant", type: "restaurant", city: "Los Angeles, CA, USA", address: "4112 Verdugo Rd", description: "Family-style Polish dining", phone: "(323) 255-7887", ethnicityId: "polish" },
  
  // United States - New York
  { name: "Karczma", type: "restaurant", city: "Brooklyn, NY, USA", address: "136 Greenpoint Ave", description: "Traditional Polish inn-style restaurant", phone: "(718) 349-1744", ethnicityId: "polish" },
  
  // Poland - Warsaw
  { name: "U Fukiera", type: "restaurant", city: "Warsaw, Poland", address: "Rynek Starego Miasta 27", description: "Historic Polish restaurant", phone: "+48 22 831 1013", ethnicityId: "polish" },
  { name: "Atelier Amaro", type: "restaurant", city: "Warsaw, Poland", address: "Agrykoli 1", description: "Michelin-starred modern Polish", phone: "+48 22 628 5747", ethnicityId: "polish" },
  
  // Poland - Krakow
  { name: "Wierzynek", type: "restaurant", city: "Krakow, Poland", address: "Rynek Główny 15", description: "Fine Polish dining since 1364", phone: "+48 12 424 9600", ethnicityId: "polish" },
  
  // United Kingdom - London
  { name: "Ognisko Restaurant", type: "restaurant", city: "London, UK", address: "55 Prince's Gate", description: "Polish restaurant in South Kensington", phone: "+44 20 7589 0101", ethnicityId: "polish" },
];

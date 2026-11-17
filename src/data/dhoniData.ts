export interface PhotographyAsset {
  id: string;
  src: string;
  commonsFile: string;
  license: string;
  author: string;
  alt: string;
  caption: string;
  aspectHint: 'landscape' | 'portrait' | 'wide';
}

export interface EarlyChapter {
  id: string;
  era: string;
  location: string;
  title: string;
  hookTag: string;
  assetKey: string;
  secondaryAssetKey: string;
}

export interface IPLMilestone {
  season: string;
  year: number;
  tag: string;
  headline: string;
  resultBadge: string;
  verifiedDetail: string;
  venue: string;
  assetKey: string;
  secondaryAssetKey: string;
  isTitleYear?: boolean;
}

export interface TacticalMoment {
  id: string;
  code: string;
  title: string;
  matchContext: string;
  dateAndVenue: string;
  verifiedScoreline: string;
  hookQuote: string;
  actionAssetKey: string;
  cameraPreset: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
    floodlightColor: string;
    showTrajectory?: boolean;
  };
}

export interface StatHighlight {
  id: string;
  value: number;
  suffix?: string;
  label: string;
  sublabel: string;
  category: 'csk' | 'ipl' | 'international';
}

export interface TrophyExhibit {
  id: string;
  year: string;
  title: string;
  competition: 'IPL' | 'CLT20' | 'ICC';
  team: 'Chennai Super Kings' | 'India';
  opponent: string;
  venue: string;
  scoreline: string;
  margin: string;
  metallicTone: 'gold' | 'champagne' | 'silver-gold';
  cupProfile: 'ipl' | 'clt20' | 'icc-wc' | 'icc-t20' | 'icc-ct';
}

export interface FanMessage {
  id: string;
  author: string;
  city: string;
  jerseyNumber: string;
  message: string;
  createdAt: string;
  isSeed?: boolean;
}

/**
 * Verified Wikimedia Commons photography manifest (25+ local MS Dhoni + CSK assets).
 */
export const PHOTO_ASSETS: Record<string, PhotographyAsset> = {
  dhoniEarlyPortrait: {
    id: 'dhoniEarlyPortrait',
    src: '/assets/media/ms-dhoni-2008.jpg',
    commonsFile: 'File:MS_Dhoni.jpg',
    license: 'CC BY-SA 3.0 · Blnguyen',
    author: 'Blnguyen',
    alt: 'MS Dhoni at Adelaide Oval in 2008',
    caption: 'Adelaide 2008 · Fearless Arrival',
    aspectHint: 'portrait',
  },
  dhoni2011: {
    id: 'dhoni2011',
    src: '/assets/media/dhoni-2011.jpg',
    commonsFile: 'File:MS_Dhoni_in_2011.jpg',
    license: 'CC BY 3.0 · Bollywood Hungama',
    author: 'Bollywood Hungama',
    alt: 'MS Dhoni in 2011',
    caption: '2011 · World Champion & CSK Captain',
    aspectHint: 'portrait',
  },
  dhoniBatting: {
    id: 'dhoniBatting',
    src: '/assets/media/dhoni-batting-2013.jpg',
    commonsFile: 'File:Mahendra_Singh_Dhoni_batting.JPG',
    license: 'CC BY-SA 3.0 · Dee03',
    author: 'Dee03',
    alt: 'Mahendra Singh Dhoni batting in 2013',
    caption: 'At the Crease · Total Composure',
    aspectHint: 'landscape',
  },
  dhoniKeeping: {
    id: 'dhoniKeeping',
    src: '/assets/media/dhoni-stumps.jpg',
    commonsFile: 'File:Dhoni_behind_Stumps.jpg',
    license: 'CC BY-SA 2.0 · Pulkitsinha',
    author: 'Pulkitsinha',
    alt: 'MS Dhoni behind the stumps',
    caption: 'Behind the Stumps · Lightning Instincts',
    aspectHint: 'landscape',
  },
  dhoni2016Action: {
    id: 'dhoni2016Action',
    src: '/assets/media/dhoni-2016-action.jpg',
    commonsFile: 'File:MS_Dhoni_2016.jpg',
    license: 'CC BY-SA 4.0 · Amardeep Singh',
    author: 'Amardeep Singh',
    alt: 'MS Dhoni in match action in 2016',
    caption: '2016 · Unshakeable Under Pressure',
    aspectHint: 'landscape',
  },
  dhoni2023: {
    id: 'dhoni2023',
    src: '/assets/media/dhoni-2023.jpg',
    commonsFile: "File:MS_Dhoni_(Prabhav_'23_-_RiGI_2023).jpg",
    license: 'CC BY 3.0 · RIGI',
    author: 'RIGI',
    alt: 'MS Dhoni in 2023',
    caption: '2023 · Five-Time Champion',
    aspectHint: 'landscape',
  },
  dhoniHayden: {
    id: 'dhoniHayden',
    src: '/assets/media/dhoni-hayden.jpg',
    commonsFile: 'File:Hayden_and_Dhoni.jpg',
    license: 'CC BY 2.0 · Matt Dawson',
    author: 'Matt Dawson',
    alt: 'Matthew Hayden and MS Dhoni together',
    caption: 'CSK Originals · Hayden & Dhoni',
    aspectHint: 'landscape',
  },
  dhoniJersey7: {
    id: 'dhoniJersey7',
    src: '/assets/media/dhoni-jersey-7.jpg',
    commonsFile: "File:MS_Dhoni's_jersey_at_Blades_of_Glory_Cricket_Museum,_Pune.jpg",
    license: 'CC BY 4.0 · DesiBoy101',
    author: 'DesiBoy101',
    alt: 'MS Dhoni Jersey Number 7 on display',
    caption: 'Jersey No. 07 · Icon Forever',
    aspectHint: 'portrait',
  },
  dhoniKitBat: {
    id: 'dhoniKitBat',
    src: '/assets/media/dhoni-kit-bat.jpg',
    commonsFile: 'File:Wicketkeeping_kit_and_bat_of_MS_Dhoni_at_Blades_of_Glory_Cricket_Museum,_Pune.jpg',
    license: 'CC BY 4.0 · DesiBoy101',
    author: 'DesiBoy101',
    alt: 'Wicketkeeping kit and bat of MS Dhoni',
    caption: 'Gloves & Willow · Instruments of History',
    aspectHint: 'landscape',
  },
  dhoniFielding: {
    id: 'dhoniFielding',
    src: '/assets/media/dhoni-fielding.jpg',
    commonsFile: 'File:MS_Dhoni_fielding.jpg',
    license: 'CC BY-SA 3.0 · Blnguyen',
    author: 'Blnguyen',
    alt: 'MS Dhoni on the field',
    caption: 'Captain On Field',
    aspectHint: 'portrait',
  },
  dhoniPortrait2016: {
    id: 'dhoniPortrait2016',
    src: '/assets/media/dhoni-jan-2016.jpg',
    commonsFile: 'File:Mahendra_Singh_Dhoni_January_2016.jpg',
    license: 'CC BY 3.0 · Bollywood Hungama',
    author: 'Bollywood Hungama',
    alt: 'MS Dhoni portrait 2016',
    caption: 'Captain Cool · 2016',
    aspectHint: 'portrait',
  },
  dhoniPadmaBhushan: {
    id: 'dhoniPadmaBhushan',
    src: '/assets/media/dhoni-padma-bhushan.jpg',
    commonsFile: 'File:Mahendra_Singh_Dhoni_receiving_Padma_Bhushan.jpg',
    license: 'GODL-India · President’s Secretariat',
    author: "President's Secretariat",
    alt: 'MS Dhoni receiving the Padma Bhushan',
    caption: 'Padma Bhushan · 2018',
    aspectHint: 'landscape',
  },
  csk2018Match: {
    id: 'csk2018Match',
    src: '/assets/media/csk-2018-match.jpg',
    commonsFile: 'File:IPL_2018_-_CSK_vs_KXIP.jpg',
    license: 'CC BY-SA 4.0 · Arjun1001',
    author: 'Arjun1001',
    alt: 'Chennai Super Kings vs Kings XI Punjab IPL 2018 match',
    caption: 'IPL 2018 · CSK Comeback Tour',
    aspectHint: 'wide',
  },
  cskChepaukKKR: {
    id: 'cskChepaukKKR',
    src: '/assets/media/csk-chepauk-kkr.jpg',
    commonsFile: 'File:IPL_T20_Chennai_vs_Kolkata.JPG',
    license: 'CC BY 3.0 · Chandrachoodan Gopalakrishnan',
    author: 'Chandrachoodan Gopalakrishnan',
    alt: 'CSK vs KKR at Chepauk Stadium',
    caption: 'Chepauk Nights · Chennai vs Kolkata',
    aspectHint: 'wide',
  },
  csk2014Elim: {
    id: 'csk2014Elim',
    src: '/assets/media/csk-2014-elim.jpg',
    commonsFile: 'File:IPL_Eliminator_2014.jpg',
    license: 'CC BY-SA 3.0 · AroundTheGlobe',
    author: 'AroundTheGlobe',
    alt: 'CSK in IPL 2014 Eliminator match',
    caption: '2014 · CSK Playoff Fire',
    aspectHint: 'wide',
  },
  chepaukNight: {
    id: 'chepaukNight',
    src: '/assets/media/chepauk-csk-night.jpg',
    commonsFile: 'File:MA_Chidambaram_Stadium_In_the_Night_during_a_CSK_Game.jpg',
    license: 'CC BY-SA 3.0 · BCCI/Sportzpics',
    author: 'BCCI/Sportzpics',
    alt: 'M. A. Chidambaram Stadium illuminated during a CSK match',
    caption: 'Chepauk · Fortress in Yellow',
    aspectHint: 'wide',
  },
  chepaukCrowd2013: {
    id: 'chepaukCrowd2013',
    src: '/assets/media/chepauk-ipl-2013.jpg',
    commonsFile: 'File:Chepauk_during_a_IPL_match_in_2013.jpg',
    license: 'CC BY-SA 3.0 · Rohithriaz',
    author: 'Rohithriaz',
    alt: 'Packed Chepauk stands during an IPL match',
    caption: 'Anbuden Roar · 38,000 Strong',
    aspectHint: 'wide',
  },
  chepaukPanorama: {
    id: 'chepaukPanorama',
    src: '/assets/media/chepauk-panorama.jpg',
    commonsFile: 'File:Ma_ChidambaramStadium_panorama.jpg',
    license: 'CC BY-SA 3.0 · Prasad1287',
    author: 'Prasad1287',
    alt: 'Wide panorama of M. A. Chidambaram Stadium',
    caption: 'M. A. Chidambaram Stadium · Chennai',
    aspectHint: 'wide',
  },
  chepaukFloodlight: {
    id: 'chepaukFloodlight',
    src: '/assets/media/chepauk-floodlight.jpg',
    commonsFile: 'File:Floodlight_at_M._A._Chidambaram_Stadium,_Chennai.jpg',
    license: 'CC BY-SA 3.0 · Aravind Sivaraj',
    author: 'Aravind Sivaraj',
    alt: 'Floodlight tower at Chepauk Stadium Chennai',
    caption: 'Chepauk Floodlights',
    aspectHint: 'portrait',
  },
  chepaukYellowStands: {
    id: 'chepaukYellowStands',
    src: '/assets/media/chepauk-yellow-stands.jpg',
    commonsFile: 'File:Yellow_foldable_seats_at_the_M._A._Chidambaram_Stadium.jpg',
    license: 'CC BY-SA 3.0 · Aravind Sivaraj',
    author: 'Aravind Sivaraj',
    alt: 'Yellow stands at M. A. Chidambaram Stadium',
    caption: 'Home of the Yellow Army',
    aspectHint: 'landscape',
  },
  chepaukFan: {
    id: 'chepaukFan',
    src: '/assets/media/chepauk-fan.jpg',
    commonsFile: 'File:A_Cricket_fan_at_the_Chepauk_stadium,_Chennai.jpg',
    license: 'CC BY 2.0 · B. Sandman',
    author: 'B. Sandman',
    alt: 'CSK supporter celebrating at Chepauk Stadium',
    caption: 'Whistle Podu · Unconditional Love',
    aspectHint: 'landscape',
  },
  wankhedeNight: {
    id: 'wankhedeNight',
    src: '/assets/media/wankhede-night.jpg',
    commonsFile: 'File:Wankhede-1.JPG',
    license: 'Public Domain · Sports Fan',
    author: 'Sports Fan',
    alt: 'Wankhede Stadium Mumbai at night',
    caption: 'Wankhede · Mumbai Under Lights',
    aspectHint: 'wide',
  },
  wankhedeWCF: {
    id: 'wankhedeWCF',
    src: '/assets/media/wankhede-wcf.jpg',
    commonsFile: 'File:Wankhede_ICC_WCF.jpg',
    license: 'CC BY-SA 3.0 · G patkar',
    author: 'G patkar',
    alt: 'Wankhede Stadium 2011 World Cup Final',
    caption: 'April 2, 2011 · World Champions',
    aspectHint: 'wide',
  },
  ahmedabadStadium: {
    id: 'ahmedabadStadium',
    src: '/assets/media/ahmedabad-stadium.jpg',
    commonsFile: 'File:Narendra_Modi_Stadium_view_from_the_gallery.jpg',
    license: 'CC BY-SA 4.0 · A Cricket Premi',
    author: 'A Cricket Premi',
    alt: 'Narendra Modi Stadium Ahmedabad',
    caption: '2023 Final · Ahmedabad Midnight',
    aspectHint: 'wide',
  },
  dhoniSignature: {
    id: 'dhoniSignature',
    src: '/assets/media/ms-dhoni-signature.png',
    commonsFile: 'File:MS_Dhoni_signature.png',
    license: 'Public Domain · MS Dhoni',
    author: 'MS Dhoni',
    alt: 'Signature of MS Dhoni',
    caption: 'MS Dhoni Signature',
    aspectHint: 'landscape',
  },
};

export const EARLY_JOURNEY_CHAPTERS: EarlyChapter[] = [
  {
    id: 'ranchi-roots',
    era: '1981 — 2003',
    location: 'RANCHI → KHARAGPUR',
    title: 'FROM TICKET EXAMINER TO NO. 07.',
    hookTag: 'DAV School Goalkeeper · Kharagpur TTE (2001–2003)',
    assetKey: 'dhoniJersey7',
    secondaryAssetKey: 'dhoniKitBat',
  },
  {
    id: 'fearless-entry',
    era: '2004 — 2005',
    location: 'INTERNATIONAL DEBUT',
    title: 'ZERO ON DEBUT. 148 & 183* NEXT.',
    hookTag: 'ODI Debut Dec 23, 2004 · 148 vs PAK · 183* vs SL',
    assetKey: 'dhoniEarlyPortrait',
    secondaryAssetKey: 'dhoniFielding',
  },
  {
    id: 'world-t20',
    era: '2007',
    location: 'JOHANNESBURG',
    title: 'YOUNG CAPTAIN. WORLD T20 CROWN.',
    hookTag: 'Sept 24, 2007 · India Beat Pakistan by 5 Runs',
    assetKey: 'dhoniBatting',
    secondaryAssetKey: 'dhoniKeeping',
  },
  {
    id: 'world-cup-treble',
    era: '2011 — 2013',
    location: 'WANKHEDE → BIRMINGHAM',
    title: '91* AND A SIX INTO IMMORTALITY.',
    hookTag: '2007 WT20 · 2011 CWC · 2013 Champions Trophy',
    assetKey: 'dhoni2011',
    secondaryAssetKey: 'wankhedeWCF',
  },
];

export const CSK_TIMELINE_MILESTONES: IPLMilestone[] = [
  {
    season: '2008',
    year: 2008,
    tag: 'The Arrival',
    headline: 'CHENNAI CHOSE ITS THALA.',
    resultBadge: 'USD 1.5M · Inaugural Finalists',
    verifiedDetail: 'Signed as IPL’s top pick · Led CSK to the 2008 IPL Final',
    venue: 'M. A. Chidambaram Stadium, Chennai',
    assetKey: 'dhoniHayden',
    secondaryAssetKey: 'chepaukPanorama',
  },
  {
    season: '2010',
    year: 2010,
    tag: '1st Crown',
    headline: 'DHARAMSALA STORM TO FIRST GOLD.',
    resultBadge: 'IPL + CLT20 Champions',
    verifiedDetail: 'Final: CSK 168/5 def. MI 146/9 by 22 runs · Won 2010 CLT20',
    venue: 'DY Patil Stadium, Navi Mumbai',
    assetKey: 'chepaukNight',
    secondaryAssetKey: 'cskChepaukKKR',
    isTitleYear: true,
  },
  {
    season: '2011',
    year: 2011,
    tag: '2nd Crown',
    headline: 'UNBEATEN AT CHEPAUK. BACK-TO-BACK.',
    resultBadge: 'IPL Champions · 1st Title Defence',
    verifiedDetail: 'Final: CSK 205/5 def. RCB 147/8 by 58 runs',
    venue: 'M. A. Chidambaram Stadium, Chepauk',
    assetKey: 'chepaukCrowd2013',
    secondaryAssetKey: 'dhoni2011',
    isTitleYear: true,
  },
  {
    season: '2014',
    year: 2014,
    tag: 'CLT20 × 2',
    headline: 'GLOBAL DOMINANCE IN YELLOW.',
    resultBadge: '2nd Champions League T20 Crown',
    verifiedDetail: '2014 CLT20 Final: CSK 185/2 def. KKR 180/6 by 8 wickets',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    assetKey: 'csk2014Elim',
    secondaryAssetKey: 'dhoniBatting',
  },
  {
    season: '2018',
    year: 2018,
    tag: '3rd Crown',
    headline: 'CALLED TOO OLD. RETURNED AS KINGS.',
    resultBadge: 'IPL Champions · Comeback Season',
    verifiedDetail: 'Final: CSK 181/2 def. SRH 178/6 by 8 wickets',
    venue: 'Wankhede Stadium, Mumbai',
    assetKey: 'csk2018Match',
    secondaryAssetKey: 'wankhedeNight',
    isTitleYear: true,
  },
  {
    season: '2021',
    year: 2021,
    tag: '4th Crown',
    headline: 'FROM NO PLAYOFFS TO DUBAI GOLD.',
    resultBadge: 'IPL Champions · 4th Star',
    verifiedDetail: 'Final: CSK 192/3 def. KKR 165/9 by 27 runs',
    venue: 'Dubai International Stadium, UAE',
    assetKey: 'dhoni2016Action',
    secondaryAssetKey: 'dhoniKeeping',
    isTitleYear: true,
  },
  {
    season: '2023',
    year: 2023,
    tag: '5th Crown',
    headline: 'ONE KNEE STRAPPED. FIVE TROPHIES.',
    resultBadge: 'IPL Champions · Record-Tying 5th',
    verifiedDetail: 'May 29, 2023: CSK 171/5 (15 ov, DLS) def. GT 214/4 · Last Ball',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    assetKey: 'dhoni2023',
    secondaryAssetKey: 'ahmedabadStadium',
    isTitleYear: true,
  },
  {
    season: '2024–25',
    year: 2025,
    tag: 'Forever 07',
    headline: '250+ FOR CSK. STILL STANDING GUARD.',
    resultBadge: '220.55 SR (2024) · Stand-In Captain (2025)',
    verifiedDetail: '250th CSK cap Apr 14, 2024 · Led again in 2025 when called',
    venue: 'M. A. Chidambaram Stadium, Chepauk',
    assetKey: 'dhoniPadmaBhushan',
    secondaryAssetKey: 'chepaukYellowStands',
  },
];

export const TACTICAL_MOMENTS: TacticalMoment[] = [
  {
    id: 'wankhede-2011',
    code: '2011 · WANKHEDE',
    title: '91* INTO THE MUMBAI NIGHT',
    matchContext: 'ICC World Cup Final · IND vs SL',
    dateAndVenue: 'Wankhede Stadium, Mumbai',
    verifiedScoreline: 'IND 277/4 · Dhoni 91* (79) · Won by 6 wickets',
    hookQuote: 'Promoted himself to No. 5. Finished it with a straight six.',
    actionAssetKey: 'wankhedeWCF',
    cameraPreset: {
      position: [0, 3.6, 22],
      target: [0, 1.4, -4],
      fov: 40,
      floodlightColor: '#f9cd05',
      showTrajectory: true,
    },
  },
  {
    id: 'dharamsala-2010',
    code: '2010 · DHARAMSALA',
    title: '16 OFF THE FINAL OVER',
    matchContext: 'Must-Win IPL Finale · CSK vs KXIP',
    dateAndVenue: 'HPCA Stadium, Dharamsala',
    verifiedScoreline: 'CSK 195/4 (19.4 ov) · Dhoni 54* (29)',
    hookQuote: '4, 6, 6. Punched the helmet. Ignited a dynasty.',
    actionAssetKey: 'cskChepaukKKR',
    cameraPreset: {
      position: [14, 5.2, 13],
      target: [0, 1.2, 0],
      fov: 44,
      floodlightColor: '#e5c778',
      showTrajectory: true,
    },
  },
  {
    id: 'chinnaswamy-2018',
    code: '2018 · BENGALURU',
    title: '7 SIXES AT CHINNASWAMY',
    matchContext: 'IPL 2018 · CSK vs RCB',
    dateAndVenue: 'M. Chinnaswamy Stadium, Bengaluru',
    verifiedScoreline: 'CSK 207/5 (19.4 ov) · Dhoni 70* (34, SR 205.88)',
    hookQuote: '206 chased down. Vintage finishing under lights.',
    actionAssetKey: 'csk2018Match',
    cameraPreset: {
      position: [-12, 4.4, 15],
      target: [0, 1.5, -2],
      fov: 42,
      floodlightColor: '#f9cd05',
      showTrajectory: true,
    },
  },
  {
    id: 'keeper-instinct',
    code: '0.08s · STUMPS',
    title: 'BLINK AND THE BAILS ARE GONE',
    matchContext: 'All-Time IPL Wicketkeeping Record',
    dateAndVenue: 'M. A. Chidambaram Stadium, Chennai',
    verifiedScoreline: '205 IPL Dismissals · 158 Catches · 47 Stumpings',
    hookQuote: 'Fastest hands in cricket. Calmest eyes behind the stumps.',
    actionAssetKey: 'dhoniKeeping',
    cameraPreset: {
      position: [0.35, 1.75, -13.2],
      target: [0, 1.15, 6],
      fov: 38,
      floodlightColor: '#f4efe6',
      showTrajectory: false,
    },
  },
];

export const LEGACY_STATS: StatHighlight[] = [
  {
    id: 'ipl-trophies',
    value: 5,
    label: 'IPL TROPHIES AS CAPTAIN',
    sublabel: '2010 · 2011 · 2018 · 2021 · 2023',
    category: 'csk',
  },
  {
    id: 'ipl-finals',
    value: 10,
    label: 'IPL FINALS REACHED',
    sublabel: '12 Playoff Appearances',
    category: 'csk',
  },
  {
    id: 'ipl-captain-matches',
    value: 235,
    label: 'IPL MATCHES AS CAPTAIN',
    sublabel: '133 Wins · All-Time Record',
    category: 'ipl',
  },
  {
    id: 'ipl-matches',
    value: 278,
    suffix: '+',
    label: 'IPL MATCHES PLAYED',
    sublabel: '250+ Appearances for CSK',
    category: 'ipl',
  },
  {
    id: 'ipl-runs',
    value: 5439,
    suffix: '+',
    label: 'IPL RUNS SCORED',
    sublabel: 'Avg ~38.30 · 264 Sixes',
    category: 'ipl',
  },
  {
    id: 'ipl-dismissals',
    value: 205,
    label: 'IPL KEEPING DISMISSALS',
    sublabel: '158 Catches · 47 Stumpings',
    category: 'ipl',
  },
  {
    id: 'odi-runs',
    value: 10773,
    label: 'ODI RUNS FOR INDIA',
    sublabel: '350 Matches · Avg 50.57 · 183*',
    category: 'international',
  },
  {
    id: 'icc-treble',
    value: 3,
    label: 'ICC WHITE-BALL TROPHIES',
    sublabel: '2007 WT20 · 2011 CWC · 2013 CT',
    category: 'international',
  },
];

export const TROPHY_EXHIBITS: TrophyExhibit[] = [
  {
    id: 'ipl-2010',
    year: '2010',
    title: 'IPL Championship I',
    competition: 'IPL',
    team: 'Chennai Super Kings',
    opponent: 'Mumbai Indians',
    venue: 'Navi Mumbai',
    scoreline: 'CSK 168/5 vs MI 146/9',
    margin: 'Won by 22 runs',
    metallicTone: 'gold',
    cupProfile: 'ipl',
  },
  {
    id: 'ipl-2011',
    year: '2011',
    title: 'IPL Championship II',
    competition: 'IPL',
    team: 'Chennai Super Kings',
    opponent: 'Royal Challengers Bangalore',
    venue: 'Chepauk, Chennai',
    scoreline: 'CSK 205/5 vs RCB 147/8',
    margin: 'Won by 58 runs · Back-to-Back',
    metallicTone: 'champagne',
    cupProfile: 'ipl',
  },
  {
    id: 'ipl-2018',
    year: '2018',
    title: 'IPL Championship III',
    competition: 'IPL',
    team: 'Chennai Super Kings',
    opponent: 'Sunrisers Hyderabad',
    venue: 'Wankhede, Mumbai',
    scoreline: 'SRH 178/6 vs CSK 181/2',
    margin: 'Won by 8 wickets',
    metallicTone: 'gold',
    cupProfile: 'ipl',
  },
  {
    id: 'ipl-2021',
    year: '2021',
    title: 'IPL Championship IV',
    competition: 'IPL',
    team: 'Chennai Super Kings',
    opponent: 'Kolkata Knight Riders',
    venue: 'Dubai, UAE',
    scoreline: 'CSK 192/3 vs KKR 165/9',
    margin: 'Won by 27 runs',
    metallicTone: 'champagne',
    cupProfile: 'ipl',
  },
  {
    id: 'ipl-2023',
    year: '2023',
    title: 'IPL Championship V',
    competition: 'IPL',
    team: 'Chennai Super Kings',
    opponent: 'Gujarat Titans',
    venue: 'Ahmedabad',
    scoreline: 'GT 214/4 vs CSK 171/5 (DLS)',
    margin: 'Won by 5 wickets · Last Ball',
    metallicTone: 'gold',
    cupProfile: 'ipl',
  },
  {
    id: 'clt20-titles',
    year: '2010 & 2014',
    title: 'Champions League T20 × 2',
    competition: 'CLT20',
    team: 'Chennai Super Kings',
    opponent: 'Warriors & KKR',
    venue: 'Johannesburg · Bengaluru',
    scoreline: '2010: CSK 132/2 · 2014: CSK 185/2',
    margin: 'Won Both Finals by 8 Wickets',
    metallicTone: 'silver-gold',
    cupProfile: 'clt20',
  },
  {
    id: 'icc-treble',
    year: '2007 · 2011 · 2013',
    title: 'The Historic ICC Treble',
    competition: 'ICC',
    team: 'India',
    opponent: 'PAK · SL · ENG',
    venue: 'Johannesburg · Mumbai · Birmingham',
    scoreline: 'WT20 · World Cup · Champions Trophy',
    margin: 'Only Captain in History',
    metallicTone: 'gold',
    cupProfile: 'icc-wc',
  },
];

export const SEED_FAN_MESSAGES: FanMessage[] = [
  {
    id: 'seed-1',
    author: 'Karthik Subramanian',
    city: 'Chennai',
    jerseyNumber: '07',
    message: 'Every summer at Chepauk began the moment No. 7 walked down those stairs.',
    createdAt: 'Chepauk Stand C · Demo Archive',
    isSeed: true,
  },
  {
    id: 'seed-2',
    author: 'Ananya Verma',
    city: 'Ranchi',
    jerseyNumber: '07',
    message: 'From Ranchi to Wankhede—you proved no dream is ever too distant.',
    createdAt: 'Ranchi Chapter · Demo Archive',
    isSeed: true,
  },
  {
    id: 'seed-3',
    author: 'Vikramaditya Rao',
    city: 'Bengaluru',
    jerseyNumber: '07',
    message: '18 off the final over. No. 7 still standing. That was all the hope we needed.',
    createdAt: 'Whistle Podu · Demo Archive',
    isSeed: true,
  },
  {
    id: 'seed-4',
    author: 'Meenakshi Sundaram',
    city: 'Madurai',
    jerseyNumber: '07',
    message: '2018 proved what loyalty looks like. Yellow forever, Thala.',
    createdAt: 'Tamil Nadu · Demo Archive',
    isSeed: true,
  },
];

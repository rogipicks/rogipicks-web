import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ResolveItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  competition?: string;
}

interface ResolveRequest {
  items: ResolveItem[];
  apiKey?: string;
}

// ─── Diccionario extenso de jugadores de tenis (ATP, WTA, Challenger) ───
const TENNIS_PLAYERS_ISO: Record<string, { code: string; country: string }> = {
  // España (ATP & Challenger)
  alcaraz: { code: 'es', country: 'España' },
  nadal: { code: 'es', country: 'España' },
  davidovich: { code: 'es', country: 'España' },
  'davidovich fokina': { code: 'es', country: 'España' },
  bautista: { code: 'es', country: 'España' },
  'bautista agut': { code: 'es', country: 'España' },
  carballes: { code: 'es', country: 'España' },
  'carballes baena': { code: 'es', country: 'España' },
  martinez: { code: 'es', country: 'España' },
  'pedro martinez': { code: 'es', country: 'España' },
  munar: { code: 'es', country: 'España' },
  'alcala gurri': { code: 'es', country: 'España' },
  alcala: { code: 'es', country: 'España' },
  gurri: { code: 'es', country: 'España' },
  'martin tiffon': { code: 'es', country: 'España' },
  tiffon: { code: 'es', country: 'España' },
  'roca batalla': { code: 'es', country: 'España' },
  'sanchez izquierdo': { code: 'es', country: 'España' },
  rincon: { code: 'es', country: 'España' },
  landaluce: { code: 'es', country: 'España' },
  taberner: { code: 'es', country: 'España' },
  'barranco cosano': { code: 'es', country: 'España' },
  'llamas ruiz': { code: 'es', country: 'España' },
  'moro canas': { code: 'es', country: 'España' },
  'merida aguilar': { code: 'es', country: 'España' },
  ramos: { code: 'es', country: 'España' },
  'ramos vinolas': { code: 'es', country: 'España' },
  zapata: { code: 'es', country: 'España' },
  'zapata miralles': { code: 'es', country: 'España' },
  badosa: { code: 'es', country: 'España' },
  sorribes: { code: 'es', country: 'España' },
  'sorribes tormo': { code: 'es', country: 'España' },
  bouzas: { code: 'es', country: 'España' },
  'bouzas maneiro': { code: 'es', country: 'España' },
  masarova: { code: 'es', country: 'España' },
  parrizas: { code: 'es', country: 'España' },

  // Top ATP
  sinner: { code: 'it', country: 'Italia' },
  djokovic: { code: 'rs', country: 'Serbia' },
  zverev: { code: 'de', country: 'Alemania' },
  medvedev: { code: 'ru', country: 'Rusia' },
  rublev: { code: 'ru', country: 'Rusia' },
  hurkacz: { code: 'pl', country: 'Polonia' },
  ruud: { code: 'no', country: 'Noruega' },
  tsitsipas: { code: 'gr', country: 'Grecia' },
  'de minaur': { code: 'au', country: 'Australia' },
  dimitrov: { code: 'bg', country: 'Bulgaria' },
  fritz: { code: 'us', country: 'Estados Unidos' },
  shelton: { code: 'us', country: 'Estados Unidos' },
  paul: { code: 'us', country: 'Estados Unidos' },
  tiafoe: { code: 'us', country: 'Estados Unidos' },
  korda: { code: 'us', country: 'Estados Unidos' },
  giron: { code: 'us', country: 'Estados Unidos' },
  michelsen: { code: 'us', country: 'Estados Unidos' },
  kovacevic: { code: 'us', country: 'Estados Unidos' },
  nakashima: { code: 'us', country: 'Estados Unidos' },
  humbert: { code: 'fr', country: 'Francia' },
  mannarino: { code: 'fr', country: 'Francia' },
  monfils: { code: 'fr', country: 'Francia' },
  fils: { code: 'fr', country: 'Francia' },
  gasquet: { code: 'fr', country: 'Francia' },
  muller: { code: 'fr', country: 'Francia' },
  cazaux: { code: 'fr', country: 'Francia' },
  musetti: { code: 'it', country: 'Italia' },
  berrettini: { code: 'it', country: 'Italia' },
  cobolli: { code: 'it', country: 'Italia' },
  arnaldi: { code: 'it', country: 'Italia' },
  darderi: { code: 'it', country: 'Italia' },
  sonego: { code: 'it', country: 'Italia' },
  shang: { code: 'cn', country: 'China' },
  'shang juncheng': { code: 'cn', country: 'China' },
  zhang: { code: 'cn', country: 'China' },
  'zhang zhizhen': { code: 'cn', country: 'China' },
  bu: { code: 'cn', country: 'China' },
  'bu yunchaokete': { code: 'cn', country: 'China' },
  cerundolo: { code: 'ar', country: 'Argentina' },
  baez: { code: 'ar', country: 'Argentina' },
  etcheverry: { code: 'ar', country: 'Argentina' },
  navone: { code: 'ar', country: 'Argentina' },
  tabilo: { code: 'cl', country: 'Chile' },
  jarry: { code: 'cl', country: 'Chile' },
  garin: { code: 'cl', country: 'Chile' },
  auger: { code: 'ca', country: 'Canadá' },
  'auger-aliassime': { code: 'ca', country: 'Canadá' },
  shapovalov: { code: 'ca', country: 'Canadá' },
  rune: { code: 'dk', country: 'Dinamarca' },
  mensik: { code: 'cz', country: 'República Checa' },
  lehecka: { code: 'cz', country: 'República Checa' },
  machac: { code: 'cz', country: 'República Checa' },
  griekspoor: { code: 'nl', country: 'Países Bajos' },
  'van de zandschulp': { code: 'nl', country: 'Países Bajos' },
  bergs: { code: 'be', country: 'Bélgica' },
  goffin: { code: 'be', country: 'Bélgica' },
  bublik: { code: 'kz', country: 'Kazajistán' },
  shevchenko: { code: 'kz', country: 'Kazajistán' },
  marozsan: { code: 'hu', country: 'Hungría' },
  fucsovics: { code: 'hu', country: 'Hungría' },
  nishioka: { code: 'jp', country: 'Japón' },
  daniel: { code: 'jp', country: 'Japón' },
  mochizuki: { code: 'jp', country: 'Japón' },
  nishikori: { code: 'jp', country: 'Japón' },
  thompson: { code: 'au', country: 'Australia' },
  popirin: { code: 'au', country: 'Australia' },
  popyrin: { code: 'au', country: 'Australia' },
  duckworth: { code: 'au', country: 'Australia' },
  kokkinakis: { code: 'au', country: 'Australia' },
  vukic: { code: 'au', country: 'Australia' },
  purcell: { code: 'au', country: 'Australia' },
  walton: { code: 'au', country: 'Australia' },
  medjedovic: { code: 'rs', country: 'Serbia' },
  kecmanovic: { code: 'rs', country: 'Serbia' },
  lajovic: { code: 'rs', country: 'Serbia' },
  khachanov: { code: 'ru', country: 'Rusia' },
  kotov: { code: 'ru', country: 'Rusia' },
  safin: { code: 'ru', country: 'Rusia' },
  karatsev: { code: 'ru', country: 'Rusia' },
  draper: { code: 'gb', country: 'Reino Unido' },
  norrie: { code: 'gb', country: 'Reino Unido' },
  evans: { code: 'gb', country: 'Reino Unido' },
  murray: { code: 'gb', country: 'Reino Unido' },
  peniston: { code: 'gb', country: 'Reino Unido' },
  struff: { code: 'de', country: 'Alemania' },
  altmaier: { code: 'de', country: 'Alemania' },
  hanfmann: { code: 'de', country: 'Alemania' },
  koepfer: { code: 'de', country: 'Alemania' },
  ofner: { code: 'at', country: 'Austria' },
  thiem: { code: 'at', country: 'Austria' },
  wawrinka: { code: 'ch', country: 'Suiza' },
  stricker: { code: 'ch', country: 'Suiza' },
  haliys: { code: 'fr', country: 'Francia' },
  halys: { code: 'fr', country: 'Francia' },
  rinderknech: { code: 'fr', country: 'Francia' },
  moulet: { code: 'fr', country: 'Francia' },
  moutet: { code: 'fr', country: 'Francia' },
  coric: { code: 'hr', country: 'Croacia' },
  cilic: { code: 'hr', country: 'Croacia' },
  prizmic: { code: 'hr', country: 'Croacia' },
  monteiro: { code: 'br', country: 'Brasil' },
  seyboth: { code: 'br', country: 'Brasil' },
  wild: { code: 'br', country: 'Brasil' },
  'seyboth wild': { code: 'br', country: 'Brasil' },
  fonseca: { code: 'br', country: 'Brasil' },
};

// ─── Diccionario de competiciones / ligas de fútbol ───
const FOOTBALL_LEAGUES_ISO: Record<string, { code: string; country: string }> = {
  // España
  laliga: { code: 'es', country: 'España' },
  'la liga': { code: 'es', country: 'España' },
  'liga ea sports': { code: 'es', country: 'España' },
  'laliga ea sports': { code: 'es', country: 'España' },
  'laliga hypermotion': { code: 'es', country: 'España' },
  'segunda division': { code: 'es', country: 'España' },
  'copa del rey': { code: 'es', country: 'España' },
  'supercopa de espana': { code: 'es', country: 'España' },
  'primera rfef': { code: 'es', country: 'España' },

  // Inglaterra
  'premier league': { code: 'gb', country: 'Inglaterra' },
  premier: { code: 'gb', country: 'Inglaterra' },
  championship: { code: 'gb', country: 'Inglaterra' },
  'fa cup': { code: 'gb', country: 'Inglaterra' },
  'efl cup': { code: 'gb', country: 'Inglaterra' },
  'carabao cup': { code: 'gb', country: 'Inglaterra' },

  // Italia
  'serie a': { code: 'it', country: 'Italia' },
  'serie b': { code: 'it', country: 'Italia' },
  'coppa italia': { code: 'it', country: 'Italia' },

  // Alemania
  bundesliga: { code: 'de', country: 'Alemania' },
  '2. bundesliga': { code: 'de', country: 'Alemania' },
  'dfb pokal': { code: 'de', country: 'Alemania' },

  // Francia
  'ligue 1': { code: 'fr', country: 'Francia' },
  'ligue 2': { code: 'fr', country: 'Francia' },
  'coupe de france': { code: 'fr', country: 'Francia' },

  // Portugal & Holanda
  'liga portugal': { code: 'pt', country: 'Portugal' },
  'primeira liga': { code: 'pt', country: 'Portugal' },
  eredivisie: { code: 'nl', country: 'Países Bajos' },

  // Competiciones continentales
  'champions league': { code: 'eu', country: 'Europa' },
  'uefa champions league': { code: 'eu', country: 'Europa' },
  'europa league': { code: 'eu', country: 'Europa' },
  'conference league': { code: 'eu', country: 'Europa' },
  'nations league': { code: 'eu', country: 'Europa' },
  'copa libertadores': { code: 'un', country: 'Sudamérica' },
  'copa sudamericana': { code: 'un', country: 'Sudamérica' },

  // América & Otras ligas
  mls: { code: 'us', country: 'Estados Unidos' },
  'major league soccer': { code: 'us', country: 'Estados Unidos' },
  'liga mx': { code: 'mx', country: 'México' },
  brasileirao: { code: 'br', country: 'Brasil' },
  'liga profesional': { code: 'ar', country: 'Argentina' },
  'saudi pro league': { code: 'sa', country: 'Arabia Saudita' },
  'super lig': { code: 'tr', country: 'Turquía' },
};

// ─── Diccionario extenso de clubes y selecciones de fútbol ───
const FOOTBALL_TEAMS_ISO: Record<string, { code: string; country: string }> = {
  // España (Primera y Segunda División)
  'real madrid': { code: 'es', country: 'España' },
  madrid: { code: 'es', country: 'España' },
  barcelona: { code: 'es', country: 'España' },
  'fc barcelona': { code: 'es', country: 'España' },
  barca: { code: 'es', country: 'España' },
  'atletico de madrid': { code: 'es', country: 'España' },
  'atletico madrid': { code: 'es', country: 'España' },
  atletico: { code: 'es', country: 'España' },
  atleti: { code: 'es', country: 'España' },
  'athletic club': { code: 'es', country: 'España' },
  'athletic bilbao': { code: 'es', country: 'España' },
  athletic: { code: 'es', country: 'España' },
  bilbao: { code: 'es', country: 'España' },
  'real sociedad': { code: 'es', country: 'España' },
  sociedad: { code: 'es', country: 'España' },
  'la real': { code: 'es', country: 'España' },
  sevilla: { code: 'es', country: 'España' },
  'sevilla fc': { code: 'es', country: 'España' },
  'real betis': { code: 'es', country: 'España' },
  betis: { code: 'es', country: 'España' },
  valencia: { code: 'es', country: 'España' },
  'valencia cf': { code: 'es', country: 'España' },
  villarreal: { code: 'es', country: 'España' },
  celta: { code: 'es', country: 'España' },
  'celta de vigo': { code: 'es', country: 'España' },
  'celta vigo': { code: 'es', country: 'España' },
  osasuna: { code: 'es', country: 'España' },
  getafe: { code: 'es', country: 'España' },
  'rayo vallecano': { code: 'es', country: 'España' },
  rayo: { code: 'es', country: 'España' },
  girona: { code: 'es', country: 'España' },
  espanyol: { code: 'es', country: 'España' },
  'rcd espanyol': { code: 'es', country: 'España' },
  mallorca: { code: 'es', country: 'España' },
  'rcd mallorca': { code: 'es', country: 'España' },
  alaves: { code: 'es', country: 'España' },
  'deportivo alaves': { code: 'es', country: 'España' },
  'las palmas': { code: 'es', country: 'España' },
  'ud las palmas': { code: 'es', country: 'España' },
  leganes: { code: 'es', country: 'España' },
  'cd leganes': { code: 'es', country: 'España' },
  valladolid: { code: 'es', country: 'España' },
  'real valladolid': { code: 'es', country: 'España' },
  'sporting de gijon': { code: 'es', country: 'España' },
  'sporting gijon': { code: 'es', country: 'España' },
  sporting: { code: 'es', country: 'España' },
  oviedo: { code: 'es', country: 'España' },
  'real oviedo': { code: 'es', country: 'España' },
  zaragoza: { code: 'es', country: 'España' },
  'real zaragoza': { code: 'es', country: 'España' },
  levante: { code: 'es', country: 'España' },
  elche: { code: 'es', country: 'España' },
  tenerife: { code: 'es', country: 'España' },
  cadiz: { code: 'es', country: 'España' },
  almeria: { code: 'es', country: 'España' },
  granada: { code: 'es', country: 'España' },
  malaga: { code: 'es', country: 'España' },
  racing: { code: 'es', country: 'España' },
  'racing santander': { code: 'es', country: 'España' },
  eibar: { code: 'es', country: 'España' },
  huesca: { code: 'es', country: 'España' },
  cartagena: { code: 'es', country: 'España' },
  burgos: { code: 'es', country: 'España' },
  albacete: { code: 'es', country: 'España' },
  cordoba: { code: 'es', country: 'España' },
  deportivo: { code: 'es', country: 'España' },
  'deportivo de la coruna': { code: 'es', country: 'España' },
  castellon: { code: 'es', country: 'España' },
  mirandes: { code: 'es', country: 'España' },
  eldense: { code: 'es', country: 'España' },

  // Inglaterra (Premier League)
  'manchester city': { code: 'gb', country: 'Inglaterra' },
  'man city': { code: 'gb', country: 'Inglaterra' },
  mancity: { code: 'gb', country: 'Inglaterra' },
  'manchester united': { code: 'gb', country: 'Inglaterra' },
  'man united': { code: 'gb', country: 'Inglaterra' },
  'man utd': { code: 'gb', country: 'Inglaterra' },
  arsenal: { code: 'gb', country: 'Inglaterra' },
  liverpool: { code: 'gb', country: 'Inglaterra' },
  chelsea: { code: 'gb', country: 'Inglaterra' },
  tottenham: { code: 'gb', country: 'Inglaterra' },
  'tottenham hotspur': { code: 'gb', country: 'Inglaterra' },
  spurs: { code: 'gb', country: 'Inglaterra' },
  'aston villa': { code: 'gb', country: 'Inglaterra' },
  newcastle: { code: 'gb', country: 'Inglaterra' },
  'newcastle united': { code: 'gb', country: 'Inglaterra' },
  brighton: { code: 'gb', country: 'Inglaterra' },
  'west ham': { code: 'gb', country: 'Inglaterra' },
  'west ham united': { code: 'gb', country: 'Inglaterra' },
  everton: { code: 'gb', country: 'Inglaterra' },
  wolves: { code: 'gb', country: 'Inglaterra' },
  wolverhampton: { code: 'gb', country: 'Inglaterra' },
  'crystal palace': { code: 'gb', country: 'Inglaterra' },
  brentford: { code: 'gb', country: 'Inglaterra' },
  fulham: { code: 'gb', country: 'Inglaterra' },
  bournemouth: { code: 'gb', country: 'Inglaterra' },
  'nottingham forest': { code: 'gb', country: 'Inglaterra' },
  leicester: { code: 'gb', country: 'Inglaterra' },
  'leicester city': { code: 'gb', country: 'Inglaterra' },
  southampton: { code: 'gb', country: 'Inglaterra' },
  ipswich: { code: 'gb', country: 'Inglaterra' },
  leeds: { code: 'gb', country: 'Inglaterra' },
  sunderland: { code: 'gb', country: 'Inglaterra' },

  // Italia (Serie A)
  inter: { code: 'it', country: 'Italia' },
  'inter milan': { code: 'it', country: 'Italia' },
  internazionale: { code: 'it', country: 'Italia' },
  milan: { code: 'it', country: 'Italia' },
  'ac milan': { code: 'it', country: 'Italia' },
  juventus: { code: 'it', country: 'Italia' },
  juve: { code: 'it', country: 'Italia' },
  napoli: { code: 'it', country: 'Italia' },
  roma: { code: 'it', country: 'Italia' },
  'as roma': { code: 'it', country: 'Italia' },
  lazio: { code: 'it', country: 'Italia' },
  atalanta: { code: 'it', country: 'Italia' },
  fiorentina: { code: 'it', country: 'Italia' },
  torino: { code: 'it', country: 'Italia' },
  bologna: { code: 'it', country: 'Italia' },
  udinese: { code: 'it', country: 'Italia' },
  genoa: { code: 'it', country: 'Italia' },
  monza: { code: 'it', country: 'Italia' },
  cagliari: { code: 'it', country: 'Italia' },
  verona: { code: 'it', country: 'Italia' },
  empoli: { code: 'it', country: 'Italia' },
  parma: { code: 'it', country: 'Italia' },
  como: { code: 'it', country: 'Italia' },
  lecce: { code: 'it', country: 'Italia' },

  // Alemania (Bundesliga)
  bayern: { code: 'de', country: 'Alemania' },
  'bayern munich': { code: 'de', country: 'Alemania' },
  'bayern munchen': { code: 'de', country: 'Alemania' },
  dortmund: { code: 'de', country: 'Alemania' },
  'borussia dortmund': { code: 'de', country: 'Alemania' },
  bvb: { code: 'de', country: 'Alemania' },
  'bayer leverkusen': { code: 'de', country: 'Alemania' },
  leverkusen: { code: 'de', country: 'Alemania' },
  'rb leipzig': { code: 'de', country: 'Alemania' },
  leipzig: { code: 'de', country: 'Alemania' },
  'eintracht frankfurt': { code: 'de', country: 'Alemania' },
  frankfurt: { code: 'de', country: 'Alemania' },
  stuttgart: { code: 'de', country: 'Alemania' },
  wolfsburg: { code: 'de', country: 'Alemania' },
  freiburg: { code: 'de', country: 'Alemania' },
  'werder bremen': { code: 'de', country: 'Alemania' },
  'borussia monchengladbach': { code: 'de', country: 'Alemania' },
  gladbach: { code: 'de', country: 'Alemania' },
  'union berlin': { code: 'de', country: 'Alemania' },
  mainz: { code: 'de', country: 'Alemania' },
  augsburg: { code: 'de', country: 'Alemania' },
  heidenheim: { code: 'de', country: 'Alemania' },
  'st pauli': { code: 'de', country: 'Alemania' },

  // Francia (Ligue 1)
  psg: { code: 'fr', country: 'Francia' },
  'paris saint-germain': { code: 'fr', country: 'Francia' },
  'paris saint germain': { code: 'fr', country: 'Francia' },
  marseille: { code: 'fr', country: 'Francia' },
  'olympique marseille': { code: 'fr', country: 'Francia' },
  om: { code: 'fr', country: 'Francia' },
  lyon: { code: 'fr', country: 'Francia' },
  'olympique lyon': { code: 'fr', country: 'Francia' },
  monaco: { code: 'fr', country: 'Francia' },
  'as monaco': { code: 'fr', country: 'Francia' },
  lille: { code: 'fr', country: 'Francia' },
  losc: { code: 'fr', country: 'Francia' },
  rennes: { code: 'fr', country: 'Francia' },
  nice: { code: 'fr', country: 'Francia' },
  lens: { code: 'fr', country: 'Francia' },
  brest: { code: 'fr', country: 'Francia' },
  strasbourg: { code: 'fr', country: 'Francia' },
  toulouse: { code: 'fr', country: 'Francia' },
  nantes: { code: 'fr', country: 'Francia' },

  // Portugal
  benfica: { code: 'pt', country: 'Portugal' },
  porto: { code: 'pt', country: 'Portugal' },
  'fc porto': { code: 'pt', country: 'Portugal' },
  'sporting cp': { code: 'pt', country: 'Portugal' },
  'sporting de portugal': { code: 'pt', country: 'Portugal' },
  braga: { code: 'pt', country: 'Portugal' },

  // Países Bajos
  ajax: { code: 'nl', country: 'Países Bajos' },
  psv: { code: 'nl', country: 'Países Bajos' },
  'psv eindhoven': { code: 'nl', country: 'Países Bajos' },
  feyenoord: { code: 'nl', country: 'Países Bajos' },

  // Sudamérica
  boca: { code: 'ar', country: 'Argentina' },
  'boca juniors': { code: 'ar', country: 'Argentina' },
  river: { code: 'ar', country: 'Argentina' },
  'river plate': { code: 'ar', country: 'Argentina' },
  flamengo: { code: 'br', country: 'Brasil' },
  palmeiras: { code: 'br', country: 'Brasil' },
  'sao paulo': { code: 'br', country: 'Brasil' },
  corinthians: { code: 'br', country: 'Brasil' },

  // Selecciones
  espana: { code: 'es', country: 'España' },
  spain: { code: 'es', country: 'España' },
  francia: { code: 'fr', country: 'Francia' },
  france: { code: 'fr', country: 'Francia' },
  inglaterra: { code: 'gb', country: 'Inglaterra' },
  england: { code: 'gb', country: 'Inglaterra' },
  alemania: { code: 'de', country: 'Alemania' },
  germany: { code: 'de', country: 'Alemania' },
  italia: { code: 'it', country: 'Italia' },
  italy: { code: 'it', country: 'Italia' },
  portugal: { code: 'pt', country: 'Portugal' },
  argentina: { code: 'ar', country: 'Argentina' },
  brasil: { code: 'br', country: 'Brasil' },
  brazil: { code: 'br', country: 'Brasil' },
  'paises bajos': { code: 'nl', country: 'Países Bajos' },
  holanda: { code: 'nl', country: 'Países Bajos' },
  netherlands: { code: 'nl', country: 'Países Bajos' },
  croacia: { code: 'hr', country: 'Croacia' },
  uruguay: { code: 'uy', country: 'Uruguay' },
  colombia: { code: 'co', country: 'Colombia' },
  marruecos: { code: 'ma', country: 'Marruecos' },
  japon: { code: 'jp', country: 'Japón' },
  eeuu: { code: 'us', country: 'Estados Unidos' },
  usa: { code: 'us', country: 'Estados Unidos' },
};

// ─── Diccionario de Baloncesto (NBA / ACB) ───
const BASKETBALL_TEAMS_ISO: Record<string, { code: string; country: string }> = {
  lakers: { code: 'us', country: 'Estados Unidos' },
  'los angeles lakers': { code: 'us', country: 'Estados Unidos' },
  celtics: { code: 'us', country: 'Estados Unidos' },
  'boston celtics': { code: 'us', country: 'Estados Unidos' },
  warriors: { code: 'us', country: 'Estados Unidos' },
  'golden state warriors': { code: 'us', country: 'Estados Unidos' },
  bulls: { code: 'us', country: 'Estados Unidos' },
  'chicago bulls': { code: 'us', country: 'Estados Unidos' },
  heat: { code: 'us', country: 'Estados Unidos' },
  'miami heat': { code: 'us', country: 'Estados Unidos' },
  bucks: { code: 'us', country: 'Estados Unidos' },
  mavericks: { code: 'us', country: 'Estados Unidos' },
  knicks: { code: 'us', country: 'Estados Unidos' },
  nuggets: { code: 'us', country: 'Estados Unidos' },
  suns: { code: 'us', country: 'Estados Unidos' },
  clippers: { code: 'us', country: 'Estados Unidos' },
  spurs: { code: 'us', country: 'Estados Unidos' },
  thunder: { code: 'us', country: 'Estados Unidos' },
  wolves: { code: 'us', country: 'Estados Unidos' },
  sixers: { code: 'us', country: 'Estados Unidos' },
  'real madrid baloncesto': { code: 'es', country: 'España' },
  'barcelona basquet': { code: 'es', country: 'España' },
  baskonia: { code: 'es', country: 'España' },
  unicaja: { code: 'es', country: 'España' },
  valencia: { code: 'es', country: 'España' },
  panathinaikos: { code: 'gr', country: 'Grecia' },
  olympiacos: { code: 'gr', country: 'Grecia' },
  fenerbahce: { code: 'tr', country: 'Turquía' },
  monaco: { code: 'fr', country: 'Francia' },
  maccabi: { code: 'il', country: 'Israel' },
  partizan: { code: 'rs', country: 'Serbia' },
  'estrella roja': { code: 'rs', country: 'Serbia' },
};

/** Normaliza texto quitando tildes y signos */
function cleanStr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Resuelve la bandera buscando en un diccionario clave-valor */
function lookupDictionary(
  name: string,
  dict: Record<string, { code: string; country: string }>
): { logoUrl: string; country: string } | null {
  const clean = cleanStr(name);
  if (!clean) return null;

  // 1. Coincidencia exacta o contenida directa
  if (dict[clean]) {
    const val = dict[clean];
    return { logoUrl: `https://flagcdn.com/w160/${val.code.toLowerCase()}.png`, country: val.country };
  }
  for (const [key, val] of Object.entries(dict)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return { logoUrl: `https://flagcdn.com/w160/${val.code.toLowerCase()}.png`, country: val.country };
    }
  }

  // 2. Palabras clave individuales
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (w.length < 3) continue;
    if (dict[w]) {
      const val = dict[w];
      return { logoUrl: `https://flagcdn.com/w160/${val.code.toLowerCase()}.png`, country: val.country };
    }
  }

  return null;
}

/**
 * Resuelve la bandera para fútbol:
 * 1. Busca en el diccionario de equipos de fútbol
 * 2. Si hay competición indicada, busca en ligas
 * 3. Busca en tenis/países generales
 * 4. Consulta a Groq AI si está configurado
 * 5. Por defecto bandera de España
 */
async function resolveFootballFlag(
  teamName: string,
  competition?: string,
  apiKey?: string
): Promise<{ logoUrl: string; country: string }> {
  // 1. Diccionario de equipos
  const teamMatch = lookupDictionary(teamName, FOOTBALL_TEAMS_ISO);
  if (teamMatch) return teamMatch;

  // 2. Diccionario de competiciones / ligas
  if (competition) {
    const compMatch = lookupDictionary(competition, FOOTBALL_LEAGUES_ISO);
    if (compMatch) return compMatch;
  }

  // 3. Diccionario general de países / tenis
  const genMatch = lookupDictionary(teamName, TENNIS_PLAYERS_ISO);
  if (genMatch) return genMatch;

  // 4. Consulta IA rápida con Groq
  const aiMatch = await resolveCountryWithGroq(teamName, 'football', competition, apiKey);
  if (aiMatch) return aiMatch;

  // 5. Fallback por defecto España
  return {
    logoUrl: 'https://flagcdn.com/w160/es.png',
    country: 'España',
  };
}

/**
 * Resuelve la bandera para baloncesto:
 */
async function resolveBasketballFlag(
  teamName: string,
  competition?: string,
  apiKey?: string
): Promise<{ logoUrl: string; country: string }> {
  const basketMatch = lookupDictionary(teamName, BASKETBALL_TEAMS_ISO);
  if (basketMatch) return basketMatch;

  if (competition && cleanStr(competition).includes('nba')) {
    return { logoUrl: 'https://flagcdn.com/w160/us.png', country: 'Estados Unidos' };
  }

  const aiMatch = await resolveCountryWithGroq(teamName, 'basketball', competition, apiKey);
  if (aiMatch) return aiMatch;

  return {
    logoUrl: 'https://flagcdn.com/w160/es.png',
    country: 'España',
  };
}

/**
 * Consulta a Groq AI (Llama 3.1) para identificar el país de cualquier equipo o jugador
 */
async function resolveCountryWithGroq(
  name: string,
  sport: string,
  competition?: string,
  apiKey?: string
): Promise<{ logoUrl: string; country: string } | null> {
  const groqKey =
    apiKey?.trim() ||
    process.env.GROQ_API_KEY?.trim() ||
    process.env.GROK_API_KEY?.trim() ||
    process.env.XAI_API_KEY?.trim() ||
    '';

  if (!groqKey) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente deportivo. Responde estrictamente con un JSON con el código de 2 letras ISO del país principal de este equipo, jugador o liga y el nombre del país en español. Ej: {"code": "es", "country": "España"}',
          },
          { role: 'user', content: `Deporte: ${sport}. Competición: ${competition || 'General'}. Entidad: ${name}` },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed?.code) {
          const code = parsed.code.toLowerCase().trim();
          return {
            logoUrl: `https://flagcdn.com/w160/${code}.png`,
            country: parsed.country || code.toUpperCase(),
          };
        }
      }
    }
  } catch {
    // Continuar con fallback si falla la llamada
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body: ResolveRequest = await req.json();
    const { items, apiKey } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await Promise.all(
      items.map(async (item) => {
        let homeLogo = '';
        let awayLogo = '';
        let homeLabel = '';
        let awayLabel = '';

        if (item.sport === 'tennis') {
          // ─── TENIS: Banderas de países de cada tenista ───
          const localHome =
            lookupDictionary(item.homeTeam, TENNIS_PLAYERS_ISO) ||
            (await resolveCountryWithGroq(item.homeTeam, 'tennis', item.competition, apiKey));

          if (localHome) {
            homeLogo = localHome.logoUrl;
            homeLabel = localHome.country;
          } else {
            homeLogo = 'https://flagcdn.com/w160/es.png';
            homeLabel = 'España';
          }

          const localAway =
            lookupDictionary(item.awayTeam, TENNIS_PLAYERS_ISO) ||
            (await resolveCountryWithGroq(item.awayTeam, 'tennis', item.competition, apiKey));

          if (localAway) {
            awayLogo = localAway.logoUrl;
            awayLabel = localAway.country;
          } else {
            awayLogo = 'https://flagcdn.com/w160/es.png';
            awayLabel = 'España';
          }
        } else if (item.sport === 'football') {
          // ─── FÚTBOL: Banderas de países de cada partido y club ───
          const [homeFlag, awayFlag] = await Promise.all([
            resolveFootballFlag(item.homeTeam, item.competition, apiKey),
            resolveFootballFlag(item.awayTeam, item.competition, apiKey),
          ]);

          homeLogo = homeFlag.logoUrl;
          homeLabel = homeFlag.country;
          awayLogo = awayFlag.logoUrl;
          awayLabel = awayFlag.country;
        } else if (item.sport === 'basketball') {
          // ─── BALONCESTO: Banderas de países de cada equipo ───
          const [homeFlag, awayFlag] = await Promise.all([
            resolveBasketballFlag(item.homeTeam, item.competition, apiKey),
            resolveBasketballFlag(item.awayTeam, item.competition, apiKey),
          ]);

          homeLogo = homeFlag.logoUrl;
          homeLabel = homeFlag.country;
          awayLogo = awayFlag.logoUrl;
          awayLabel = awayFlag.country;
        } else {
          // ─── OTROS DEPORTES ───
          const [homeFlag, awayFlag] = await Promise.all([
            resolveFootballFlag(item.homeTeam, item.competition, apiKey),
            resolveFootballFlag(item.awayTeam, item.competition, apiKey),
          ]);

          homeLogo = homeFlag.logoUrl;
          homeLabel = homeFlag.country;
          awayLogo = awayFlag.logoUrl;
          awayLabel = awayFlag.country;
        }

        return {
          id: item.id,
          homeLogo,
          awayLogo,
          homeLabel,
          awayLabel,
          homeType: 'flag' as const,
          awayType: 'flag' as const,
        };
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error in /api/ai/resolve-logos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al resolver las banderas de los partidos.' },
      { status: 500 }
    );
  }
}

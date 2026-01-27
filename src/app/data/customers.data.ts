export type Product = 'calls' | 'email' | 'chat' | 'cases' | 'other';

export type CustomerStage =
  | 'QUOTE_SENT'
  | 'QUOTE_APPROVED'
  | 'AGREEMENT_DRAFT'
  | 'ACTIVE';

export type CustomerStatus = 'Klar' | 'Åtgärd';


export type Customer = {
  id: string;
  name: string;
  email: string;
  companyId: number;
  createdAt: Date;
  products: Product[];
  usersCount: number;
  monthsLeft?: number;
  valueLeft?: number;
  stage: CustomerStage; 

  currentQuoteId?: string;
  currentAgreementId?: string;
};

export const CUSTOMERS: Customer[] = [

  {
    id: '10001',
    name: 'Malmö Stad',
    email: 'kontakt@malmo.se',
    companyId: 10001,
    createdAt: new Date(2024, 2, 12),
    products: ['calls', 'email', 'chat'],
    usersCount: 24,
    stage: 'ACTIVE',
  },
  {
    id: '10002',
    name: 'Lund Kommun',
    email: 'info@lund.se',
    companyId: 10002,
    createdAt: new Date(2024, 3, 5),
    products: ['calls', 'cases'],
    usersCount: 15,
    stage: 'ACTIVE',
  },
  {
    id: '10003',
    name: 'Region Skåne',
    email: 'kontakt@skane.se',
    companyId: 10003,
    createdAt: new Date(2024, 1, 20),
    products: ['calls', 'email', 'chat', 'cases'],
    usersCount: 42,
    stage: 'ACTIVE',
  },
  {
    id: '10004',
    name: 'Helsingborg Stad',
    email: 'info@helsingborg.se',
    companyId: 10004,
    createdAt: new Date(2024, 4, 18),
    products: ['email'],
    usersCount: 8,
    stage: 'ACTIVE',
  },
  {
    id: '10005',
    name: 'Skånetrafiken',
    email: 'support@skanetrafiken.se',
    companyId: 10005,
    createdAt: new Date(2024, 5, 10),
    products: ['calls', 'chat'],
    usersCount: 17,
    stage: 'ACTIVE',
  },
  {
    id: '10006',
    name: 'Vellinge Kommun',
    email: 'kontakt@vellinge.se',
    companyId: 10006,
    createdAt: new Date(2024, 6, 2),
    products: ['email'],
    usersCount: 5,
    stage: 'ACTIVE',
  },
  {
    id: '10007',
    name: 'Ystad Kommun',
    email: 'info@ystad.se',
    companyId: 10007,
    createdAt: new Date(2024, 7, 9),
    products: ['calls', 'cases'],
    usersCount: 9,
    stage: 'ACTIVE',
  },
  {
    id: '10008',
    name: 'Trelleborg Stad',
    email: 'kontakt@trelleborg.se',
    companyId: 10008,
    createdAt: new Date(2024, 8, 14),
    products: ['calls', 'email'],
    usersCount: 11,
    stage: 'ACTIVE',
  },
  {
    id: '10009',
    name: 'Höganäs Kommun',
    email: 'info@hoganas.se',
    companyId: 10009,
    createdAt: new Date(2024, 9, 21),
    products: ['chat'],
    usersCount: 3,
    stage: 'ACTIVE',
  },
  {
    id: '10010',
    name: 'Burlöv Kommun',
    email: 'kontakt@burlov.se',
    companyId: 10010,
    createdAt: new Date(2024, 10, 3),
    products: ['calls'],
    usersCount: 4,
    stage: 'ACTIVE',
  },

  {
    id: '10011',
    name: 'Kävlinge Kommun',
    email: 'info@kavlinge.se',
    companyId: 10011,
    createdAt: new Date(2024, 11, 1),
    products: ['email', 'cases'],
    usersCount: 6,
    stage: 'ACTIVE',
  },
  {
    id: '10012',
    name: 'Staffanstorp Kommun',
    email: 'kontakt@staffanstorp.se',
    companyId: 10012,
    createdAt: new Date(2025, 0, 10),
    products: ['calls', 'chat'],
    usersCount: 7,
    stage: 'ACTIVE',
  },
  {
    id: '10013',
    name: 'Svedala Kommun',
    email: 'info@svedala.se',
    companyId: 10013,
    createdAt: new Date(2025, 0, 18),
    products: ['email'],
    usersCount: 2,
    stage: 'ACTIVE',
  },
  {
    id: '10014',
    name: 'Landskrona Stad',
    email: 'kontakt@landskrona.se',
    companyId: 10014,
    createdAt: new Date(2025, 0, 25),
    products: ['calls', 'email'],
    usersCount: 13,
    stage: 'ACTIVE',
  },
  {
    id: '10015',
    name: 'Ängelholm Kommun',
    email: 'info@angelholm.se',
    companyId: 10015,
    createdAt: new Date(2025, 1, 2),
    products: ['chat'],
    usersCount: 3,
    stage: 'ACTIVE',
  },
  {
    id: '10016',
    name: 'Bjuv Kommun',
    email: 'kontakt@bjuv.se',
    companyId: 10016,
    createdAt: new Date(2025, 1, 6),
    products: ['cases'],
    usersCount: 4,
    stage: 'ACTIVE',
  },
  {
    id: '10017',
    name: 'Hörby Kommun',
    email: 'info@horby.se',
    companyId: 10017,
    createdAt: new Date(2025, 1, 10),
    products: ['calls'],
    usersCount: 2,
    stage: 'ACTIVE',
  },
  {
    id: '10018',
    name: 'Tomelilla Kommun',
    email: 'kontakt@tomelilla.se',
    companyId: 10018,
    createdAt: new Date(2025, 1, 14),
    products: ['email'],
    usersCount: 3,
    stage: 'ACTIVE',
  },
  {
    id: '10019',
    name: 'Osby Kommun',
    email: 'info@osby.se',
    companyId: 10019,
    createdAt: new Date(2025, 1, 18),
    products: ['calls', 'chat'],
    usersCount: 5,
    stage: 'ACTIVE',
  },
  {
    id: '10020',
    name: 'Perstorp Kommun',
    email: 'kontakt@perstorp.se',
    companyId: 10020,
    createdAt: new Date(2025, 1, 22),
    products: ['email'],
    usersCount: 2,
    stage: 'ACTIVE',
  },

  {
    id: '20001',
    name: 'Nordic Consulting',
    email: 'info@nordicconsulting.se',
    companyId: 20001,
    createdAt: new Date(2025, 0, 5),
    products: [],
    usersCount: 0,
    stage: 'QUOTE_SENT',
  },
  {
    id: '20002',
    name: 'GreenTech AB',
    email: 'kontakt@greentech.se',
    companyId: 20002,
    createdAt: new Date(2025, 0, 12),
    products: [],
    usersCount: 0,
    stage: 'QUOTE_SENT',
  },
  {
    id: '20003',
    name: 'Blue Ocean Group',
    email: 'hello@blueocean.se',
    companyId: 20003,
    createdAt: new Date(2025, 0, 20),
    products: [],
    usersCount: 0,
    stage: 'QUOTE_SENT',
  },
];
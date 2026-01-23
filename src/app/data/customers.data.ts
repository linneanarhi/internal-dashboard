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
};

export const CUSTOMERS: Customer[] = [
  {
    id: '32226',
    name: 'Ticket',
    email: 'ticket@parlametric.com',
    companyId: 32226,
    createdAt: new Date(2025, 6, 2),
    products: ['calls', 'email'],
    usersCount: 1,
    stage: 'ACTIVE',
  },
  {
    id: '11804',
    name: 'Eslövs kommun',
    email: 'kontakt@eslov.se',
    companyId: 11804,
    createdAt: new Date(2024, 10, 14),
    products: ['calls', 'chat', 'cases'],
    usersCount: 12,
    stage: 'QUOTE_SENT',
  },
  {
    id: '99012',
    name: 'Resebolag AB',
    email: 'info@resebolag.se',
    companyId: 99012,
    createdAt: new Date(2025, 1, 3),
    products: ['email'],
    usersCount: 4,
    stage: 'QUOTE_APPROVED',
  },
];


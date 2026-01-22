export type Product = 'calls' | 'email' | 'chat' | 'cases' | 'other';

export type Customer = {
  id: string;
  name: string;
  email: string;
  companyId: number;
  createdAt: Date;
  products: Product[];
  usersCount: number;
};

export const CUSTOMERS: Customer[] = [
  {
    id: '32226',
    name: 'Ticket',
    email: 'ticket@parlametric.com',
    companyId: 32226,
    createdAt: new Date('2025-07-02'),
    products: ['calls', 'email'],
    usersCount: 1,
  },
  {
    id: '11804',
    name: 'Eslövs kommun',
    email: 'kontakt@eslov.se',
    companyId: 11804,
    createdAt: new Date('2024-11-14'),
    products: ['calls', 'chat', 'cases'],
    usersCount: 12,
  },
  {
    id: '99012',
    name: 'Resebolag AB',
    email: 'info@resebolag.se',
    companyId: 99012,
    createdAt: new Date('2025-02-03'),
    products: ['email'],
    usersCount: 4,
  },
];

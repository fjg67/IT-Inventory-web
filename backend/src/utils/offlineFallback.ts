import type { Site } from '@prisma/client';

export type DemoProfile = {
  id: string;
  technicianId: string;
  name: string;
  role: 'ADMIN' | 'TECHNICIAN';
  password: string;
  isActive: boolean;
};

export type DemoSite = {
  id: string;
  name: string;
  address: string | null;
  edsNumber: string | null;
  parentSiteId: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: {
    children: number;
  };
};

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'demo-admin',
    technicianId: 'administrateur',
    name: 'Administrateur',
    password: '!*A1Z2E3R4T5!',
    role: 'ADMIN',
    isActive: true,
  },
];

export const DEMO_SITES: DemoSite[] = [
  {
    id: 'demo-site-stock-5eme',
    name: 'Stock 5ème',
    address: '5ème étage, Bâtiment siège',
    edsNumber: null,
    parentSiteId: null,
    isActive: true,
    createdAt: new Date('2026-02-21T00:37:30.788Z'),
    _count: { children: 0 },
  },
  {
    id: 'demo-site-stock-8eme',
    name: 'Stock 8ème',
    address: '8ème étage, Bâtiment siège',
    edsNumber: null,
    parentSiteId: null,
    isActive: true,
    createdAt: new Date('2026-02-21T00:37:30.788Z'),
    _count: { children: 0 },
  },
  {
    id: 'demo-site-epinal',
    name: 'Epinal',
    address: 'Epinal, Vosges',
    edsNumber: null,
    parentSiteId: null,
    isActive: true,
    createdAt: new Date('2026-03-08T19:06:15.838Z'),
    _count: { children: 0 },
  },
  {
    id: 'demo-site-agences',
    name: 'Agences',
    address: 'Sites régionaux',
    edsNumber: null,
    parentSiteId: null,
    isActive: true,
    createdAt: new Date('2026-03-10T20:52:00.293Z'),
    _count: { children: 2 },
  },
  {
    id: 'demo-site-tcs',
    name: 'TCS',
    address: 'Strasbourg',
    edsNumber: '101',
    parentSiteId: 'demo-site-agences',
    isActive: true,
    createdAt: new Date('2026-03-09T17:59:32.234Z'),
    _count: { children: 0 },
  },
  {
    id: 'demo-site-strasbourg-general',
    name: 'Strasbourg Général',
    address: 'Site principal',
    edsNumber: null,
    parentSiteId: null,
    isActive: true,
    createdAt: new Date('2026-03-08T19:06:15.838Z'),
    _count: { children: 0 },
  },
];

export function isPrismaConnectionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('PrismaClientInitializationError') ||
    message.includes('Authentication failed against database server') ||
    message.includes("Can't reach database server") ||
    message.includes('database credentials for `postgres` are not valid')
  );
}

export function findDemoProfileByTechnicianId(technicianId: string): DemoProfile | undefined {
  return DEMO_PROFILES.find((profile) => profile.technicianId === technicianId);
}

export function findDemoProfileById(id: string): DemoProfile | undefined {
  return DEMO_PROFILES.find((profile) => profile.id === id);
}

export function toPublicDemoSites(): Array<Pick<Site, 'id' | 'name' | 'address' | 'edsNumber' | 'parentSiteId' | 'isActive' | 'createdAt'> & { _count: { children: number } }> {
  return DEMO_SITES.map((site) => ({
    id: site.id,
    name: site.name,
    address: site.address,
    edsNumber: site.edsNumber,
    parentSiteId: site.parentSiteId,
    isActive: site.isActive,
    createdAt: site.createdAt,
    _count: site._count,
  }));
}

export function toFullDemoSite(site: DemoSite): Site & { _count: { children: number } } {
  return {
    id: site.id,
    name: site.name,
    address: site.address,
    edsNumber: site.edsNumber,
    parentSiteId: site.parentSiteId,
    isActive: site.isActive,
    createdAt: site.createdAt,
    updatedAt: site.createdAt,
    _count: site._count,
  } as Site & { _count: { children: number } };
}
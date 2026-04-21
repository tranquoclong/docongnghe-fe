export const queryKeys = {
  accountMe: {
    all: ['account-me'] as const
  },
  accounts: {
    all: ['accounts'] as const,
    detail: (id: number) => ['accounts', id] as const
  },
  guests: {
    all: ['guests'] as const,
    list: (queryParams: unknown) => ['guests', queryParams] as const
  },
  guestOrders: {
    all: ['guest-orders'] as const
  },
  dishes: {
    all: ['dishes'] as const,
    detail: (id: number) => ['dishes', id] as const
  },
  cart: {
    all: ['cart'] as const,
    detail: (id: number) => ['cart', id] as const
  },
  brands: {
    all: ['brands'] as const,
    detail: (id: number) => ['brands', id] as const
  },
  categories: {
    all: ['categories'] as const,
    detail: (id: number) => ['categories', id] as const
  },
  products: {
    all: ['products'] as const,
    detail: (id: number) => ['products', id] as const
  },
  vouchers: {
    all: ['vouchers'] as const,
    manage: ['vouchers-manage'] as const,
    detail: (id: number) => ['vouchers', id] as const,
    code: (code: string) => ['vouchers', code] as const
  },
  orders: {
    all: ['orders'] as const,
    manage: ['orders-manage'] as const,
    list: (queryParams: unknown) => ['orders', queryParams] as const,
    detail: (id: number) => ['orders', id] as const,
  },
  tables: {
    all: ['tables'] as const,
    detail: (id: number) => ['tables', id] as const
  },
  dashboardIndicators: {
    list: (queryParams: unknown) => ['dashboardIndicators', queryParams] as const
  }
} as const


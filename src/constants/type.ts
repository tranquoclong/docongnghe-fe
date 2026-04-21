export const TokenType = {
  ForgotPasswordToken: 'ForgotPasswordToken',
  AccessToken: 'AccessToken',
  RefreshToken: 'RefreshToken',
  TableToken: 'TableToken'
} as const

export const Role = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  SELLER: 'SELLER'
} as const

export const RoleValues = [Role.ADMIN, Role.CLIENT, Role.SELLER] as const

export const DishStatus = {
  Available: 'Available',
  Unavailable: 'Unavailable',
  Hidden: 'Hidden'
} as const

export const DishStatusValues = [DishStatus.Available, DishStatus.Unavailable, DishStatus.Hidden] as const

export const TableStatus = {
  Available: 'Available',
  Hidden: 'Hidden',
  Reserved: 'Reserved'
} as const

export const TableStatusValues = [TableStatus.Available, TableStatus.Hidden, TableStatus.Reserved] as const

export const OrderStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PENDING_PICKUP: 'PENDING_PICKUP',
  PENDING_DELIVERY: 'PENDING_DELIVERY',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
} as const

export const OrderStatusValues = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PENDING_PICKUP,
  OrderStatus.PENDING_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.RETURNED,
  OrderStatus.CANCELLED,
] as const

export const ManagerRoom = 'manager' as const

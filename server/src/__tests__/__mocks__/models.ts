export const CreditPurchase = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
};

export const Attendance = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  destroy: jest.fn(),
};

export const Member = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
};

export const Family = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

export const User = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
};

export const ActivityLog = {
  create: jest.fn(),
  findAll: jest.fn(),
};

export const Course = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

export const CourseType = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

export const Op = {
  in: Symbol('in'),
  like: Symbol('like'),
  gte: Symbol('gte'),
  lte: Symbol('lte'),
};

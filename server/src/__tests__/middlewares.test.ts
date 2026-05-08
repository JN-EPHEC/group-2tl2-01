import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const JWT_SECRET = process.env.JWT_SECRET || 'club_secret_2024';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── jwtAuth ─────────────────────────────────────────────────────────────────

describe('jwtAuth', () => {
  it('appelle next() avec un token valide', () => {
    const token = jwt.sign({ id: 'u1', email: 'a@b.com', role: 'admin', familyId: null }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();

    jwtAuth(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user?.role).toBe('admin');
  });

  it('retourne 401 si aucun header Authorization', () => {
    const req = { headers: {} } as Request;
    const res = mockRes();

    jwtAuth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retourne 401 si le token est invalide', () => {
    const req = { headers: { authorization: 'Bearer token_invalide' } } as Request;
    const res = mockRes();

    jwtAuth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retourne 401 si le header ne commence pas par Bearer', () => {
    const req = { headers: { authorization: 'Basic abc123' } } as Request;
    const res = mockRes();

    jwtAuth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retourne 401 si le token est expiré', () => {
    const token = jwt.sign({ id: 'u1', email: 'a@b.com', role: 'admin', familyId: null }, JWT_SECRET, { expiresIn: -1 });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();

    jwtAuth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─── roleCheck ────────────────────────────────────────────────────────────────

describe('roleCheck', () => {
  const makeReq = (role: string | undefined) =>
    ({ user: role ? { id: 'u1', role } : undefined } as Request);

  it('appelle next() si le rôle est autorisé', () => {
    const req = makeReq('admin');
    const res = mockRes();
    roleCheck('admin', 'coach')(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('retourne 403 si le rôle n\'est pas dans la liste', () => {
    const req = makeReq('family');
    const res = mockRes();
    roleCheck('admin', 'coach')(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('retourne 401 si req.user est undefined', () => {
    const req = makeReq(undefined);
    const res = mockRes();
    roleCheck('admin')(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('accepte n\'importe quel rôle de la liste', () => {
    ['admin', 'coach', 'family'].forEach(role => {
      const req = makeReq(role);
      const res = mockRes();
      const next: NextFunction = jest.fn();
      roleCheck('admin', 'coach', 'family')(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
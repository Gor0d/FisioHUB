import { Request, Response, NextFunction } from 'express';
import { tenantResolver } from '../../src/middleware/tenantResolver';

interface MockRequest extends Partial<Request> {
  headers?: { [key: string]: string };
  params?: { [key: string]: string };
  tenant?: any;
}

interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
}

describe('Tenant Resolver Middleware', () => {
  let req: MockRequest;
  let res: MockResponse;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should resolve tenant from subdomain', async () => {
    req.headers = {
      host: 'test-hospital.fisiohub.com'
    };

    await tenantResolver(req as any, res as Response, next);

    expect(req.tenant).toBeDefined();
    expect(req.tenant.slug).toBe('test-hospital');
    expect(next).toHaveBeenCalled();
  });

  it('should resolve tenant from x-tenant-slug header', async () => {
    req.headers = {
      'x-tenant-slug': 'header-tenant'
    };

    await tenantResolver(req as any, res as Response, next);

    expect(req.tenant).toBeDefined();
    expect(req.tenant.slug).toBe('header-tenant');
    expect(next).toHaveBeenCalled();
  });

  it('should resolve tenant from URL parameter', async () => {
    req.params = {
      tenantSlug: 'param-tenant'
    };

    await tenantResolver(req as any, res as Response, next);

    expect(req.tenant).toBeDefined();
    expect(req.tenant.slug).toBe('param-tenant');
    expect(next).toHaveBeenCalled();
  });

  it('should prioritize subdomain over headers', async () => {
    req.headers = {
      host: 'subdomain-tenant.fisiohub.com',
      'x-tenant-slug': 'header-tenant'
    };

    await tenantResolver(req as any, res as Response, next);

    expect(req.tenant.slug).toBe('subdomain-tenant');
    expect(next).toHaveBeenCalled();
  });

  it('should return 404 for non-existent tenant', async () => {
    req.headers = {
      'x-tenant-slug': 'non-existent-tenant-12345'
    };

    await tenantResolver(req as any, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Tenant not found'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should continue without tenant for public routes', async () => {
    req.headers = {};
    req.params = {};

    await tenantResolver(req as any, res as Response, next);

    expect(req.tenant).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should handle malformed subdomain gracefully', async () => {
    req.headers = {
      host: 'invalid..subdomain.fisiohub.com'
    };

    await tenantResolver(req as any, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should extract tenant from complex subdomain', async () => {
    req.headers = {
      host: 'multi-word-hospital.fisiohub.com'
    };

    await tenantResolver(req as any, res as Response, next);

    expect(req.tenant.slug).toBe('multi-word-hospital');
    expect(next).toHaveBeenCalled();
  });

  it('should handle localhost development domains', async () => {
    req.headers = {
      host: 'localhost:3000',
      'x-tenant-slug': 'dev-tenant'
    };

    await tenantResolver(req as any, res as Response, next);

    expect(req.tenant.slug).toBe('dev-tenant');
    expect(next).toHaveBeenCalled();
  });
});
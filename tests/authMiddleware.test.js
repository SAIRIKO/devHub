const { autenticarToken } = require('../server');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Middleware autenticarToken', () => {
    test('sem token deve retornar 401', () => {
        const req = { headers: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        autenticarToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ erro: "Token não fornecido." });
    });
});

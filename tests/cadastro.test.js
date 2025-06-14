const request = require('supertest');
const { app } = require('../server');

describe('Cadastro de usuário', () => {
    test('erro se dados incompletos', async () => {
        const res = await request(app).post('/api/usuarios').send({});
        expect(res.status).toBe(400);
    });
});

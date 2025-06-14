const { app } = require('../server');  // Ajuste o caminho conforme seu projeto
const request = require('supertest');

let server;

beforeAll(done => {
    server = app.listen(3000, () => {
        console.log('Servidor rodando em http://localhost:3000');
        done();
    });
});

afterAll(done => {
    server.close(done);
});

describe('Testes básicos do servidor', () => {
    test('GET / deve retornar status 200', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
    });
});

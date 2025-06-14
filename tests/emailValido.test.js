const { emailValido } = require('../server');

describe('Validação de email', () => {
    test('email válido deve retornar true', () => {
        expect(emailValido('teste@exemplo.com')).toBe(true);
    });

    test('email inválido deve retornar false', () => {
        expect(emailValido('invalido.com')).toBe(false);
    });
});

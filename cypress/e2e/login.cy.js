describe('Fluxo de Login', () => {
    it('Deve fazer login com sucesso e acessar o dashboard', () => {
        cy.visit('http://localhost:3000');
        cy.get('input[name=email]').type('usuario@devhub.com');
        cy.get('input[name=password]').type('senha123');
        cy.get('button[type=submit]').click();
        cy.url().should('include', '/dashboard');
        cy.contains('Meus Repositórios');
    });

    it('Deve exibir erro com credenciais inválidas', () => {
        cy.visit('http://localhost:3000');
        cy.get('input[name=email]').type('usuario@devhub.com');
        cy.get('input[name=password]').type('errada');
        cy.get('button[type=submit]').click();
        cy.contains('Credenciais inválidas');
    });
});

describe('Gestão de Repositórios', () => {
    it('Deve criar e visualizar um repositório no dashboard', () => {
        cy.visit('http://localhost:3000');
        cy.get('input[name=email]').type('usuario@devhub.com');
        cy.get('input[name=password]').type('senha123');
        cy.get('button[type=submit]').click();

        cy.contains('Criar Repositório').click();
        cy.get('input[name=nome]').type('Repo E2E');
        cy.get('textarea[name=descricao]').type('Descrição do repo');
        cy.get('button[type=submit]').click();

        cy.contains('Repo E2E');
    });
});

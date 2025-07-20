describe('Language Functionality E2E', () => {
  // This setup runs before each test in this file
  beforeEach(() => {
    cy.intercept('GET', '**/api/services/', {
      statusCode: 200,
      body: [{ id: 1, name_de: 'Test Service', name_en: 'Test Service' }],
    }).as('getServices');
    cy.intercept('GET', '**/api/holidays/', { statusCode: 200, body: [] }).as('getHolidays');
  });

  it('should switch language and persist it on the main page', () => {
    cy.visit('/');
    cy.wait(['@getServices', '@getHolidays']);

    // 1. Initial language is German
    cy.contains('h2', 'Termin buchen').should('be.visible');

    // 2. Switch to English
    cy.get('button').contains('EN').click();
    cy.contains('h2', 'Book an appointment').should('be.visible');

    // 3. Check localStorage and reload
    cy.window().its('localStorage').invoke('getItem', 'appLanguage').should('eq', 'en');
    cy.reload();
    cy.wait(['@getServices', '@getHolidays']);

    // 4. Assert language is still English after reload
    cy.contains('h2', 'Book an appointment').should('be.visible');
  });

  it('should display the 404 page in the correct persisted language', () => {
    // Set the language to English in localStorage before visiting
    localStorage.setItem('appLanguage', 'en');

    cy.visit('/this-page-does-not-exist', { failOnStatusCode: false });

    // Assert the 404 page is in English
    cy.contains('h2', '404 - Page Not Found').should('be.visible');
  });
});

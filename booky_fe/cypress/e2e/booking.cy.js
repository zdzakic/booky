describe('Booking Form E2E', () => {
  beforeEach(() => {
    // This setup runs before each test in this file
    cy.intercept('GET', '**/api/services/', {
      statusCode: 200,
      body: [{ id: 1, name_de: 'Test Service', name_en: 'Test Service' }],
    }).as('getServices');
    cy.intercept('GET', '**/api/holidays/', { statusCode: 200, body: [] }).as('getHolidays');

    cy.visit('/');
    cy.wait(['@getServices', '@getHolidays']);
  });

  it('displays all form elements correctly', () => {
    // 1. Assert that the correct heading is visible
    cy.contains('h2', 'Termin buchen').should('be.visible');

    // 2. Assert that all mandatory input fields are visible
    cy.get('input[placeholder="Vollständiger Name"]').should('be.visible');
    cy.get('input[placeholder="Telefonnummer"]').should('be.visible');
    cy.get('input[placeholder="E-Mail"]').should('be.visible');
    cy.get('input[placeholder="Kennzeichen (z.B. ZH-12345)"]').should('be.visible');
    cy.get('select').should('be.visible');

    // 3. Select a service and verify the selection
    cy.get('select').select('Test Service');
    cy.get('select').should('have.value', '1');

    // 4. Assert that date picker and submit button are visible
    cy.contains('button', 'Datum wählen').should('be.visible');
    cy.contains('button', 'Termin anfragen').should('be.visible');

    // 5. Assert that the wheel storage checkbox is visible
    cy.contains('label', 'Räder bei uns eingelagert').should('be.visible');
  });

  it('allows a user to fill all form fields', () => {
    // Fill in the form fields and assert their values
    cy.get('input[placeholder="Vollständiger Name"]').type('Max Mustermann').should('have.value', 'Max Mustermann');
    cy.get('input[placeholder="Telefonnummer"]').type('0123456789').should('have.value', '0123456789');
    cy.get('input[placeholder="E-Mail"]').type('max.mustermann@example.com').should('have.value', 'max.mustermann@example.com');
    cy.get('input[placeholder="Kennzeichen (z.B. ZH-12345)"]').type('ZH-98765').should('have.value', 'ZH-98765');

    // Select a service
    cy.get('select').select('Test Service').should('have.value', '1');

    // Check the checkbox
    cy.get('#isStored').check().should('be.checked');
  });
});

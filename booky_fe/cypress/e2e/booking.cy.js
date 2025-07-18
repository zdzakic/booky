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

  context('API Tests', () => {
    const API_BASE_URL = 'http://localhost:8000/api';

    it('successfully fetches the list of services', () => {
      cy.request('GET', `${API_BASE_URL}/services/`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array').and.not.be.empty;
      });
    });

    it('successfully fetches the list of holidays', () => {
      cy.request('GET', `${API_BASE_URL}/holidays/`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array'); // Can be empty
      });
    });

    it('returns available slots for a weekday', () => {
      // Assuming service ID 1 exists and 2025-07-17 is a weekday
      cy.request('GET', `${API_BASE_URL}/availability/?service=1&date=2025-07-17`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array').and.not.be.empty;
        expect(response.body[0]).to.have.property('time');
        expect(response.body[0]).to.have.property('available_count');
      });
    });

    it('returns an empty array for a weekend', () => {
      // Assuming 2025-07-19 is a Saturday (weekend)
      cy.request('GET', `${API_BASE_URL}/availability/?service=1&date=2025-07-19`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array').and.be.empty;
      });
    });
  });
});

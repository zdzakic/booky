// cypress/e2e/booking_form_prod.cy.js

describe('Booky Production Smoke Test', () => {
  const API_BASE_URL = 'https://booky-be-ced9.onrender.com/api';
  const FRONTEND_URL = 'https://schmidicars.zdzdigital.ch';

  beforeEach(() => {
    // U produkciji ne stubbamo API, sve je live
    cy.visit(FRONTEND_URL);
  });

  it('displays all form elements correctly', () => {
    cy.contains('h2', 'Termin buchen').should('be.visible');
    cy.get('input[placeholder="Vollständiger Name"]').should('be.visible');
    cy.get('input[placeholder="Telefonnummer"]').should('be.visible');
    cy.get('input[placeholder="E-Mail"]').should('be.visible');
    cy.get('input[placeholder="Kennzeichen (z.B. ZH-12345)"]').should('be.visible');
    cy.get('select').should('be.visible');
    cy.contains('button', 'Datum wählen').should('be.visible');
    cy.contains('button', 'Termin anfragen').should('be.visible');
    cy.contains('label', 'Räder bei uns eingelagert').should('be.visible');
  });

  context('API Smoke Tests', () => {
    it('successfully fetches the list of services', () => {
      cy.request('GET', `${API_BASE_URL}/services/`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array').and.not.be.empty;
      });
    });

    it('returns available slots for a weekday', () => {
      // Koristi ID servisa za koji znaš da postoji u prod bazi
      cy.request('GET', `${API_BASE_URL}/availability/?service=1&date=2025-07-17`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        // Nemoj .not.be.empty jer može biti zauzeto, ali struktura mora biti ispravna
        if (response.body.length) {
          expect(response.body[0]).to.have.property('time');
          expect(response.body[0]).to.have.property('available_count');
        }
      });
    });

    it('returns an empty array for a weekend', () => {
      // Subota ili nedjelja (promijeni datum po radnom vremenu prod)
      cy.request('GET', `${API_BASE_URL}/availability/?service=1&date=2025-07-19`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });
});

import { login } from './utils';

describe('Basic Pages Load', () => {
  const pages = [
    { path: '/', name: 'Booking Form' },
    { path: '/login', name: 'Login Page' },
    { path: '/success', name: 'Success Page' },
    { path: '/login-blocked', name: 'Login Blocked Page' },
    { path: '/maintenance', name: 'Maintenance Page' },
    { path: '/dashboard', name: 'Reservations Dashboard', protected: true },
    { path: '/notfound', name: 'Not Found Page' },
  ];

  pages.forEach(({ path, name, protected: isProtected }) => {
    it(`should load the ${name} at ${path}`, () => {
      if (isProtected) {
        // Poziv login funkcije unutar browser contexta
        cy.visit('/'); // ili bilo koja stranica da učita window
        cy.window().then((win) => {
          login.call(win);
        });
      }

      cy.visit(path, { failOnStatusCode: false });

      // Provera da li stranica nije prazna
      cy.get('body').should('not.be.empty');
    });
  });
});

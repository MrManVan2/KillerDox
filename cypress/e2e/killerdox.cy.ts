describe('KillerDox App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  it('should handle full user flow from authentication to build creation', () => {
    // Visit the main page
    cy.visit('/');
    
    // Should see password gate
    cy.contains('KillerDox').should('be.visible');
    cy.contains('Enter the realm of the Entity').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    
    // Try with wrong password first
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid password').should('be.visible');
    
    // Enter correct password
    cy.get('input[type="password"]').clear().type('bloodyhook2023');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to builder
    cy.url().should('include', '/builder');
    cy.contains('KillerDox Builder').should('be.visible');
    
    // Should see the layout with placeholder slots
    cy.get('[role="button"]').should('have.length.at.least', 8); // 1 offering + 1 killer + 1 platform + 2 addons + 4 perks = 9, but some might not have role
    
    // Test killer selection
    cy.get('img[alt*="Killer"]').first().click();
    cy.contains('Select killer').should('be.visible');
    cy.get('input[placeholder*="Search killers"]').should('be.visible');
    
    // Search and select a killer
    cy.get('input[placeholder*="Search killers"]').type('Trapper');
    cy.contains('The Trapper').click();
    cy.get('[aria-label*="Selected The Trapper"]').should('exist');
    
    // Test perk selection
    cy.get('img[alt*="Perk"]').first().click();
    cy.contains('Select perk').should('be.visible');
    
    // Select multiple perks
    cy.contains('Brutal Strength').click();
    cy.contains('Enduring').click();
    cy.contains('Hex: Ruin').click();
    cy.contains('No One Escapes Death').click();
    
    // Modal should close automatically when limit reached
    cy.get('h2').contains('Select perk').should('not.exist');
    
    // Test addon selection
    cy.get('img[alt*="Addon"]').first().click();
    cy.contains('Select addon').should('be.visible');
    cy.contains('Tar Bottle').click();
    cy.contains('Padded Jaws').click();
    
    // Test offering selection
    cy.get('img[alt*="Offering"]').click();
    cy.contains('Select offering').should('be.visible');
    cy.contains('Bloody Party Streamers').click();
    
    // Test platform selection
    cy.get('img[alt*="platform"]').click();
    cy.contains('Select platform').should('be.visible');
    cy.contains('Steam').click();
    
    // All selections should be visible
    cy.get('[aria-label*="Selected"]').should('have.length.at.least', 8);
    
    // Test reset functionality
    cy.contains('Reset Build').click();
    
    // All selections should be cleared (back to placeholders)
    cy.get('[aria-label*="Selected"]').should('not.exist');
    cy.get('img[alt*="placeholder"]').should('have.length.at.least', 8);
    
    // Test persistence after page reload
    // First, select a killer again
    cy.get('img[alt*="Killer"]').click();
    cy.contains('The Trapper').click();
    
    // Reload the page
    cy.reload();
    
    // Should still be on builder page (auth persisted)
    cy.url().should('include', '/builder');
    cy.contains('KillerDox Builder').should('be.visible');
  });
  
  it('should redirect to auth when not authenticated', () => {
    // Try to visit builder directly without authentication
    cy.visit('/builder');
    
    // Should redirect to auth page
    cy.url().should('not.include', '/builder');
    cy.contains('KillerDox').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });
  
  it('should handle keyboard navigation', () => {
    // Authenticate first
    cy.visit('/');
    cy.get('input[type="password"]').type('bloodyhook2023');
    cy.get('button[type="submit"]').click();
    
    // Test keyboard navigation
    cy.get('body').tab(); // Should focus first slot
    cy.focused().should('have.attr', 'role', 'button');
    
    // Test Enter key to open modal
    cy.focused().type('{enter}');
    cy.get('h2').contains('Select').should('be.visible');
    
    // Test Escape to close modal
    cy.get('body').type('{esc}');
    cy.get('h2').contains('Select').should('not.exist');
  });
}); 
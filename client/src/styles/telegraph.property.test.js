import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Property-Based Tests for Period-Accurate Styling
 * 
 * These tests verify the correctness properties of the visual styling,
 * particularly the typewriter font application across all UI elements.
 * 
 * Feature: telegraph-ai-agent, Property 18: Typewriter Font Application
 * Validates: Requirements 3.2
 */

describe('Styling Properties', () => {
  
  // Read the CSS file content for testing
  const cssPath = join(__dirname, 'telegraph.css');
  const cssContent = readFileSync(cssPath, 'utf-8');

  /**
   * Feature: telegraph-ai-agent, Property 18: Typewriter Font Application
   * Validates: Requirements 3.2
   * 
   * For any CSS class defined in the stylesheet, the font-family rule
   * should include a typewriter-style font or reference a font variable.
   */
  it('Property 18: Typewriter Font Application - CSS rules use typewriter fonts', () => {
    // Define the typewriter fonts we expect to see
    const typewriterFonts = ['Courier Prime', 'Special Elite', 'Courier New', 'Courier', 'monospace'];
    const fontVariables = ['--font-primary', '--font-display'];
    
    /**
     * Helper function to check if a font-family string contains a typewriter font or variable
     */
    const hasTypewriterFontOrVariable = (fontFamily) => {
      if (!fontFamily) return false;
      
      const lowerFontFamily = fontFamily.toLowerCase();
      
      // Check if it uses a font variable (which we verify separately)
      const usesVariable = fontVariables.some(v => lowerFontFamily.includes(v));
      if (usesVariable) return true;
      
      // Check if it directly specifies a typewriter font
      return typewriterFonts.some(font => 
        lowerFontFamily.includes(font.toLowerCase())
      );
    };

    /**
     * Extract font-family declarations from CSS content
     */
    const extractFontFamilies = (css) => {
      const fontFamilyRegex = /font-family:\s*([^;]+);/gi;
      const matches = [];
      let match;
      
      while ((match = fontFamilyRegex.exec(css)) !== null) {
        matches.push(match[1].trim());
      }
      
      return matches;
    };

    const fontFamilies = extractFontFamilies(cssContent);
    
    // Verify that we found font-family declarations
    expect(fontFamilies.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...fontFamilies),
        (fontFamily) => {
          // Verify that each font-family declaration includes a typewriter font or variable
          expect(
            hasTypewriterFontOrVariable(fontFamily),
            `Font-family "${fontFamily}" should include a typewriter font or font variable`
          ).toBe(true);
        }
      ),
      { numRuns: Math.min(100, fontFamilies.length) }
    );
  });

  /**
   * Additional property test: Verify specific CSS classes have typewriter fonts defined
   */
  it('Property 18 (Specific Classes): All defined CSS classes reference typewriter font variables', () => {
    // List of CSS classes that should have typewriter fonts
    const cssClasses = [
      'app-title',
      'app-subtitle',
      'key-label',
      'key-status',
      'sequence-label',
      'sequence-value',
      'display-label',
      'display-value',
      'history-text',
      'history-morse',
      'status-text',
      'send-button',
      'error-indicator'
    ];

    const typewriterFonts = ['Courier Prime', 'Special Elite', 'Courier New', 'Courier', 'monospace'];
    const fontVariables = ['--font-primary', '--font-display'];
    
    const hasTypewriterFontOrVariable = (rule) => {
      if (!rule) return false;
      const lowerRule = rule.toLowerCase();
      
      // Check if it uses a font variable
      const usesVariable = fontVariables.some(v => lowerRule.includes(v));
      if (usesVariable) return true;
      
      // Check if it directly specifies a typewriter font
      return typewriterFonts.some(font => lowerRule.includes(font.toLowerCase()));
    };

    /**
     * Extract font-family rules for specific classes
     */
    const extractClassFontFamily = (css, className) => {
      // Match class selector and its font-family rule
      const classRegex = new RegExp(`\\.${className}\\s*{[^}]*font-family:\\s*([^;]+);`, 'i');
      const match = css.match(classRegex);
      return match ? match[1].trim() : null;
    };

    fc.assert(
      fc.property(
        fc.constantFrom(...cssClasses),
        (className) => {
          const fontFamily = extractClassFontFamily(cssContent, className);
          
          // If the class has a direct font-family rule, verify it
          if (fontFamily) {
            expect(
              hasTypewriterFontOrVariable(fontFamily),
              `Class "${className}" should use a typewriter font or font variable. Got: ${fontFamily}`
            ).toBe(true);
          }
          // If no direct rule, it should inherit from body or use CSS variables
          // which we verify in the CSS Variables test
        }
      ),
      { numRuns: cssClasses.length }
    );
  });

  /**
   * Property test: Verify CSS variables are properly defined with typewriter fonts
   */
  it('Property 18 (CSS Variables): Font CSS variables are defined with typewriter fonts', () => {
    const typewriterFonts = ['Courier Prime', 'Special Elite', 'Courier New', 'Courier', 'monospace'];
    
    /**
     * Extract CSS variable definitions from :root
     */
    const extractCSSVariables = (css) => {
      const rootRegex = /:root\s*{([^}]+)}/i;
      const match = css.match(rootRegex);
      
      if (!match) return {};
      
      const variables = {};
      const varRegex = /--([\w-]+):\s*([^;]+);/g;
      let varMatch;
      
      while ((varMatch = varRegex.exec(match[1])) !== null) {
        variables[`--${varMatch[1]}`] = varMatch[2].trim();
      }
      
      return variables;
    };

    const cssVariables = extractCSSVariables(cssContent);
    
    // Check --font-primary variable
    expect(cssVariables['--font-primary']).toBeDefined();
    const fontPrimary = cssVariables['--font-primary'];
    expect(
      typewriterFonts.some(font => fontPrimary.toLowerCase().includes(font.toLowerCase())),
      `--font-primary should include a typewriter font. Got: ${fontPrimary}`
    ).toBe(true);
    
    // Check --font-display variable
    expect(cssVariables['--font-display']).toBeDefined();
    const fontDisplay = cssVariables['--font-display'];
    expect(
      typewriterFonts.some(font => fontDisplay.toLowerCase().includes(font.toLowerCase())),
      `--font-display should include a typewriter font. Got: ${fontDisplay}`
    ).toBe(true);
  });

});

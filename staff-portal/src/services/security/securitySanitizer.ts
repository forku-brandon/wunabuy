/**
 * Input Sanitization & XSS Protection Engine — Wunabuy Staff Portal (OWASP A05:2025 Mitigation)
 * 
 * Prevents Cross-Site Scripting (XSS), script tag injection, and DOM injection.
 */

import { securityLogger } from './securityLogger';

/**
 * Escapes special HTML entities in a raw input string.
 */
export function escapeHTML(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips dangerous HTML tags (<script>, <iframe>, javascript:, onload=, etc.) from input strings.
 */
export function sanitizeInput(input: string, context = 'form_input'): string {
  if (typeof input !== 'string') return '';
  
  const rawLength = input.length;
  
  // Strip malicious tags and event handlers
  let cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, 'no-javascript:')
    .replace(/on\w+\s*=/gi, 'no-event=')
    .replace(/data:\s*text\/html/gi, 'no-data-html:');

  // If malicious script tags were stripped, record a security audit log
  if (cleaned.length !== rawLength) {
    securityLogger.logEvent({
      action_code: 'INPUT_XSS_STRIPPED',
      action_description: `Potentially dangerous HTML/Script tags stripped from input in ${context}.`,
      security_level: 'WARNING',
      meta: { context, original_length: rawLength, cleaned_length: cleaned.length },
    });
  }

  return cleaned.trim();
}

/**
 * Sanitize search inputs for data tables and filter bars.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  const sanitized = sanitizeInput(query, 'search_filter');
  // Remove SQL/Wildcard dangerous characters if any
  return sanitized.replace(/['";\\]/g, '');
}

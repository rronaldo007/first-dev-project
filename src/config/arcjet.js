import 'dotenv/config';

import arcjet, { shield, detectBot } from '@arcjet/node';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // Track requests by source IP address.
  characteristics: ['ip.src'],
  rules: [
    // Shield protects against common attacks e.g. SQL injection, XSS.
    shield({ mode: 'LIVE' }),
    // Block all bots except common search engines. Use 'DRY_RUN' to log only.
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),
  ],
  // Rate limiting is added per-request in the security middleware so the
  // limit can vary by user role (see #middleware/security.middleware.js).
});

export default aj;

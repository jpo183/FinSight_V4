/**
 * Central exports for AI Query Service
 * Location: server/services/aiQueryService/index.js
 * 
 * This file serves as the main entry point for all AI Query Service exports.
 * It should be placed in: server/services/aiQueryService/index.js
 * 
 * Directory structure:
 * server/services/aiQueryService/
 *   ├── index.js (THIS FILE)
 *   ├── base/
 *   │   └── baseQuery.js
 *   └── sales/
 *       └── deals.js
 */

const BaseQueryService = require('./base/baseQuery');
const SalesSchema = require('./schemas/sales/tables');
const SalesPrompts = require('./prompts/sales/deals');

module.exports = {
  BaseQueryService,
  SalesSchema,
  SalesPrompts
}; 
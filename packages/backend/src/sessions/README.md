# Sessions Directory

This directory contains session management functionality for the v2.0 platform.

## Structure

- `session.service.ts` - Core session management service
- `session.controller.ts` - REST API endpoints for sessions
- `session.types.ts` - TypeScript interfaces and types
- `session.repository.ts` - Database operations for sessions

## Session Lifecycle

1. Session creation when a use case is launched
2. Real-time status updates during processing
3. Session completion with report generation
4. Session archival for audit trail
# Deployment Configuration Threat Model

## Scope

This review covers the committed Sites hosting manifest at `app/.openai/hosting.json` in revision `85dc747ad793cbf03c97d53099f666efef3cbcd4`.

## Relevant risks

- Accidental inclusion of credentials, access tokens, or private endpoints.
- Enabling database or object-storage capabilities that the application has not selected or reviewed.
- Binding the deployment to an unintended Sites project.

## Observed controls

- The manifest contains only an opaque Sites project identifier.
- The project identifier is deployment metadata, not an authentication secret.
- D1 and R2 bindings are explicitly null, so the manifest enables no database or object-storage capability.
- No token, credential, private key, user data, or environment-specific secret is present.

## Result

No security vulnerability was identified in the scoped deployment configuration.

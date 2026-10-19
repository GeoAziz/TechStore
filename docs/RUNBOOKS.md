# Operations & Deployment Runbooks

## Overview
This runbook covers routine operations, deployments, rollbacks, and incident response for the TechStore Next.js application deployed on Vercel.

---

## 1. Deployments

### Production Deployment via CLI
To deploy the current checked-out commit to production on Vercel:
```bash
# Ensure local dependencies are clean and linked
vercel link --project tech-store

# Pull latest environment variables (if needed)
vercel env pull .env.local

# Deploy to production
vercel --prod
```

### Automatic Git Deployments
Pushing to the `main` branch automatically triggers a production deployment in Vercel once GitHub Actions CI checks pass.

---

## 2. Rollback Procedures

If an incident or regression occurs immediately after a deployment:

### Instant CLI Rollback
```bash
# List recent deployments to find the last known healthy deployment URL or ID
vercel list

# Promote the prior healthy deployment directly to production
vercel rollback <DEPLOYMENT_ID_OR_URL>
```

### Git Revert Rollback
```bash
git checkout main
git pull origin main
git revert HEAD -m 1  # if merge commit, or git revert HEAD
git push origin main
```

---

## 3. Secret & Credential Rotation

### Environment Variables Managed in Vercel:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Rotating a Secret
1. Update the variable in Vercel Project Settings -> **Environment Variables** or via CLI:
   ```bash
   vercel env rm <KEY> production
   vercel env add <KEY> production
   ```
2. Trigger a redeployment to ensure all serverless functions and build artifacts receive the updated secret:
   ```bash
   vercel --prod
   ```

---

## 4. Health Checks & Synthetic Monitoring

- **Endpoint**: `/api/health`
- **Expected Status**: `200 OK`
- **Payload format**:
  ```json
  {
    "status": "ok",
    "uptime": 123.45,
    "timestamp": "2026-10-19T16:00:00.000Z"
  }
  ```
- **Uptime Monitoring**: Add this endpoint to your synthetic monitoring tool (e.g., UptimeRobot, BetterStack, or Datadog Synthetic Monitoring) with an alert threshold of 2 consecutive failures.


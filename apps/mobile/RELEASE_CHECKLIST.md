# Cookly Android Release Checklist

1. Deploy the API and managed MySQL database over HTTPS.
2. Replace `https://api.example.com` in `eas.json` with the deployed API URL.
3. Publish `PRIVACY_POLICY.md` at a public HTTPS URL and add it to the Play listing.
4. Create a production Expo project with `eas init` and keep the generated project ID in app configuration.
5. Add production icon and splash image assets to `app.json` before the first store build.
6. Run `npm run android:preview` and test registration, login, recipe loading, and favorites on a physical Android device.
7. Run `npm run android:production` to create the signed `.aab` bundle.
8. Upload the bundle to Google Play internal testing and complete the data safety, content rating, screenshots, and store listing forms.
9. Promote the tested release from internal testing to production.

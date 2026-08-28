# LouFind on an iPhone

This is an **Expo Go preview of the existing LouFind web app**, displayed in a native WebView. It is not a full React Native rewrite or an App Store release. The website stays in the parent folder; this folder has its own React and Expo dependencies.

## First-time setup

1. On the iPhone, install [Expo Go from the App Store](https://apps.apple.com/ph/app/expo-go/id982107779).
2. Connect the iPhone and Mac to the same trusted, private Wi-Fi.
3. From the parent LouFind folder, run `npm install` and `npm --prefix mobile install`.
4. Start the website in one terminal with `npm run dev:lan`.
5. Start Expo in another terminal with `npm run phone`.
6. Scan `outputs/loufind-expo-qr.png` with the iPhone Camera and choose **Open in Expo Go**. Allow **Local Network** access when asked.

Keep the Mac awake and both commands running. The phone command detects the Mac's current LAN address and regenerates the QR code. Rerun it after changing Wi-Fi networks. To choose a specific local interface, set `LOUFIND_HOST` to an IPv4 address assigned to the Mac.

The iPhone Camera must scan the **Expo** QR code, not an ordinary website link. For a Safari fallback, open the network URL printed by `npm run dev:lan`.

## Compatibility

As verified on 28 August 2026, the App Store version of Expo Go supports **SDK 54**. This companion uses SDK 54, React 19.1, and React Native 0.81.5. Do not install Expo in the parent web package or upgrade this companion to SDK 57 without also changing the iPhone client. See [Expo's compatibility guidance](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

Patched Metro 0.83.8, PostCSS 8.5.26, and the Xcode tooling's UUID dependency are pinned in `overrides` to address inherited development-tool advisories. Expo SDK 54's CLI assumes an older Metro watcher event format, so the supplied start commands use Expo's supported `CI=1` mode. **Restart the phone command after changing native files in this folder.** The web UI still updates through the separate Vite server. Native bundle export and dependency compatibility checks are verified with these overrides.

## What to expect

- The existing LouFind screens, reports, matching, claims, roles, and loading screen run inside the preview.
- Native safe-area padding keeps controls clear of the iPhone notch and home indicator. Connection failures show a retry screen.
- Each device and browser has its own local demo data. Nothing syncs between the Mac, iPhone Safari, and Expo Go. Existing Mac data is not migrated or deleted.
- The preview needs the Mac and Wi-Fi. It is not an offline native installation.
- Use fabricated demo data only. Local HTTP and development servers are for a trusted network, not public Wi-Fi or real passwords/documents.
- App-config camera/photo descriptions apply to future native builds; Expo Go uses its own installed permissions and native launch screen. The branded in-app loading screens are under LouFind's control.

## Troubleshooting

**Cannot connect:** verify both commands are still running and both devices use the same Wi-Fi. Allow Local Network access for Expo Go in iPhone Settings. Guest/campus Wi-Fi may isolate devices; use a trusted home network or personal hotspot. Recreate the QR after changing networks.

**Incompatible project:** use the SDK 54 App Store client and run the phone command from the parent LouFind folder. Do not run Expo against the web app's `app/` directory.

**Native code did not update:** stop and rerun `npm run phone`, then reopen the preview. Automatic native file watching is intentionally off.

**Data looks different:** Safari, Expo Go, and the desktop browser have independent local stores. That is expected for this prototype.

## Verification commands

```sh
npm run phone:typecheck
npm --prefix mobile run export:ios
cd mobile
npx expo-doctor
npm audit
```

Actual installation, photo permissions, gestures, and the first successful launch on the user's physical iPhone require a device-side check.

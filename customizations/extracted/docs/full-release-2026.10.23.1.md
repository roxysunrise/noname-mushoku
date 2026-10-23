# Full Windows and Android packages: 2026.10.23.1

Built from the same frozen local runtime under output/github-full-2026.10.23.1. Android versionCode 20261028, versionName 1.11.7-custom.20261023.1; embedded resource version 2026.10.23.1. Both platforms embed the Tencent update URL.

Build: tools/build-android.ps1 and tools/package-online.py; Android SDK 35, build tools 35, JDK 17. The complete-source ZIP preserves the engine sources and runtime assets, excluding signing credentials, generated Android build intermediates and node_modules. The Windows full ZIP preserves the matching Electron engine and required runtime dependencies. Rebuilding Android requires the existing compatible signing key, which is not published.

Frozen source tests: 196 passed. Package, signature, CRC and desktop/Android resource verification are reported separately in release artifacts. Physical device installation and live multiplayer acceptance have not been rerun. Earlier patch/source-overlay assets remain immutable.

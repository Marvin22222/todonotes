# TodoNotes - Native iOS App

## Build für iPhone (macOS erforderlich)

### Voraussetzungen
1. **macOS** mit Xcode installiert
2. **Apple ID** (kein Developer Account nötig für AltStore)
3. **AltStore** auf dem iPhone installiert (https://altstore.io)

### Schritte auf dem Mac

#### 1. Projekt klonen
```bash
git clone https://github.com/Marvin22222/todonotes.git
cd todonotes
git checkout dev
```

#### 2. Dependencies installieren
```bash
npm install
cd ios
pod install
cd ..
```

#### 3. Xcode Projekt öffnen
```bash
open ios/App/App.xcworkspace
```

#### 4. Build erstellen
- In Xcode: **Product → Build** (⌘B)
- Warten bis "Build Succeeded"

#### 5. IPA exportieren
- **Product → Archive**
- Im Organizer: **Export → Ad Hoc / Development**
- Apple ID auswählen und signieren
- **.ipa Datei** wird erstellt

### Alternative: Schneller via CLI

```bash
# Build via xcodebuild
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Debug -destination 'generic/platform=iOS' CODE_SIGN_IDENTITY="-" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO build

# IPA erstellen mit xcrun
xcrun altool --build-products build/Debug-iphoneos/App.app -f App.ipa
```

### Auf iPhone installieren (AltStore)

1. **AltStore** auf dem iPhone installieren
2. Mac und iPhone im **gleichen WLAN**
3. AltServer auf dem Mac starten
4. iPhone per USB anschließen
5. In iTunes/Finder das iPhone auswählen
6. Die **.ipa Datei** per Drag & Drop in AltServer ziehen
7. App erscheint auf dem Home-Screen!

---

## Alternativ: PWA (kein Mac nötig)

Falls du keinen Mac hast, nutze die **PWA Version**:
- URL: https://marvin22222.github.io/todonotes/
- Safari → Teilen → Zum Home-Bildschirm

# TodoNotes - iOS Build Anleitung

## Option 1: Codemagic Cloud Build (Windows/Linux/Mac)

**Codemagic** baut iOS Apps in der Cloud - kein Mac nötig!

### Schritte:

#### 1. Codemagic Account erstellen
1. Gehe auf **codemagic.io**
2. Sign in with **GitHub**
3. Authorize Codemagic für dein GitHub Konto

#### 2. Projekt hinzufügen
1. In Codemagic: **Add application**
2. Wähle **GitHub** → Repository: `Marvin22222/todonotes`
3. Wähle **iOS** als Plattform
4. Branch: `dev`

#### 3. Code Signing (Apple ID)

**Option A - Kostenlos (Ad-Hoc für AltStore):**
- In Codemagic: **Project Settings → Code signing**
- Apple ID hinzufügen:
  - Apple ID: deine Apple ID Email
  - Password: dein Apple ID Password
  - Besser: App-Specific Password erstellen (https://appleid.apple.com)

**Option B - App Store Connect API:**
1. Gehe zu https://appstoreconnect.apple.com
2. Benutzer → App-Specific Passwords → Password erstellt
3. In Codemagic: Add API key

#### 4. Build starten
1. Klick auf **Start new build**
2. Wähle `dev` branch
3. Warte auf Build (~10-15 min)
4. **Download .ipa** aus den Artifacts

#### 5. .ipa auf iPhone installieren (AltStore)
1. AltStore auf iPhone installieren
2. Mac/PC & iPhone im gleichen WLAN
3. AltServer auf dem Gerät laufen lassen
4. .ipa per Drag & Drop in AltServer ziehen
5. Fertig! App auf Home-Screen

---

## Option 2: Lokal mit Mac (falls verfügbar)

Siehe oben - Xcode → Archive → Export

---

## Wichtig zu wissen:

| | Kosten | Mac nötig? | AltStore? |
|---|---|---|---|
| **Codemagic** | Free Tier (500 min/Monat) | ❌ Nein | ✅ Ja |
| **Lokal Xcode** | $0 | ✅ Ja | ✅ Ja |

### Apple ID für Codemagic:
- App-Specific Password erstellen: https://appleid.apple.com
- Das statt normalem Password verwenden

---

## Falls Fragen:

- **Codemagic Docs:** https://docs.codemagic.io/
- **AltStore:** https://altstore.io/

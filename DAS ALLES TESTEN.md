# ✅ Reloop — Das alles testen (A–Z)

Diese Datei führt dich durch **jedes einzelne Feature** der App, damit du Reloop
komplett durchtesten kannst. Unten steht auch, **was noch gemacht werden muss**
(API-Key usw.).

> **Wichtig:** Die App läuft **komplett ohne API-Key** im *Mock-Modus*. Du kannst
> also alles unten durchtesten, bevor ein Anthropic-Key drin ist. Die **Demo-Prop-
> Buttons** liefern immer dieselben (deterministischen) Ergebnisse — ideal zum
> Üben/Vorführen.

---

## 0. Starten (einmalig)

1. **Node.js ≥ 20.9** muss installiert sein.
   - Falls kein Node da ist: eine portable Version liegt unter
     `C:\Users\<du>\AppData\Local\nodejs-portable` — die zur PATH hinzufügen,
     oder Node normal installieren (nodejs.org).
2. Im Ordner `reloop/`:
   ```bash
   npm install
   npm run dev
   ```
3. Browser öffnen: **http://localhost:3000**

> 💡 **Fürs Handy-Testen (QR & Kamera):** Statt `localhost` die Netzwerk-Adresse
> nehmen, die `npm run dev` anzeigt (z. B. `http://192.168.x.x:3000`). Laptop und
> Handy müssen im **gleichen WLAN** sein. Nur dann kann ein Juror den DPP-QR-Code
> mit dem Handy scannen.

---

## 1. Zwei Modi verstehen

| Modus | Wann | Was passiert |
|---|---|---|
| **Mock** (Standard, kein Key) | sofort | Alle KI-Antworten kommen aus eingebauten Beispiel-Daten. Voll demobar. |
| **Live** (mit `ANTHROPIC_API_KEY`) | später | Echte Fotos gehen an Claude (Vision/Websuche). Demo-Prop-Buttons bleiben deterministisch. Bei Fehler → automatisch Mock-Fallback. |

Live aktivieren: siehe **Abschnitt 4** unten.

---

## 2. Test-Checkliste — Feature für Feature

Hake jeden Punkt ab. Format: **Was tun → Was du erwarten solltest.**

### 🏠 Startseite & Branding (`/`)
- [ ] Logo (Mint-Loop-Mark) + Wortmarke **„reloop"** + Slogan „Snap it. Score it. Loop it." sichtbar.
- [ ] Farben: Off-White Hintergrund, Charcoal-Green Text, Electric-Mint Akzente.
- [ ] Oben rechts: Buttons **„Learn"** und **„B2B →"**.
- [ ] **Streak-Banner** (dunkle Karte): Loop Points, CO₂ saved/wk, Waste diverted — Zahlen sind beim Laden animiert. Darunter Hinweis „tap to see what that really means →".

### 📸 Single-Scan (Modus „Single item")
- [ ] Umschalter oben steht auf **„Single item"**.
- [ ] **Demo-Props testen:** unten die 5 Buttons (📱 Cracked phone, 🔌 Tangled charger, 🫙 Glass jar, 🍞 Dead toaster, 📦 Foam packaging) → jeweils tippen → nach ~2–3 s slidet eine **Loop Card** hoch.
- [ ] **Eigenes Foto:** großen „Snap an item"-Button tippen → Foto aufnehmen/hochladen → Loop Card erscheint.
- [ ] Loop Card zeigt: Item-Name, Material, **Condition-Balken**, **CO₂ saved**, **Resale-Band**.

### 🔍 Transparenz & Präzisierung (Refine)
- [ ] Auf der Loop Card oben: Banner **„ⓘ AI estimate · …"** (gelb) — macht klar, dass Werte KI-Schätzungen sind.
- [ ] Button **„Not right?"** tippen → Eingabefeld erscheint → z. B. `iPhone 13 Pro` eingeben → **„Refine"**.
- [ ] Erwartung: Karte aktualisiert sich, Banner wird **grün „✓ Matched to model"**, Item-Name enthält das Modell, Resale-Band wird **enger** (präziser). Toast „Refined with your model ✓".

### ♻️ Aktions-Hierarchie (das Herzstück)
- [ ] Aktionen sind **best-first** gerankt (Repair > Resell > Donate > Recycle > Bin), farbcodierte Chips.
- [ ] Beste Aktion hat Badge **„Best loop"**.
- [ ] Jede Aktion: konkrete Anleitung, **Effort-Punkte** (●●●○○), lokaler Hinweis (📍, z. B. „Munich … yellow bin").
- [ ] **Deep-Links** pro Aktion (öffnen extern): z. B. iFixit, Vinted, Back Market, Google Maps.

### 🛠️ Repair-Features (bei „Repair"-Verdict, z. B. Demo „Cracked phone")
- [ ] Button **„🔩 Find the exact part"** → liefert Ersatzteil + Preis + 3 Links.
- [ ] Button **„🛠️ Start guided repair"** → **Repair Coach** öffnet sich:
  - [ ] 3 Schritte, Fortschrittsbalken.
  - [ ] „📸 Snap your progress" → Foto wählen → KI gibt Feedback + nächsten Schritt.
  - [ ] Letzter Schritt → **„Finish — I fixed it! 🎉"** → vergibt Loop Points.

### 🏷️ Resell-Features (bei „Resell"-Aktion)
- [ ] Button **„🔎 Get live resale comps"** → zeigt Preis-Band + Vinted/Back-Market-Links.
- [ ] Button **„✍️ Write my listing"** → KI schreibt **Titel, Beschreibung, Preis, Kategorie**:
  - [ ] **„Copy listing"** → kopiert in die Zwischenablage (woanders einfügen zum Prüfen).
  - [ ] **„Open on Vinted ↗"** → öffnet Vinted vorgefüllt.

### ⛏️ Urban-Mining-Wert
- [ ] Im Karten-Footer gelbe Box **„⛏️ Urban mining"** → z. B. beim Handy: „≈0,03 g Gold, Kobalt, Seltene Erden — ≈€2 recoverable".

### 📲 Digital Product Passport (DPP) + QR
- [ ] Footer-Zeile **„Draft Digital Product Passport: …"**.
- [ ] Button **„📲 Show DPP QR"** → Modal mit QR-Code + URL.
  - [ ] URL antippen → öffnet die **Passport-Seite** (`/dpp/<id>`): Material, Recyclebarkeit, CO₂, **„● AI-estimated"**-Badge, ESPR-Hinweis.
  - [ ] **Mit dem Handy** (gleiches WLAN, Netzwerk-IP statt localhost) den QR scannen → Passport öffnet sich am Handy. ⭐ Jury-Moment.

### 🎉 Reward-Loop
- [ ] Bei einer Aktion **„✓ I did this / I repaired it …"** tippen → **Toast „+X Loop Points 🎉"** + Streak-Banner-Zahlen steigen animiert.
- [ ] **„Scan next →"** → zurück zur Kamera.

### 🗄️ Multi-Item-Scan (Modus „Whole pile")
- [ ] Umschalter auf **„🗄️ Whole pile"**.
- [ ] **„🗄️ Scan a full junk drawer (5 items)"** tippen (oder echtes Foto einer vollen Schublade).
- [ ] Erwartung: Bild mit **farbcodierten Bounding-Boxes** über jedem Gegenstand; Box antippen markiert den Eintrag in der Liste.
- [ ] Oben Gesamtwert: „5 items found · X kg CO₂ if you loop them all".
- [ ] Pro Item: Aktion-Chip, Anleitung, lokaler Hinweis, **„✓ … did this"**-Button.

### 🌍 Impact-Translator (das „Staunen"-Feature)
- [ ] **Streak-Banner antippen** → Modal **„What that really means"**.
- [ ] CO₂ wird greifbar: 🚗 km not driven, 📱 phone charges, 🌳 trees a year, 🍔 beef burgers — Zahlen zählen animiert hoch.
- [ ] Waste: 🥤 PET bottles, 🍌 bananas.
- [ ] **Skalen-Umschalter** „🧍 Just you / 🏘️ Your street ×50 / 🌆 Your city ×10k" → Zahlen explodieren (das Wow). Wald-Animation 🌳 mit „+N more".
- [ ] Button **„📤 Share my impact"** → erzeugt teilbare **Impact-Card** (PNG):
  - [ ] **Download** speichert ein Bild; **Share** öffnet (falls unterstützt) den Teilen-Dialog.

### 📚 Learn-Bereich (`/learn`, über „Learn" oben)
- [ ] Emotionaler Intro-Block.
- [ ] **Zahlen-Karten** mit echten Quellen (UN E-Waste Monitor, Our World in Data, Ellen MacArthur Foundation) — Links öffnen extern.
- [ ] **„How Reloop works"** — 5 Schritte + Transparenz-Hinweis.
- [ ] **„Ask the science"**: Frage eintippen oder Vorschlag tippen → KI-Antwort + Quellen.
- [ ] **„Watch"** (Erklärvideos) und **„Read"** (Reports) — Links funktionieren.

### 📊 B2B-Dashboard (`/dashboard`, über „B2B →")
- [ ] KPIs: Items scanned, CO₂ saved, Waste diverted (steigen, je mehr du scannst).
- [ ] **„Circular decisions"**-Balken (Waste-Hierarchie-Verteilung).
- [ ] **„Material flow"** nach Materialfamilie.
- [ ] **„Auto-filled Digital Product Passports"** mit **AI-estimated / Doc-backed**-Badges + ESPR-Text.

### 📱 PWA / Allgemein
- [ ] Browser-Tab zeigt das Reloop-Icon (dunkel mit Mint-Mark).
- [ ] Auf dem Handy „Zum Startbildschirm hinzufügen" → App-Icon erscheint.

---

## 3. Schnell-Smoke-Test (2 Minuten, falls es eilig ist)

1. Demo-Prop **„Cracked phone"** → Loop Card → „Not right?" → `iPhone 13 Pro` → Refine (wird grün).
2. „🔩 Find the exact part" + „✍️ Write my listing" antippen.
3. „📲 Show DPP QR" → URL öffnen.
4. „✓ I did this" → Punkte-Toast.
5. Streak-Banner antippen → Impact-Translator → Skala auf „Your city ×10k".
6. Modus „Whole pile" → „Scan a full junk drawer" → Boxen sehen.
7. „Learn" → eine Frage stellen. „B2B →" → Dashboard ansehen.

Wenn das alles läuft, ist die App vorführbereit. ✅

---

## 4. Live-Modus aktivieren (echter KI-Scan)

Datei `reloop/.env.local` öffnen (oder anlegen) und eintragen:

```
ANTHROPIC_API_KEY=sk-ant-...DEIN-KEY...
RELOOP_AI_MODE=live
```

Dann `npm run dev` neu starten.

**Was sich ändert:** Eigene Fotos werden wirklich von Claude analysiert; „Refine",
„Write my listing", „Find the exact part", „Get live resale comps", „Ask the
science" und der Repair-Coach nutzen echte KI/Websuche. Die **Demo-Prop-Buttons
bleiben deterministisch** (sie sind absichtlich an die Beispiel-Daten gekoppelt).

**Modell-Hinweis:** Standard-Scan-Modell ist `claude-fable-5`. Falls euer
Account/Key das nicht nutzen kann (Fable 5 braucht 30-Tage-Datenaufbewahrung),
zusätzlich setzen:
```
RELOOP_SCAN_MODEL=claude-opus-4-8
```

---

## 5. ⚠️ Was noch gemacht werden muss (offene Punkte)

**Muss vor dem Live-Demo:**
- [ ] **Anthropic-API-Key besorgen & eintragen** (siehe Abschnitt 4) — der einzige echte Blocker für echte Scans.
- [ ] **Live-Scan mit echten Fotos testen:** die 3–5 echten Demo-Gegenstände einmal real scannen, Ergebnis prüfen, ggf. Prompt/Modell anpassen. (Im Mock ist alles geprüft; die *Live-Qualität* ist noch ungetestet, weil noch kein Key da war.)
- [ ] **Fable-5-Verfügbarkeit prüfen** für euren Key/Org; sonst `RELOOP_SCAN_MODEL=claude-opus-4-8`.

**Für die Handy-/Bühnen-Demo:**
- [ ] App über die **Netzwerk-IP** öffnen (nicht localhost), damit der **DPP-QR** vom Handy scanbar ist (gleiches WLAN).
- [ ] **Live-Kamera** (getUserMedia) auf einem echten Handy einmal durchprobieren; als Fallback funktioniert der **Foto-Upload** immer.

**Optional / später (kein Blocker fürs Demo):**
- [ ] **Zahlen grounden:** CO₂-/Material-Werte sind KI-Schätzungen (sind als solche gekennzeichnet). Für mehr Glaubwürdigkeit könnte man eine kleine, zitierte CO₂-Tabelle hinterlegen.
- [ ] **Mehr Städte:** das Entsorgungs-Regelwerk ist aktuell auf **München** hardcodiert (`lib/municipality.ts`) — pro Stadt erweiterbar.
- [ ] **Persistenz:** Daten liegen in einer JSON-Datei `reloop/.data/reloop.json` (wird beim Löschen zurückgesetzt). Für echten Multi-User-/Produktivbetrieb auf eine Datenbank umstellen. **Hinweis fürs Deployment:** auf serverlosen Hosts (z. B. Vercel) überlebt die JSON-Datei nicht zwischen Aufrufen → dort vor Live-Gang auf DB umstellen.
- [ ] **Affiliate-IDs** (optional) in `.env.local`: `AFFILIATE_VINTED_ID`, `AFFILIATE_BACKMARKET_ID` — Deep-Links funktionieren auch ohne.
- [ ] **Hosting/HTTPS:** Für eine öffentliche PWA mit Kamera braucht es HTTPS (z. B. Vercel); dort die Env-Variablen setzen.
- [ ] Hinweis: **Websuche & Fable 5** gibt es nur über die First-Party-Claude-API (nicht über Amazon Bedrock / Google Vertex) — relevant nur, falls ihr dorthin deployt.

---

## 6. Troubleshooting

- **Seite lädt nicht / Port belegt:** läuft schon ein `npm run dev`? Nur eine Instanz starten.
- **„node is not recognized":** Node ist nicht im PATH — portable Node aus dem Pfad oben nutzen oder Node installieren.
- **Demo-Daten „klemmen"/alt:** `reloop/.data/reloop.json` löschen und Server neu starten → frische Seed-Daten.
- **QR lässt sich vom Handy nicht öffnen:** Du nutzt `localhost` statt der Netzwerk-IP, oder Handy ist in einem anderen WLAN.
- **Live-Scan schlägt fehl:** prüfen, ob `ANTHROPIC_API_KEY` gesetzt und `RELOOP_AI_MODE=live` ist; bei Fable-5-Fehlern auf `claude-opus-4-8` umstellen. Die App fällt bei Fehlern automatisch auf Mock zurück (Karte erscheint trotzdem).

---

*Reloop · Snap it. Score it. Loop it.*

# Social Media Post Generator

Aplicație web care transformă un brief de marketing în 3–5 variante de postare pentru social media,
folosind Claude (Anthropic) sau GPT (OpenAI). Rulează integral în browser — nu există server propriu
și nici bază de date.

## Pornire rapidă

```bash
npm install
npm run dev
```

Deschide adresa afișată în terminal, apasă **Setări** în antet și adaugă cel puțin o cheie API.

| Comandă | Ce face |
| --- | --- |
| `npm run dev` | server de dezvoltare cu hot reload |
| `npm run build` | verificare TypeScript + build de producție în `dist/` |
| `npm run preview` | servește build-ul de producție local |
| `npm run typecheck` | doar verificarea de tipuri |

## Publicare pe GitHub Pages

1. Creează un repository nou și urcă proiectul (`git push` pe branch-ul `main`).
2. În repository: **Settings → Pages → Source → GitHub Actions**.
3. Workflow-ul din `.github/workflows/deploy.yml` face build-ul și publică `dist/` la fiecare push.

`vite.config.ts` folosește `base: "./"`, deci build-ul funcționează atât la rădăcina unui domeniu,
cât și sub un subpath de tip `user.github.io/nume-repo/`.

## Chei API

Cheile se salvează în `localStorage`, pe dispozitivul curent, și sunt trimise direct către provider
din browser. Consecințe practice:

- folosește chei personale, cu limită de cheltuială setată în contul providerului;
- nu deschide aplicația publicată pe un calculator public și nu comite chei în repository;
- pentru un produs real, mută apelul AI într-un backend (de exemplu un Cloudflare Worker) și
  păstrează cheia acolo — codul din `services/ai/` se mută aproape neschimbat.

Apelul către Anthropic trimite antetul `anthropic-dangerous-direct-browser-access: true`, necesar
pentru cereri pornite direct din browser.

## Structura proiectului

```
src/
├── components/     elemente de interfață, fără logică de business
├── pages/          GeneratorPage — compune starea și componentele
├── services/
│   ├── ai/         providerii Anthropic și OpenAI + serviciul de generare
│   ├── errors.ts   erori tipizate cu mesaje pentru utilizator
│   └── storage.ts  acces tolerant la localStorage
├── prompts/        construcția prompturilor trimise modelului
├── hooks/          stare reutilizabilă (temă, setări, generare, istoric, notificări)
├── types/          tipurile domeniului
└── utils/          constante, parsare răspuns, export, estimare tokenuri
```

Interfața nu știe niciodată ce provider e activ. Componentele primesc date și callback-uri;
tot ce ține de HTTP, timeout, parsare și cost stă în `services/`.

### Cum adaugi un provider nou

1. Implementează interfața `AIProvider` din `services/ai/types.ts`.
2. Înregistrează-l în `REGISTRY` din `services/ai/index.ts`.
3. Adaugă modelele și prețurile în `MODELS` din `utils/constants.ts`.

Nimic din `components/` sau `pages/` nu se modifică.

## Funcționalități

**Brief:** produs, descriere, temă, platformă (Facebook, Instagram, LinkedIn, X, TikTok), ton
(profesional, prietenos, amuzant, inspirant, comercial, informativ), public țintă, call to action,
număr de variante (3–5), lungime, emoji, hashtag-uri, limbă și șablon de postare.

**Rezultate:** carduri cu text, hashtag-uri separate, buton de copiere, editare inline înainte de
copiere, regenerare individuală și regenerare completă, export TXT și Markdown.

**Contor de caractere pe platformă:** fiecare card măsoară textul față de bugetul real al platformei
alese (280 pentru X, 2200 pentru Instagram și TikTok, 2000 pentru Facebook, 3000 pentru LinkedIn).
Bara devine portocalie peste 85% și roșie la depășire.

**Persistență:** ultimul brief, setările și ultimele 20 de generări rămân salvate local.

**Estimare cost:** înainte de trimitere se afișează o estimare de tokenuri și cost; după răspuns se
afișează consumul real raportat de provider.

## Erori tratate

| Situație | Ce vede utilizatorul |
| --- | --- |
| Nicio cheie salvată | mesaj explicit + deschiderea automată a panoului de setări |
| Cheie respinsă (401/403) | îndrumare către verificarea cheii |
| Limită de cereri (429) | sugestia de a reîncerca după un minut |
| Timeout (peste 60s) | sugestia de a reduce lungimea sau numărul de variante |
| Răspuns care nu e JSON valid | mesaj de reîncercare; parserul încearcă întâi să recupereze array-ul din text |
| Eroare de rețea | mesaj despre conexiune și blocante de conținut |
| Eroare de server (5xx) | mesaj de reîncercare |

## Decizii de implementare

**Vite + React + TypeScript** în locul unui singur fișier HTML: cerința de structură pe module și de
TypeScript are nevoie de un pas de build, iar Vite îl face rapid și publicabil ca site static.

**CSS cu variabile în locul unui framework de utilitare:** dark mode se rezolvă prin comutarea unui
singur atribut `data-theme`, fără dependențe suplimentare și fără configurare de build.

**Iconițe SVG inline** în `components/Icon.tsx`, fără bibliotecă de iconițe — bundle mai mic și
control complet asupra stilului.

**Contract de ieșire JSON** cerut modelului, cu parser tolerant: modelele returnează ocazional text
în jurul JSON-ului, iar parserul extrage array-ul dintre prima `[` și ultima `]` înainte de a renunța.

**Temperatură 0.9** la generare, pentru ca cele 3–5 variante să difere real ca unghi, nu doar ca
formulare.

**Prompturile sunt scrise în română** și trăiesc într-un singur fișier (`prompts/buildPrompt.ts`),
ca să poată fi citite și ajustate fără a umbla prin componente.

## Limitări cunoscute

- Cheia API este vizibilă în browser-ul utilizatorului; pentru uz public e nevoie de un proxy server.
- Prețurile din `utils/constants.ts` sunt orientative și trebuie actualizate manual când providerii
  își modifică tarifele.
- Nu există streaming al răspunsului: variantele apar toate odată, la final.

# FixFlow.Web

[![CI](https://github.com/mpalus-git/FixFlow.Web/actions/workflows/ci.yml/badge.svg)](https://github.com/mpalus-git/FixFlow.Web/actions/workflows/ci.yml)

Działający panel: **[fix-flow-web.vercel.app](https://fix-flow-web.vercel.app)**

Pozostałe części systemu FixFlow:

- [FixFlow.Api](https://github.com/mpalus-git/FixFlow.Api) - backend .NET 10 z PostgreSQL, źródło reguł biznesowych i kontraktu OpenAPI ([dokumentacja API na żywo](https://fixflow-api-us2p.onrender.com/scalar)).
- [FixFlow.Mobile](https://github.com/mpalus-git/FixFlow.Mobile) - aplikacja technika (.NET MAUI 10, Android i Windows) działająca bez zasięgu ([najnowsze wydanie](https://github.com/mpalus-git/FixFlow.Mobile/releases/latest)).

Na ekranie logowania są przyciski szybkiego logowania kontami demo dyspozytora i technika, więc nie trzeba znać haseł (są też jawne w [README FixFlow.Api](https://github.com/mpalus-git/FixFlow.Api#readme)). Kilka rzeczy, które warto wiedzieć przed pierwszym wejściem:

- API działa na darmowym planie Render i usypia po 15 minutach bezczynności. Pierwsze wejście może potrwać do minuty, a panel pokazuje w tym czasie ekran z postępem uruchamiania zamiast zablokowanego formularza.
- Dane demonstracyjne są wspólne dla wszystkich odwiedzających i są przywracane codziennie o 2:00 UTC.
- Konto administratora demo nie ma publicznego hasła. Widoki administratora (zarządzanie użytkownikami) są opisane niżej.

## Zrzuty ekranu

Pulpit z kolejkami zleceń wymagających uwagi i obłożeniem techników:

![Pulpit](docs/screenshots/dashboard.png)

Tablica dispatch: tydzień w układzie technik x dzień, kolumna nieprzypisanych zleceń i przypisywanie przeciągnięciem (także z klawiatury):

![Przypisanie technika przeciągnięciem na tablicy dispatch](docs/screenshots/dispatch-drag.gif)

![Tablica dispatch](docs/screenshots/dispatch.png)

Lista zleceń z filtrowaniem, sortowaniem i paginacją po stronie serwera, ze stanem zapisanym w adresie strony:

![Lista zleceń](docs/screenshots/work-orders.png)

Szczegóły zlecenia: przebieg statusów, akcje zależne od roli i statusu, wpisy serwisowe z częściami w cenie z chwili zużycia i protokół PDF:

![Szczegóły zlecenia](docs/screenshots/work-order-details.png)

Tryb ciemny:

![Pulpit w trybie ciemnym](docs/screenshots/dashboard-dark.png)

Ekran uruchamiania uśpionego serwera:

![Ekran uruchamiania serwera demo](docs/screenshots/wake.png)

## Opis systemu

FixFlow to system obsługi zleceń serwisowych w terenie dla firmy naprawiającej klimatyzację i urządzenia biurowe. Składa się z trzech części:

- [FixFlow.Api](https://github.com/mpalus-git/FixFlow.Api) - backend ASP.NET Core z PostgreSQL, źródło prawdy dla reguł biznesowych i kontraktu OpenAPI.
- FixFlow.Web (to repozytorium) - panel webowy dla dyspozytora i administratora.
- [FixFlow.Mobile](https://github.com/mpalus-git/FixFlow.Mobile) - aplikacja mobilna technika (.NET MAUI 10); technik rozpoczyna w niej pracę, dodaje wpisy serwisowe ze zdjęciami, lokalizacją GPS i zużytymi częściami oraz zamyka zlecenie, także bez zasięgu (zmiany czekają w kolejce na połączenie).

Panel obsługuje trzy role:

| Rola       | Co widzi i robi                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dispatcher | pulpit, zlecenia (tworzenie, edycja, przypisywanie, zakończenie awaryjne, fakturowanie), tablica dispatch, klienci, urządzenia, katalog części z przyjęciem dostawy |
| Admin      | to samo co dyspozytor oraz zarządzanie użytkownikami: zakładanie kont z rolą, dezaktywacja, aktywacja, reset hasła                                                  |
| Technician | „Moje zlecenia” tylko do odczytu, ze szczegółami i wpisami serwisowymi; praca w terenie odbywa się w aplikacji mobilnej                                             |

Zlecenie przechodzi przez statusy Nowe -> Przypisane -> W realizacji -> Zakończone -> Zafakturowane. Panel pokazuje tylko akcje dozwolone dla roli i bieżącego statusu, ale ostatnie słowo zawsze ma API.

## Stack

| Obszar         | Technologie                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Podstawa       | React 19, TypeScript 7 (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Vite 8, Node.js 24, pnpm |
| Routing        | React Router 8 w trybie data: trasy leniwe per obszar, loadery, ochrona tras przez middleware                       |
| Dane z API     | openapi-typescript i openapi-fetch (typy generowane z kontraktu), TanStack Query 5                                  |
| Tabele         | TanStack Table (paginacja, sortowanie i filtrowanie po stronie serwera)                                             |
| Formularze     | React Hook Form, Zod 4                                                                                              |
| UI             | Tailwind CSS 4, shadcn/ui (Radix), lucide-react, Sonner, dnd-kit                                                    |
| Stan UI        | Zustand (sesja, motyw)                                                                                              |
| Daty i języki  | date-fns z @date-fns/tz (Europe/Warsaw), i18next (polski i angielski)                                               |
| Jakość         | ESLint 10 z typescript-eslint (reguły typowane), jsx-a11y, Prettier, własna reguła zakazu komentarzy                |
| Testy          | Vitest, React Testing Library, MSW, Playwright, axe-core                                                            |
| CI i wdrożenie | GitHub Actions, Vercel                                                                                              |

## Uruchomienie lokalne

Wymagany jest Node.js 24 i pnpm 12.

```bash
pnpm install
cp .env.example .env.local
```

### Z API na Render

W `.env.local` wystarczy ustawić adres API, do którego serwer deweloperski Vite przekieruje żądania `/api` (dzięki temu lokalnie nie ma problemu z CORS):

```bash
API_PROXY_TARGET=https://fixflow-api-us2p.onrender.com
```

```bash
pnpm dev
```

Panel działa pod http://localhost:5173. Logowanie danymi kont demo z README API albo, po uzupełnieniu zmiennych `VITE_DEMO_*`, przyciskami szybkiego logowania.

### Z lokalnym API

Wymagany jest Docker. Repozytorium zawiera środowisko używane w testach e2e: publiczny obraz `ghcr.io/mpalus-git/fixflow.api` przypięty do konkretnego commita i PostgreSQL 18, z kontami i danymi demo tworzonymi przy starcie.

```bash
cp e2e/.env.example e2e/.env
pnpm e2e:up
```

W `e2e/.env` trzeba uzupełnić hasło bazy, klucz JWT (co najmniej 32 znaki) i hasła kont demo (co najmniej 8 znaków, wielka i mała litera, cyfra i znak specjalny). API startuje pod http://localhost:8080, a w `.env.local` ustawia się:

```bash
API_PROXY_TARGET=http://localhost:8080
```

Środowisko zatrzymuje i czyści `pnpm e2e:down`. Alternatywnie można uruchomić pełne środowisko z repozytorium API (`docker compose up --build`, z Redisem i Mailpitem).

### Skrypty

| Skrypt                            | Co robi                                                                |
| --------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                        | serwer deweloperski                                                    |
| `pnpm build`, `pnpm preview`      | build produkcyjny i jego podgląd                                       |
| `pnpm lint`                       | ESLint i Prettier                                                      |
| `pnpm typecheck`                  | kontrola typów TypeScript 7                                            |
| `pnpm test`                       | testy jednostkowe i komponentów (Vitest)                               |
| `pnpm e2e`                        | testy e2e (Playwright) na lokalnym API                                 |
| `pnpm check:comments`             | zakaz komentarzy w CSS, HTML, YAML i tsconfig                          |
| `pnpm api:sync`, `pnpm api:types` | pobranie aktualnego kontraktu z repozytorium API i wygenerowanie typów |

## Architektura katalogów

Kod jest podzielony według funkcji. Obszar nie importuje z innego obszaru, wyjątkiem są komponenty wystawione w jego publicznym `index.ts` (np. karta klienta osadza listę urządzeń klienta).

```text
src/
  app/                 router, layout, obsługa błędów tras, middleware sesji, ekran budzenia serwera
  features/
    <obszar>/          auth, dashboard, work-orders, dispatch, clients, devices, parts, users, profile
      api/             zapytania i mutacje TanStack Query, fabryka kluczy zapytań
      components/
      pages/
      schemas/         schematy Zod formularzy
      hooks/
      index.ts         publiczne komponenty obszaru
  shared/
    api/               wygenerowany schema.ts, klient openapi-fetch, middleware auth i błędów, mapowanie ProblemDetails
    session/           tokeny, odświeżanie single-flight, synchronizacja kart
    ui/                komponenty shadcn/ui i własne komponenty wspólne
    lib/               daty i strefa czasowa, kwoty, walidacja, helpery
    i18n/              konfiguracja i tłumaczenia pl.json, en.json
    theme/             motyw jasny, ciemny i systemowy
e2e/                   testy Playwright, compose.yaml z obrazem API
openapi/               kopia kontraktu FixFlow.Api
scripts/               synchronizacja kontraktu, generowanie typów, kontrola komentarzy
```

## Decyzje techniczne

### Typy z kontraktu API

Panel nie ma ręcznie pisanych DTO. Kopia kontraktu leży w `openapi/fixflow-api.v1.json`, a `pnpm api:types` generuje z niej `src/shared/api/schema.ts`, z którego korzystają klient openapi-fetch, zapytania TanStack Query i handlery MSW w testach (handler zwracający kształt niezgodny z kontraktem się nie kompiluje). CI generuje typy ponownie i odrzuca build, jeśli różnią się od zacommitowanych, a osobny nieblokujący job ostrzega, gdy kopia kontraktu rozjedzie się z gałęzią main API.

### Odświeżanie tokenów single-flight

API rotuje refresh token przy każdym odświeżeniu, a ponowne użycie starego tokena unieważnia całą rodzinę i wylogowuje użytkownika. Dlatego:

- w obrębie karty wszystkie równoległe żądania, które dostały 401, czekają na jedną wspólną obietnicę odświeżenia i są powtarzane najwyżej raz;
- między kartami odświeżanie jest chronione blokadą Web Locks API (`navigator.locks`); wewnątrz blokady panel ponownie odczytuje refresh token z `localStorage`, więc jeśli inna karta już go wymieniła, używa nowego zamiast zużywać stary;
- wylogowanie unieważnia token w API, czyści sesję i powiadamia pozostałe karty przez `BroadcastChannel`;
- nieudane odświeżenie kończy sesję i przenosi na logowanie z parametrem `returnTo`.

### Współbieżność: ETag i If-Match

Pojedyncze zasoby (klient, urządzenie, część, zlecenie) przychodzą z nagłówkiem `ETag`. Formularz edycji zapamiętuje wersję, którą użytkownik otworzył, i wysyła ją w `If-Match`, nawet jeśli dane w tle zdążyły się odświeżyć. Odpowiedź 412 otwiera dialog „Dane zmieniły się w międzyczasie” z możliwością wczytania aktualnej wersji; panel nigdy nie nadpisuje cudzych zmian automatycznie. Tablica dispatch przed zmianą terminu lub technika pobiera aktualną wersję zlecenia i przerywa operację, jeśli stan różni się od tego, co widział dyspozytor. Samo przeniesienie (technik i termin) to jedno żądanie API - przypisanie z nowym terminem albo `reassign` - więc zlecenie nigdy nie zostaje zmienione tylko częściowo.

### Strefa czasowa

Firma działa w Polsce, więc wszystkie daty są wyświetlane w strefie Europe/Warsaw niezależnie od strefy przeglądarki, a znaczniki czasu są wysyłane w UTC. Daty kalendarzowe (`yyyy-MM-dd`, np. data instalacji) nigdy nie przechodzą przez `new Date`, żeby nie przesunęły się o dzień. Testy Vitest i Playwright działają w strefie America/New_York, żeby wyłapać każdą zależność od strefy przeglądarki.

### Uśpiony serwer

Przy starcie panel wywołuje `GET /api/v1/system/ready`, które budzi zarówno usługę na Render, jak i bazę. Nie używa `/health/ready`, bo lista EasyPrivacy (domyślnie włączona m.in. w Brave Shields i uBlock Origin) blokuje żądania do `onrender.com/health`. Do tego czasu widać statyczny ekran startowy z `index.html`. Jeśli odpowiedź nie przyjdzie w 3 sekundy, pojawia się ekran z paskiem postępu i ponawianiem co 3 sekundy, a po 90 sekundach komunikat z przyciskiem ponowienia. Formularz logowania renderuje się dopiero, gdy API odpowiada.

Uśpiony Render nie zwraca błędu, tylko trzyma żądanie bez odpowiedzi do czasu startu (ok. 40 sekund). Dlatego w trakcie sesji pod nagłówkiem pojawia się pasek z wyjaśnieniem, gdy żądanie czeka na odpowiedź dłużej niż 5 sekund albo gdy panel ponawia zapytania po braku połączenia (co 3 sekundy, do 90 sekund).

### Przechowywanie tokenów

Access token jest trzymany wyłącznie w pamięci. Refresh token trafia do `localStorage`, bo API zwraca go w treści odpowiedzi i ciasteczko `httpOnly` nie jest możliwe bez zmian po stronie serwera. To świadomy kompromis: token w `localStorage` może odczytać skrypt wstrzyknięty przez XSS. Ryzyko ogranicza:

- Content Security Policy z `script-src 'self'` (bez skryptów inline, `eval` i zewnętrznych domen; Zod działa w trybie `jitless`, żeby nie próbował `eval`);
- brak `dangerouslySetInnerHTML` i skryptów zewnętrznych;
- nagłówki `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` i `frame-ancestors 'none'` ustawione w `vercel.json`.

Każdy dostęp do `localStorage` jest w `try/catch`: gdy magazyn jest niedostępny, sesja trwa do zamknięcia karty.

### Błędy z API

Jedno miejsce mapuje odpowiedzi ProblemDetails na błąd aplikacji: błędy walidacji (400) trafiają do pól formularza po kluczu z API, konflikty unikalności (409) do właściwego pola, 404 kończy się stroną „nie znaleziono”, a błędy serwera i brak sieci powiadomieniem z możliwością ponowienia. Komunikaty są tłumaczone po kodzie błędu z API, a gdy tłumaczenia brak, panel pokazuje opis z serwera. Walidacja w formularzach odwzorowuje reguły API, ale nie zastępuje ich.

### Pozostałe

- Stan filtrów, sortowania i paginacji list jest w adresie strony, więc odświeżenie i udostępniony link zachowują widok.
- Optimistic update tylko tam, gdzie wycofanie jest proste: przeciąganie na tablicy dispatch i archiwizacja. Formularze czekają na odpowiedź serwera.
- Akcje niedozwolone dla roli lub statusu są ukryte albo wyłączone z podpowiedzią.
- Kod nie zawiera komentarzy, co pilnują własna reguła ESLint i skrypt dla CSS, HTML, YAML i tsconfig.

## Testy

| Rodzaj                    | Narzędzia                                      | Co obejmuje                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jednostkowe i komponentów | Vitest, React Testing Library, user-event, MSW | ok. 580 testów: sesja i równoległe odświeżanie (także między kartami), mapowanie ProblemDetails, daty i strefy, schematy Zod, widoczność akcji według roli i statusu, formularze z błędami z serwera i konfliktem 412, tablica dispatch z obsługą klawiatury                                                   |
| E2E                       | Playwright, axe-core                           | prawdziwe API z obrazu Docker: logowanie, utworzenie zlecenia, przypisanie technika przeciągnięciem, konflikt 412 w dwóch kontekstach przeglądarki, uśpiony serwer, brak naruszeń dostępności poziomu serious i critical na głównych ekranach w obu motywach, działanie aplikacji pod produkcyjną polityką CSP |

CI uruchamia lint, kontrolę typów, kontrolę wygenerowanych typów, build, testy w trzech shardach z raportem pokrycia w podsumowaniu joba oraz testy e2e na obrazie `ghcr.io/mpalus-git/fixflow.api` z PostgreSQL 18 i losowymi sekretami.

## Lighthouse

Pomiar strony logowania na produkcji (Lighthouse 13.5.0, Chromium 153, domyślna symulacja sieci i procesora, mediana z kilku przebiegów, 2026-10-04):

| Urządzenie | Wydajność | Dostępność | Dobre praktyki | SEO | FCP   | LCP   | TBT   | CLS | Speed Index |
| ---------- | --------- | ---------- | -------------- | --- | ----- | ----- | ----- | --- | ----------- |
| Mobile     | 100       | 100        | 100            | 100 | 1,0 s | 1,0 s | 10 ms | 0   | 1,0 s       |
| Desktop    | 100       | 100        | 100            | 100 | 0,3 s | 0,3 s | 0 ms  | 0   | 0,3 s       |

Arkusz stylów jest wbudowany w `index.html`, a obok `#root` stoi statyczny ekran startowy z nazwą aplikacji. Przeglądarka maluje go zaraz po pobraniu dokumentu, zanim dotrą skrypty, a znika on regułą CSS, gdy React wyrenderuje pierwszą treść. To ten ekran jest elementem LCP. Formularz logowania pojawia się po pobraniu skryptów i odpowiedzi API, czyli w symulacji wolnego 4G po ok. 3 s (tyle wynosiło LCP, zanim powstał ekran startowy).

## Ograniczenia

- Refresh token w `localStorage` może odczytać skrypt wstrzyknięty przez XSS. CSP ogranicza to ryzyko, ale go nie usuwa; wynika ono z tego, że API zwraca token w treści odpowiedzi.
- Darmowy plan Render: zimny start do minuty oraz limit 10 logowań i odświeżeń sesji na minutę z jednego adresu IP, wspólny dla wszystkich użytkowników za tym samym NAT. Każde przeładowanie strony zużywa jedno odświeżenie.
- Dane demo są wspólne, więc zmiany innych odwiedzających są widoczne do nocnego resetu.
- Licznik opóźnionych na pulpicie opiera się na fladze `IsOverdue` odświeżanej co godzinę (dłużej, gdy Render śpi) i może chwilowo różnić się od podsumowania techników, które liczy opóźnienie na bieżąco.
- Lista techników oraz tablica dispatch pobierają najwyżej 100 pozycji (limit strony w API). Przy większej skali potrzebne byłoby wyszukiwanie po stronie serwera; tablica pokazuje wtedy ostrzeżenie.
- Brak aktualizacji na żywo: tablica dispatch odświeża się w tle co 30 s, a pulpit co minutę (tylko w widocznej karcie, tablica nie w trakcie przeciągania), pozostałe widoki przy akcjach i po powrocie do karty. Zmianę innego dyspozytora, która pojawi się między odświeżeniami, wykrywa ETag albo porównanie stanu przed zapisem.
- Panel technika jest tylko do odczytu: wpisy serwisowe ze zdjęciami dodaje aplikacja mobilna. Panel pokazuje podpis klienta, jeśli zlecenie zostało zamknięte z podpisem, ale dane demo podpisów nie zawierają.
- Lista użytkowników nie ma wyszukiwania ani sortowania, bo API ich nie udostępnia.

## Co zrobiłbym inaczej

- Refresh token w ciasteczku `httpOnly`, ustawianym przez API albo przez cienki BFF na tej samej domenie. Usunęłoby to największe ryzyko opisane wyżej.
- Aktualizacje tablicy dispatch na żywo (SSE albo SignalR), gdy pracuje na niej kilku dyspozytorów naraz.
- Testy regresji wizualnej w obu motywach, obok obecnych testów zachowania i dostępności.

## Licencja

Wszelkie prawa zastrzeżone. Kod jest udostępniony wyłącznie do wglądu; wykorzystanie, kopiowanie lub modyfikacja wymagają zgody autora.

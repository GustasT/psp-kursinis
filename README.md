# Treniruoklių rezervavimo sistema

REST API sporto klubų treniruokliams rezervuoti. Sistema pateikia klubo treniruoklių sąrašą, priima rezervacijas, rodo nario rezervacijų istoriją ir leidžia atšaukti dar neprasidėjusias rezervacijas.

## Paleidimas

Reikalingi Node.js 24 ir npm. Projektas kurtas su Node.js 24.14.1 ir npm 11.11.0.

Klonuoto projekto aplanke įdiegiamos priklausomybės ir paruošiama SQLite duomenų bazė su pavyzdiniais duomenimis:

```bash
npm ci
npm run db:setup
```

Po pradinio paruošimo serveris paleidžiamas viena komanda:

```bash
npm run dev
```

Serveris pasiekiamas adresu `http://127.0.0.1:3000`. Užklausa `GET /health` grąžina `{"status":"ok"}`, kai serveris veikia. Vietinė duomenų bazė saugoma faile `data/app.sqlite`.

## Pavyzdiniai duomenys ir rezervavimo taisyklės

Duomenų bazėje paruošti du sporto klubai – `club-a` ir `club-b`. Kiekviename yra po du narius (`member-1`, `member-2`) ir du treniruoklius (`equipment-1`, `equipment-2`). Tie patys nario ar treniruoklio ID skirtinguose klubuose žymi atskirus įrašus.

- Abiejų pavyzdinių klubų rezervacijos trunka nuo 5 iki 30 minučių. Trukmė nurodoma sveikomis minutėmis.
- Narys per kalendorinę dieną gali rezervuoti iki 60 minučių. Jei rezervacija kerta vidurnaktį, jos minutės paskirstomos abiem dienoms pagal `Europe/Vilnius` laiko juostą.
- Nario ir treniruoklio rezervacijos negali persidengti. Kita rezervacija gali prasidėti tiksliai tuo metu, kai baigiasi ankstesnė.
- Atšaukti galima patvirtintą, dar neprasidėjusią rezervaciją. Atšaukus atlaisvinamas treniruoklio laikas ir nario dienos minutės.

## API naudojimas

Klubo duomenų užklausose privaloma antraštė `X-Organization-Id`, pavyzdžiui, `X-Organization-Id: club-a`. Prototipe ši antraštė parenka klubo kontekstą demonstracijai. `GET /health` jos nereikalauja.

| Metodas ir kelias                           | Rezultatas                                                           |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `GET /health`                               | `200` ir serverio būsena                                             |
| `GET /equipment`                            | `200` ir pasirinkto klubo treniruoklių sąrašas                       |
| `POST /reservations`                        | `201` ir sukurta rezervacija                                         |
| `GET /members/{memberId}/reservations`      | `200` ir nario rezervacijų sąrašas, įskaitant atšauktas rezervacijas |
| `POST /reservations/{reservationId}/cancel` | `200` ir rezervacijos ID bei būsena `CANCELLED`                      |

### Rezervacijos sukūrimas

Užklausai `POST /reservations` nurodomos antraštės `X-Organization-Id: club-a` ir `Content-Type: application/json`.

```json
{
  "memberId": "member-1",
  "equipmentId": "equipment-1",
  "startsAt": "2027-01-15T14:00:00+02:00",
  "durationMinutes": 20
}
```

Užklausoje parenkamas laisvas laikas ateityje. Laukas `startsAt` pateikiamas ISO 8601 formatu su laiko poslinkiu arba `Z`. Sėkmingame atsakyme grąžinamas rezervacijos `id`, būsena `CONFIRMED` ir pradžios bei pabaigos laikai milisekundėmis nuo Unix epochos.

### Dažniausi klaidų atsakymai

| Kodas | Kada grąžinamas                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------- |
| `400` | Trūksta privalomos antraštės ar lauko arba užklausos duomenų formatas netinkamas.                   |
| `404` | Narys ar treniruoklis nerastas pasirinkto klubo kontekste arba nėra tinkamos atšaukti rezervacijos. |
| `409` | Narys arba treniruoklis tuo metu jau turi rezervaciją, arba viršijamas nario dienos limitas.        |
| `422` | Pradžios laikas jau praėjęs arba trukmė neatitinka klubo taisyklių.                                 |

## Demonstravimo scenarijus

1. Sukuriama būsima `member-1` rezervacija klube `club-a`. Iš `201` atsakymo paimamas rezervacijos `id`.
2. Dar kartą siunčiama ta pati kūrimo užklausa. Pavyzdinėje bazėje su laisvu dienos limitu gaunamas `409` su kodu `MEMBER_TIME_CONFLICT`. Atskiru klaidos bandymu vietoje `equipment-1` nurodomas `unknown`. Gaunamas `404` su kodu `EQUIPMENT_NOT_FOUND`.
3. `GET /members/member-1/reservations` siunčiama abiejų klubų kontekstuose. Sukurta rezervacija rodoma `club-a` sąraše.
4. `POST /reservations/{reservationId}/cancel` siunčiama su sukurtos rezervacijos ID ir `club-b` antrašte. Gaunamas `404`. Klubo `club-a` sąraše rezervacija išlieka `CONFIRMED`.
5. Ta pati atšaukimo užklausa siunčiama su `club-a` antrašte. Gaunamas `200` su būsena `CANCELLED`.

## Testai

```bash
npm test
npm run typecheck
```

Automatiniai testai tikrina rezervacijos išsaugojimą, konfliktus, klaidų atvejus, dienos limitą, rezervavimą per vidurnaktį ir treniruoklių duomenų atskyrimą pagal klubą. Testams naudojama atskira SQLite bazė atmintyje. `npm run typecheck` patikrina TypeScript tipus.

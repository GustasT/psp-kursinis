# [Treniruokliu rezervavimo sistema]

Kursinio darbo I dalis: projektavimo dokumentas

## 1. Problema ir idėja

**Sistema vienu sakiniu:** sistema skirta sporto klubams, kurie nori leisti klientams rezervuoti treniruoklius ir valdyti laukimo eiles.

**Problema ir dabartinis procesas:** sporto klubuose sportuojantys klientai neretai susiduria su situacija, kai jų norimi treniruokliai būna užimti kitų asmenų. Tai kelia nepasitenkinimą, gadina treniruotės kokybę, ypač kai norimų atlikti pratimų eiliškumas svarbus. Ši problema iki šiol sprendžiama tarpusavio susitarimu, neapibrėžtu laukimu, spontanišku pratimų keitimu.

**Nauda:** narys galės iš anksto rezervuoti norimą treniruoklį arba stoti į apibrėžtą, virtualią laukimo eilę.

**Naudotojai:** narys kurs, peržiūrės, aktyvuos ir atšauks rezervacijas. Administratorius valdys filialus, treniruoklių katalogą ir rezervavimo limitus.

**Prielaidos:** 
1. Sporto klubas turi narių identifikavimo sistemą ir gali perduoti faktą, kad narys įėjo į klubą.
2. Prie rezervuojamų treniruoklių galima įrengti QR ir/ar NFC identifikatorius.
3. Klientai turi išmaniuosius telefonus, palaikančius NFC/QR nuskaitymo funkcijas.
4. Kiekvienas sporto klubas pats nustato rezervavimo taisykles

## 2. Apimtis

| Funkcija | Ką naudotojas galės atlikti | Pagrindinis modulis ar pagalbinė funkcija |
|---|---|---|
| Rezervacijos sukūrimas | Klientas pasirinks konkretų treniruoklį, laiką ir trukmę. Sistema nuspręs, ar rezervaciją patvirtinti, atmesti, pasiūlyti laukimo eilę. | Pagrindinis modulis |
| Laukimo eilė | Jei pasirinktas intervalas užimtas, klientas galės stoti į eilę, o atsilaisvinus vietai bus pasiūlyta rezervacija | Pagalbinė funkcija |
| Rezervacijos aktyvavimas | Narys galės pažymėti, kad pradėjo naudotis rezervuotu treniruokliu | Pagalbinė funkcija |
| Rezervacijų peržiūra | Narys galės matyti savo būsimas ir aktyvias rezervacijas | Pagalbinė funkcija |
| Treniruoklių ir taisyklių administravimas | Administratorius galės suvesti treniruoklius ir rezervavimo limitus | Pagalbinė funkcija |

**Į kursinio darbo apimtį neįeina:** 
1. Inegracija su sporto klubo įėjimo sistema
2. QR/NFC techninis įgyvendinimas

## 3. Pagrindinis modulis

**Pavadinimas ir atsakomybė:** rezervacijos sukūrimo modulis gaus kliento prašymą rezervuoti treniruoklį ir nusprendžia, ar rezervaciją galima patvirtinti pagal sporto klubo taisykles ir esamas rezervacijas.

**Logika, kurią reikės projektuoti ir testuoti:** modulis tikrins rezervacijos trukmę, kliento dienos limitą, persidengiančias rezervacijas ir pasirinkto treniruoklio užimtumą

**Įvestis:** kliento ID, filialo ID, treniruoklio ID, pradžios laikas, trukmė minutėmis, kliento narystės tipas. Pvz: K-1, F-1, T-123, 2026-06-07 4:20, 9 min, Standard.

**Išvestis:** Patvirtinta, Atmesta_Priezastis, Eileje

**Veikimo eiga:** sistema patikrina sporto klubo kontekstą, trukmę, kliento dienos limitą, rezervacijų persidengimus, treniruoklio užimtumą. Jeigu visos taisyklės tenkinamos, rezervacija patvirtinama. Jei treniruoklis užimtas, klientui siūloma stoti į eilę.

### Taisyklės arba sprendimo žingsniai

1. Pateikiama rezervacijos pradžios data ir trukmė minutėmis
2. Rezervacija atmetama, jei jos trukmė neatitinka klubo nustatyto minimumo ar maksimumo
3. Rezervacija atmetama, jei klientas viršytų savo narystės tipo dienos limitą
4. Klientas negali turėti dviejų persidengiančių rezervacijų.
5. Vienas konkretus treniruoklis tuo pačiu metu gali turėti tik vieną rezervaciją.
6. Jei treniruoklis užimtas, klientas gali būti įtrauktas į laukimo eilę.

### Scenarijai būsimiems testams

| Scenarijus | Pradinės sąlygos ir konkreti įvestis | Veiksmas | Tikslus laukiamas rezultatas |
|---|---|---|---|
| Įprastas atvejis | Treniruoklis T-123 yra laisvas 2026-06-07 14:20 - 15:00. Klientas K-1, dar tai dienai nieko nerezervavęs, bando rezervuoti minėtą treniruoklį nuo 14:20 dešimčiai minučių, turėdamas Standard planą, leidžiantį rezervuoti 60 min per dieną. | Klientas K-1 rezervuoja treniruoklį T-123 nuo 14:20, trukmė: 20min | Rezervacija patvirtinama |
| Ribinis atvejis arba konfliktas | Treniruoklis T-123 yra laisvas nuo 2026-06-07 23:55 iki 2026-06-08 00:15. Klientas K-1 turi dar 10 min rezervacijos sąskaitoje šiai dienai. | Klientas K-1 rezervuoja treniruoklį T-123 nuo 2026-06-07 23:55, trukmė 20 min. | Rezervacija patvirtinama|
| Klaida arba neįmanomas rezultatas | Treniruoklis T-000 neegzistuoja sistemos treniruoklių kataloge. | Klientas K-1 bando rezervuoti treniruoklį T-000.  | Rezervacija atmetama, nes treniruoklis nerastas. |

**Jei modulis naudoja AI:** nenaudoja

## 4. Kokybės atributas

**Pasirinktas atributas:** palaikomumas

**Kodėl svarbus šiai sistemai:** sporto klubai gali turėti skirtingas rezervavimo taisykles, kurios ateityje taip pat gali būti keičiamos. Pavyzdžiui, gali keistis minimali ar maksimali rezervacijos trukmė, atsirasti nauji narystės tipai su skirtingais dienos limitais.

**Tikrinimo scenarijus ir sąlygos:** vėlesniame etape bus pakeista viena rezervavimo taisyklė, pavyzdžiui, pridėtas naujas narystės tipas "trainer", kuriam leidžiama rezervuoti iki 360 min. per dieną. Taip pat bus paliktos esamos "Standard" narystės taisyklės, kad būtų galima patikrinti, ar pakeitimas nepaveikė jau veikiančių rezervavimo atvejų.

**Sėkmės kriterijus:** "Trainer" limitas pridedamas taisyklių konfigūracijoje, nekeičiant rezervacijos algoritmo. Sistema taiko naują 360 min. limitą "trainer" klientams. Standard taisyklės ir esami testai lieka nepakitę.

**Numatytas projektavimo sprendimas:** rezervavimo limitai bus saugomi atskiroje taisyklių konfigūracijoje pagal narystės tipą.

**Kaip patikrinsiu vėlesniame etape:** bus pridėtas "Trainer" narystės tipas su 360 min. dienos limitu ir parašytas testas, kuris patikrins, kad "Trainer" klientas gali rezervuoti daugiau nei "Standard" limitas leidžia, bet negali viršyti 360 min. Taip pat bus paleisti esami "Standard" rezervacijų testai.

**Sprendimo kaina arba ribojimas:** reikės papildomos taisyklių konfigūracijos struktūros ir validacijos, kad kiekvienam narystės tipui būtų nurodytas teisingas dienos limitas. Tai padidins pradinę realizacijos apimtį.

## 5. Pradinė sistemos struktūra

### Paprasta schema

API klientas
    |
    v
REST API
    |
    v
Rezervacijos sukūrimo modulis
    |-- naudoja rezervavimo taisykles
    |-- tikrina treniruoklių katalogą
    |-- tikrina esamas rezervacijas
    |-- valdo laukimo eilę
    |
    v
SQLite duomenų bazė

| Sistemos dalis | Atsakomybė |
|---|---|
| REST API | Priima kliento ir administratoriaus veiksmus. |
| Rezervacijos modulis | Tikrina trukmę, limitus, persidengimus, treniruoklio užimtumą ir laukimo eilę. |
| Sporto klubo taisyklės | Saugo rezervacijos trukmės ribas ir narystės tipų limitus. |
| Treniruoklių katalogas | Saugo treniruoklius su ID, tipu, filialu ir modeliu. |
| Duomenų bazė | SQLite duomenų bazėje saugo sporto klubus, klientus, treniruoklius, taisykles, rezervacijas ir laukimo eiles. |

**Planuojamos technologijos ir pasirinkimo priežastys:** prototipas bus kuriamas su TypeScript ir Node.js kaip REST API. Node.js leidžia greitai sukurti paprastą API prototipą, o TypeScript tipai padės aiškiau aprašyti rezervacijos būsenas, narystės tipus ir rezervavimo taisykles. Duomenims bus naudojama "SQLite" duomenų bazė, nes ją galima paleisti lokaliai be atskiro serverio. Testams bus naudojamas "Vitest".

## 6. AI panaudojimas

### AI rengiant šį dokumentą

| Priemonė ir užduotis | Ką panaudojau | Ką atmečiau arba perrašiau ir kodėl | Kaip patikrinau |
|---|---|---|---|
| "ChatGPT/Codex" idėjos aptarimui ir alternatyvų palyginimui | Panaudojau diskusiją apie galimas projekto kryptis, rezervavimo sistemos ribas, galimus testavimo scenarijus ir kokybės atributo pasirinkimą. | Atmečiau siūlymą kokybės atributu rinktis saugumą, nes šiai sistemai svarbesnis palaikomumas. Taip pat atmečiau per plačias formuluotes. | Patikrinau pagal užduoties aprašą ir paskaitos medžiagą: ar yra aiški problema, pagrindinis modulis, testuojamos taisyklės, kokybės atributas ir apimties ribos. |

### Planuojamas AI naudojimas kuriant sistemą

**Kur ir kam naudosiu AI:** AI bus naudojamas kaip pagalbinė priemonė rašant kodą, aiškinantis dažnus patternus ir best practices.

**Kaip tikrinsiu pasiūlymus ir sugeneruotą kodą:** AI pasiūlymai bus peržiūrimi rankiniu būdu. Kodo pakeitimai bus tikrinami paleidžiant automatinius testus ir lyginant elgseną su šiame dokumente aprašytomis rezervavimo taisyklėmis.

**Ar AI bus sistemos funkcionalumo dalis:** Ne

## 7. Tolesnių darbų planas

| Darbas | Apčiuopiamas rezultatas | Planuojama darbų seka |
|---|---|---|
| Duomenų modelio paruošimas | Aprašyti klientai, filialai, treniruokliai, narystės tipai, rezervavimo taisyklės, rezervacijos ir laukimo eilės įrašai. | 1 |
| API ir minimalaus administravimo paruošimas | Galima suvesti treniruoklius, narystės limitus ir pavyzdinius klientus. | 2 |
| Rezervacijos sukūrimo modulio įgyvendinimas | Sistema patvirtina rezervaciją, atmeta ją pagal taisykles arba pasiūlo laukimo eilę. | 3 |
| Automatiniai testai | Paruošti įprasto, ribinio, klaidos ir palaikomumo scenarijų testai. | 4 |
| README ir demonstravimo scenarijus | Aprašytas projekto paleidimas, testų paleidimas ir demonstravimo žingsniai. | 5 |

**Būsimo prototipo veikimo scenarijus:** klientas rezervuoja treniruoklį T-123 15 min., sistema patvirtina rezervaciją. Tada kitas klientas bando rezervuoti tą patį treniruoklį persidengiančiu laiku ir gauna pasiūlymą stoti į laukimo eilę.

| Rizika arba neaiškumas | Kaip patikrinsiu arba sumažinsiu |
|---|---|
| Sistema gali tapti per plati. | Bus įgyvendinamas tik rezervacijos sukūrimas, laukimo eilė, aktyvavimas ir minimalus administravimas. |
| Check-in priklauso nuo išorinių įėjimo arba QR/NFC sistemų. | Prototipe check-in bus imituojamas sistemos įvykiu. |
| Skirtingų sporto klubų taisyklės gali keistis. | Rezervavimo limitai bus laikomi konfigūracijoje, o ne įrašyti tiesiai į algoritmą. |

## Šaltiniai, jei naudojote

Šaltiniai nenaudoti

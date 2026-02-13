# Wdrażanie (Deploy)

Aplikacja została zaktualizowana o funkcję przesyłania plików na forum. Poniżej znajdują się ważne informacje dotyczące wdrażania tej zmiany.

## Uwagi dotyczące przesyłania plików

Obecnie system przesyłania plików zapisuje dane w lokalnym folderze `public/uploads`.

### Wdrożenie na Vercel (Serverless)
**WAŻNE:** Jeśli wdrażasz projekt na Vercel:
1.  Przesłane pliki **nie będą trwałe**. Znikną po ponownym wdrożeniu lub resecie serwera (funkcje serverless mają ulotny system plików).
2.  Dla pełnej funkcjonalności na produkcji (Vercel) zalecana jest migracja na zewnętrzne rozwiązanie, np. **Vercel Blob** lub **AWS S3**.

### Wdrożenie na VPS / Dedykowany serwer
Jeśli wdrażasz na własny serwer (np. za pomocą Docker lub PM2), pliki będą zachowane, dopóki folder `public/uploads` nie zostanie usunięty.

## Wymagane kroki przed wdrożeniem

1.  **Baza Danych**: Upewnij się, że schemat bazy danych został zaktualizowany.
    ```bash
    npx prisma db push
    ```
    lub dla środowisk produkcyjnych:
    ```bash
    npx prisma migrate deploy
    ```

2.  **Zmienne środowiskowe**:
    Upewnij się, że `DATABASE_URL` i inne zmienne w `.env` są poprawne.

3.  **Budowanie**:
    Upewnij się, że aplikacja buduje się poprawnie:
    ```bash
    npm run build
    ```

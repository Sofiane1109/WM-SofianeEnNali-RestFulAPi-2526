<template>
  <ion-page>
    <!-- HEADER met titel en toevoeg-knop -->
    <ion-header>
      <ion-toolbar>
        <ion-title>Concerten</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openToevoegModal">
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- INHOUD -->
    <ion-content :fullscreen="true">
      <!-- Grote titel (alleen zichtbaar als je scrolt) -->
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Concerten</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- LAAD-SCHERM: Toon spinner als data aan het laden is -->
      <ion-grid v-if="aanHetLaden">
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-spinner></ion-spinner>
            <p>Laden...</p>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- FOUT-SCHERM: Toon foutmelding als er iets fout ging -->
      <ion-grid v-if="foutmelding">
        <ion-row>
          <ion-col>
            <ion-item color="danger">
              <ion-label>{{ foutmelding }}</ion-label>
            </ion-item>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- CONCERTEN LIJST: Toon alle concerten -->
      <ion-list v-if="!aanHetLaden && concerten.length > 0">
        <ion-item v-for="concert in concerten" :key="concert.id">
          <ion-label>
            <h2>{{ concert.artiest }}</h2>
            <p>{{ maakDatumMooi(concert.datum, concert.uur) }}</p>
            <p>📍 {{ concert.locatie }}</p>
            <p>💰 €{{ Number(concert.kostprijs).toFixed(2) }} - Capaciteit: {{ concert.capaciteit }}</p>
          </ion-label>
          <!-- Knoppen om te bewerken en verwijderen -->
          <ion-buttons slot="end">
            <ion-button @click="openBewerkModal(concert)">
              <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-button color="danger" @click="vraagBevestigingVerwijderen(concert)">
              <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
      </ion-list>

      <!-- LEEG-SCHERM: Toon als er geen concerten zijn -->
      <ion-grid v-if="!aanHetLaden && concerten.length === 0">
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-icon :icon="musicalNotesOutline" size="large"></ion-icon>
            <p>Geen concerten gevonden</p>
            <ion-button @click="openToevoegModal">Eerste concert toevoegen</ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

    </ion-content>
  </ion-page>
</template>

<script setup>
// STAP 1: Importeer alles wat je nodig hebt
import { ref, inject, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonButtons,
  IonIcon, IonSpinner, IonGrid, IonRow, IonCol,
  modalController, alertController, toastController
} from '@ionic/vue';
import {
  addOutline, createOutline, trashOutline, musicalNotesOutline
} from 'ionicons/icons';
import ConcertModal from '@/components/ConcertModal.vue';

// STAP 2: Haal axios op
const axios = inject('axios');

// STAP 3: API URL - PAS DIT AAN NAAR JOUW URL!
const API_URL = 'https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/concert.php';

// STAP 4: Maak variabelen
const concerten = ref([]);           // Lijst van alle concerten
const aanHetLaden = ref(false);      // Is data aan het laden?
const foutmelding = ref(null);       // Eventuele foutmelding

// STAP 5: Als de pagina laadt, haal de concerten op
onMounted(() => {
  haalConcertenOp();
});

// STAP 6: Functie om concerten op te halen van de API
const haalConcertenOp = () => {
  aanHetLaden.value = true;
  foutmelding.value = null;

  axios
    .get(API_URL)
    .then(response => {
      console.log('Data ontvangen:', response);
      // Zet de concerten in onze lijst
      concerten.value = Array.isArray(response.data) ? response.data : response.data.data || [];
    })
    .catch(error => {
      console.error('Fout bij laden:', error);
      foutmelding.value = 'Kon concerten niet laden';
    })
    .finally(() => {
      aanHetLaden.value = false;
    });
};

// STAP 7: Functie om modal te openen voor NIEUW concert
const openToevoegModal = async () => {
  const modal = await modalController.create({
    component: ConcertModal,
    componentProps: {
      // GEEN bestaandConcert meegeven = nieuw concert!
      bestaandConcert: null
    }
  });

  await modal.present();

  // Wacht tot modal sluit
  const { data } = await modal.onWillDismiss();

  // Als er iets opgeslagen is, haal de lijst opnieuw op
  if (data?.opgeslagen) {
    haalConcertenOp();
  }
};

// STAP 8: Functie om modal te openen om concert te BEWERKEN
const openBewerkModal = async (concert) => {
  console.log('Bewerken:', concert);

  const modal = await modalController.create({
    component: ConcertModal,
    componentProps: {
      // WEL bestaandConcert meegeven = bewerken!
      bestaandConcert: concert
    }
  });

  await modal.present();

  // Wacht tot modal sluit
  const { data } = await modal.onWillDismiss();

  // Als er iets opgeslagen is, haal de lijst opnieuw op
  if (data?.opgeslagen) {
    haalConcertenOp();
  }
};

// STAP 9: Functie om te vragen of gebruiker zeker is
const vraagBevestigingVerwijderen = async (concert) => {
  const alert = await alertController.create({
    header: 'Bevestigen',
    message: `Weet je zeker dat je "${concert.artiest}" wilt verwijderen?`,
    buttons: [
      {
        text: 'Annuleren',
        role: 'cancel'
      },
      {
        text: 'Verwijderen',
        role: 'destructive',
        handler: () => verwijderConcert(concert.id)
      }
    ]
  });

  await alert.present();
};

// STAP 10: Functie om concert te verwijderen
const verwijderConcert = (id) => {
  axios
    .delete(API_URL, {
      data: { id: id }
    })
    .then(response => {
      console.log('Verwijderd:', response);
      toonMelding('Concert verwijderd', 'success');
      haalConcertenOp(); // Haal lijst opnieuw op
    })
    .catch(error => {
      console.error('Fout bij verwijderen:', error);
      toonMelding('Fout bij verwijderen', 'danger');
    });
};

// STAP 11: Functie om datum en tijd mooi te maken
const maakDatumMooi = (datumString, tijdString) => {
  const datum = new Date(datumString);
  const mooieDatum = datum.toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const tijd = tijdString.substring(0, 5); // Haal alleen uur:minuut
  return `${mooieDatum} om ${tijd}`;
};

// STAP 12: Functie om een melding te tonen
const toonMelding = async (bericht, kleur = 'success') => {
  const toast = await toastController.create({
    message: bericht,
    duration: 2000,
    color: kleur,
    position: 'bottom'
  });
  await toast.present();
};
</script>

<style scoped>
/* Styling voor grote icoon */
ion-icon[size="large"] {
  font-size: 64px;
  opacity: 0.5;
  margin: 20px 0;
}
</style>
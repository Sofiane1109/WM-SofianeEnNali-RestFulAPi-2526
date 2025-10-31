<template>
  <ion-page>
    <!-- HEADER met titel en toevoeg-knop -->
    <ion-header>
      <ion-toolbar>
        <ion-title>Bezoekers</ion-title>
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
          <ion-title size="large">Bezoekers</ion-title>
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

      <!-- BEZOEKERS LIJST: Toon alle bezoekers -->
      <ion-list v-if="!aanHetLaden && bezoekers.length > 0">
        <ion-item v-for="bezoeker in bezoekers" :key="bezoeker.id" button @click="openDetailModal(bezoeker)">
          <ion-label>
            <h2>{{ bezoeker.voornaam }} {{ bezoeker.familienaam }}</h2>
            <p>📧 {{ bezoeker.emailadres }}</p>
            <p>🎂 {{ maakDatumMooi(bezoeker.geboortedatum) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- LEEG-SCHERM: Toon als er geen bezoekers zijn -->
      <ion-grid v-if="!aanHetLaden && bezoekers.length === 0">
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-icon :icon="peopleOutline" size="large"></ion-icon>
            <p>Geen bezoekers gevonden</p>
            <ion-button @click="openToevoegModal">Eerste bezoeker toevoegen</ion-button>
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
  modalController
} from '@ionic/vue';
import {
  addOutline, peopleOutline
} from 'ionicons/icons';
import BezoekerModal from '@/components/BezoekerFormModal.vue';
import BezoekerDetailModal from '@/components/BezoekerDetailModal.vue';

// STAP 2: Haal axios op
const axios = inject('axios');

// STAP 3: API URL 
const API_URL = 'https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/visitor.php';

// STAP 4: Maak variabelen
const bezoekers = ref([]);           // Lijst van alle bezoekers
const aanHetLaden = ref(false);      // Is data aan het laden?
const foutmelding = ref(null);       // Eventuele foutmelding

// STAP 5: Als de pagina laadt, haal de bezoekers op
onMounted(() => {
  haalBezoekersOp();
});

// STAP 6: Functie om bezoekers op te halen van de API
const haalBezoekersOp = () => {
  aanHetLaden.value = true;
  foutmelding.value = null;

  axios
    .get(API_URL)
    .then(response => {
      console.log('Data ontvangen:', response);
      // Zet de bezoekers in onze lijst
      bezoekers.value = Array.isArray(response.data) ? response.data : response.data.data || [];
    })
    .catch(error => {
      console.error('Fout bij laden:', error);
      foutmelding.value = 'Kon bezoekers niet laden';
    })
    .finally(() => {
      aanHetLaden.value = false;
    });
};

// STAP 7: Functie om detail modal te openen
const openDetailModal = async (bezoeker) => {
  const modal = await modalController.create({
    component: BezoekerDetailModal,
    componentProps: {
      bestaandeBezoeker: bezoeker
    }
  });

  await modal.present();

  // Wacht tot modal sluit
  const { data } = await modal.onWillDismiss();

  // Als er iets gewijzigd/verwijderd is, haal de lijst opnieuw op
  if (data?.vernieuwen) {
    haalBezoekersOp();
  }
};

// STAP 8: Functie om modal te openen voor NIEUW bezoeker
const openToevoegModal = async () => {
  const modal = await modalController.create({
    component: BezoekerModal,
    componentProps: {
      // GEEN bestaandeBezoeker meegeven = nieuw bezoeker!
      bestaandeBezoeker: null
    }
  });

  await modal.present();

  // Wacht tot modal sluit
  const { data } = await modal.onWillDismiss();

  // Als er iets opgeslagen is, haal de lijst opnieuw op
  if (data?.opgeslagen) {
    haalBezoekersOp();
  }
};

// STAP 9: Functie om datum mooi te maken
const maakDatumMooi = (datumString) => {
  const datum = new Date(datumString);
  return datum.toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
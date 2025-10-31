<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header>
      <ion-toolbar>
        <ion-title>Pagina Titel</ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- INHOUD -->
    <ion-content :fullscreen="true">
      <!-- Grote titel (alleen zichtbaar als je scrolt) -->
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Pagina Titel</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Hier komt jouw inhoud -->
      
    </ion-content>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent
} from '@ionic/vue';
</script>

<style scoped>
/* Hier komt jouw styling */
</style>
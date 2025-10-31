<template>
    <ion-page>
        <!-- HEADER -->
        <ion-header>
            <ion-toolbar>
                <ion-title>About</ion-title>
            </ion-toolbar>
        </ion-header>

        <!-- INHOUD -->
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">About</ion-title>
                </ion-toolbar>
            </ion-header>

            <ion-grid class="ion-padding">
                <!-- PROFIELFOTO SECTIE -->
                <ion-row>
                    <ion-col class="ion-text-center">
                        <div class="profielfoto-container">
                            <img src="/public/profil.png" alt="Sofiane En-Nali" class="profielfoto" />
                        </div>
                        <h2>Sofiane En-Nali</h2>
                    </ion-col>
                </ion-row>

                <!-- OVER DE APP -->
                <ion-row>
                    <ion-col>
                        <ion-card>
                            <ion-card-header>
                                <ion-card-title>
                                    <ion-icon :icon="musicalNotesOutline"></ion-icon>
                                    Over de App
                                </ion-card-title>
                            </ion-card-header>
                            <ion-card-content>
                                <p>
                                    Deze app is een gebruiksvriendelijke applicatie
                                    waarmee je eenvoudig concerten kan beheren en tickets kan verkopen.
                                </p>
                                <p class="ion-margin-top">
                                    De app biedt een overzicht van alle aankomende concerten in Brussel,
                                    laat je bezoekers registreren en houdt bij wie welke tickets heeft gekocht.
                                </p>
                                <p class="ion-margin-top">
                                    Perfect voor kleine concertzalen, muziekfestivals of evenementenorganisatoren
                                    die hun ticketverkoop willen digitaliseren.
                                </p>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>

                <!-- OVER DE ONTWIKKELAAR -->
                <ion-row>
                    <ion-col>
                        <ion-card>
                            <ion-card-header>
                                <ion-card-title>
                                    <ion-icon :icon="personOutline"></ion-icon>
                                    Over de Ontwikkelaar
                                </ion-card-title>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-list lines="none">
                                    <ion-item>
                                        <ion-icon :icon="personCircleOutline" slot="start" color="primary"></ion-icon>
                                        <ion-label>
                                            <p>Naam</p>
                                            <h3>Sofiane En-Nali</h3>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item>
                                        <ion-icon :icon="calendarOutline" slot="start" color="primary"></ion-icon>
                                        <ion-label>
                                            <p>Leeftijd</p>
                                            <h3>19 jaar</h3>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item>
                                        <ion-icon :icon="locationOutline" slot="start" color="primary"></ion-icon>
                                        <ion-label>
                                            <p>Woonplaats</p>
                                            <h3>Brussel, België</h3>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item>
                                        <ion-icon :icon="heartOutline" slot="start" color="primary"></ion-icon>
                                        <ion-label>
                                            <p>Bijnaam</p>
                                            <h3>Cerise 🍒</h3>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item>
                                        <ion-icon :icon="footballOutline" slot="start" color="primary"></ion-icon>
                                        <ion-label>
                                            <p>Hobby's</p>
                                            <h3>Zaalvoetbal ⚽</h3>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item>
                                        <ion-icon :icon="peopleOutline" slot="start" color="primary"></ion-icon>
                                        <ion-label>
                                            <p>In mijn vrije tijd</p>
                                            <h3>Buitengaan met vrienden 🚗</h3>
                                        </ion-label>
                                    </ion-item>
                                </ion-list>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>

                <!-- APP FEATURES -->
                <ion-row>
                    <ion-col>
                        <ion-card>
                            <ion-card-header>
                                <ion-card-title>
                                    <ion-icon :icon="starOutline"></ion-icon>
                                    Features
                                </ion-card-title>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-list>
                                    <ion-item>
                                        <ion-icon :icon="checkmarkCircleOutline" slot="start"
                                            color="success"></ion-icon>
                                        <ion-label>
                                            <h3>Concerten beheren</h3>
                                            <p>Voeg concerten toe, bewerk details en verwijder evenementen</p>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item>
                                        <ion-icon :icon="checkmarkCircleOutline" slot="start"
                                            color="success"></ion-icon>
                                        <ion-label>
                                            <h3>Bezoekers registreren</h3>
                                            <p>Houd een database bij van alle bezoekers en hun gegevens</p>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item>
                                        <ion-icon :icon="checkmarkCircleOutline" slot="start"
                                            color="success"></ion-icon>
                                        <ion-label>
                                            <h3>Tickets verkopen</h3>
                                            <p>Registreer ticketverkoop en zie welke bezoeker welke tickets heeft</p>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item>
                                        <ion-icon :icon="checkmarkCircleOutline" slot="start"
                                            color="success"></ion-icon>
                                        <ion-label>
                                            <h3>Overzichtelijk dashboard</h3>
                                            <p>Alle informatie op één plek, makkelijk te navigeren</p>
                                        </ion-label>
                                    </ion-item>

                                     <ion-item>
                                        <ion-icon :icon="checkmarkCircleOutline" slot="start"
                                            color="success"></ion-icon>
                                        <ion-label>
                                            <h3>Comming soon...</h3>
                                            <p></p>
                                        </ion-label>
                                    </ion-item>
                                </ion-list>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>

                <!-- FOOTER -->
                <ion-row>
                    <ion-col class="ion-text-center">
                        <p class="footer-text">
                            Gemaakt in Brussel<br>
                            © 2025 Sofiane En-Nali
                        </p>
                    </ion-col>
                </ion-row>

            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script setup>
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonIcon
} from '@ionic/vue';
import {
    musicalNotesOutline, personOutline, personCircleOutline,
    calendarOutline, locationOutline, heartOutline, footballOutline,
    peopleOutline, starOutline, checkmarkCircleOutline
} from 'ionicons/icons';
</script>

<style scoped>
/* Profielfoto styling */
.profielfoto-container {
    margin: 30px auto;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid #f22368;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profielfoto {
    width: 100%;
    height: 100%;
    object-fit: cover;
}


/* Card titles met icons */
ion-card-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

ion-card-title ion-icon {
    font-size: 1.5rem;
}

/* Footer text */
.footer-text {
    font-size: 0.9rem;
    margin-top: 30px;
    margin-bottom: 20px;
}

/* Spacing voor cards */
ion-card {
    margin-bottom: 16px;
}

/* Item labels */
h3 {
    font-weight: 600;
}

p {
    font-size: 0.85rem;
}
</style>
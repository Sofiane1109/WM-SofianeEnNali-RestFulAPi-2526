<template>
	<ion-page>
		<!-- HEADER -->
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-button @click="sluitModal">
						<ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
					</ion-button>
				</ion-buttons>
				<ion-title>Bezoeker Details</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="openBewerkModal">
						<ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
					</ion-button>
					<ion-button color="danger" @click="vraagBevestigingVerwijderen">
						<ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
					</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>

		<!-- INHOUD -->
		<ion-content>
			<!-- Bezoeker info -->
			<ion-card>
				<ion-card-header>
					<ion-card-title>{{ props.bestaandeBezoeker.voornaam }} {{ props.bestaandeBezoeker.familienaam }}</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					<ion-list>
						<ion-item>
							<ion-icon :icon="mailOutline" slot="start"></ion-icon>
							<ion-label>
								<p>E-mailadres</p>
								<h3>{{ props.bestaandeBezoeker.emailadres }}</h3>
							</ion-label>
						</ion-item>
						<ion-item>
							<ion-icon :icon="calendarOutline" slot="start"></ion-icon>
							<ion-label>
								<p>Geboortedatum</p>
								<h3>{{ DatumFormat(props.bestaandeBezoeker.geboortedatum) }}</h3>
							</ion-label>
						</ion-item>
					</ion-list>
				</ion-card-content>
			</ion-card>

			<!-- Tickets info -->
			<ion-card>
				<ion-card-header>
					<ion-card-title>Gekochte Tickets</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					<!-- Loading -->
					

					<!-- Tickets lijst -->
					<ion-list v-if="tickets.length > 0">
						<ion-item v-for="ticket in tickets" :key="ticket.id">
							<ion-label>
								<h2>{{ ticket.artiest }}</h2>
								<p>📅 {{ DatumFormat(ticket.datum) }} om {{ ticket.uur }}</p>
								<p>📍 {{ ticket.locatie }}</p>
								<p>🎫 {{ ticket.aantal }} ticket(s)</p>
							</ion-label>
						</ion-item>
					</ion-list>

					<!-- Geen tickets -->
					<div v-if="tickets.length === 0" class="ion-text-center ion-padding">
						<p>Nog geen tickets gekocht</p>
					</div>
				</ion-card-content>
			</ion-card>
		</ion-content>
	</ion-page>
</template>

<script setup>
// STAP 1: Importeer wat je nodig hebt
import { ref, inject, defineProps, onMounted } from 'vue';
import {
	IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
	IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonList, IonItem, IonLabel,
	modalController, alertController, toastController
} from '@ionic/vue';
import { closeOutline, createOutline, trashOutline, mailOutline, calendarOutline } from 'ionicons/icons';
import BezoekerModal from '@/components/BezoekerFormModal.vue';

// STAP 2: Definieer props
const props = defineProps({
	bestaandeBezoeker: {
		type: Object,
		required: true
	}
});

// STAP 3: Haal axios op
const axios = inject('axios');

// STAP 4: API URLs 
const API_URL = 'https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/visitor.php';
const TICKETS_API = 'https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/ticket.php';
const CONCERTEN_API = 'https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/concert.php';

// STAP 5: Variabelen
const tickets = ref([]);
const concerten = ref([]);

// STAP 6: Als modal opent, haal tickets op
onMounted(() => {
	haalConcertenOp();
	haalTicketsOp();
});

// STAP 7: Haal alle concerten op
const haalConcertenOp = () => {
	axios
		.get(CONCERTEN_API)
		.then(response => {
			concerten.value = Array.isArray(response.data) ? response.data : response.data.data || [];
		})
		.catch(error => {
			console.error('Fout bij laden concerten:', error);
		});
};

// STAP 8: Haal tickets op en combineer met concert info
const haalTicketsOp = () => {

	axios
		.get(TICKETS_API)
		.then(response => {
			let alleTickets = Array.isArray(response.data) ? response.data : response.data.data || [];
			
			// Filter: alleen tickets van deze bezoeker
			let bezoekerTickets = [];
			for (let i = 0; i < alleTickets.length; i++) {
				if (alleTickets[i].bezoeker_id === props.bestaandeBezoeker.id) {
					bezoekerTickets.push(alleTickets[i]);
				}
			}
			
			// Voeg concert info toe
			let ticketsMetInfo = [];
			for (let i = 0; i < bezoekerTickets.length; i++) {
				let ticket = bezoekerTickets[i];
				let concert = null;
				
				// Zoek het concert
				for (let j = 0; j < concerten.value.length; j++) {
					if (concerten.value[j].id === ticket.concert_id) {
						concert = concerten.value[j];
						break;
					}
				}
				
				// Maak volledig ticket
				ticketsMetInfo.push({
					id: ticket.id,
					aantal: ticket.aantal,
					artiest: concert ? concert.artiest : 'Onbekend',
					datum: concert ? concert.datum : '',
					uur: concert ? concert.uur : '',
					locatie: concert ? concert.locatie : 'Onbekend'
				});
			}
			
			tickets.value = ticketsMetInfo;
		})
		.catch(error => {
			console.error('Fout bij laden tickets:', error);
		})
};

// STAP 9: Datum mooi maken
const DatumFormat = (datumString) => {
	if (!datumString) return '';
	const datum = new Date(datumString);
	return datum.toLocaleDateString('nl-BE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
};

// STAP 10: Open bewerk modal
const openBewerkModal = async () => {
	const modal = await modalController.create({
		component: BezoekerModal,
		componentProps: {
			bestaandeBezoeker: props.bestaandeBezoeker
		}
	});

	await modal.present();
	const { data } = await modal.onWillDismiss();

	if (data && data.opgeslagen) {
		sluitModal(true);
	}
};

// STAP 11: Vraag bevestiging voor verwijderen
const vraagBevestigingVerwijderen = async () => {
	const alert = await alertController.create({
		header: 'Bevestigen',
		message: 'Weet je zeker dat je ' + props.bestaandeBezoeker.voornaam + ' ' + props.bestaandeBezoeker.familienaam + ' wilt verwijderen?',
		buttons: [
			{
				text: 'Annuleren',
				role: 'cancel'
			},
			{
				text: 'Verwijderen',
				role: 'destructive',
				handler: () => verwijderBezoeker()
			}
		]
	});

	await alert.present();
};

// STAP 12: Verwijder bezoeker
const verwijderBezoeker = () => {
	axios
		.delete(API_URL, {
			data: { id: props.bestaandeBezoeker.id }
		})
		.then(response => {
			console.log('Bezoeker verwijderd:', response);
			toonMelding('Bezoeker verwijderd', 'success');
			sluitModal(true);
		})
		.catch(error => {
			console.error('Fout bij verwijderen:', error);
			toonMelding('Fout bij verwijderen. Mogelijk heeft deze bezoeker nog tickets.', 'danger');
		});
};

// STAP 13: Sluit modal
const sluitModal = (vernieuwen) => {
	if (vernieuwen === undefined) {
		vernieuwen = false;
	}
	modalController.dismiss({ vernieuwen: vernieuwen });
};

// STAP 14: Toon melding
const toonMelding = async (bericht, kleur) => {
	if (kleur === undefined) {
		kleur = 'success';
	}
	const toast = await toastController.create({
		message: bericht,
		duration: 2000,
		color: kleur,
		position: 'bottom'
	});
	await toast.present();
};
</script>
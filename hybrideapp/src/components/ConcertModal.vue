<template>
	<ion-page>
		<!-- HEADER met annuleren en opslaan knoppen -->
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-button @click="sluitModal">
						<ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
					</ion-button>
				</ion-buttons>
				<!-- Titel verandert: "Toevoegen" of "Bewerken" -->
				<ion-title>{{ isBewerken ? 'Concert bewerken' : 'Concert toevoegen' }}</ion-title>
			</ion-toolbar>
		</ion-header>

		<!-- INHOUD met alle invoervelden -->
		<ion-content>
			<ion-grid>
				<!-- ARTIEST veld -->
				<ion-row>
					<ion-col>
						<ion-item>
							<ion-input label="Artiest" label-placement="stacked" placeholder="Bijv. Arctic Monkeys"
								v-model="artiest">
							</ion-input>
						</ion-item>
						<!-- Foutmelding als artiest leeg is -->
						<ion-text color="danger" v-if="fouten.artiest">
							<p class="ion-padding-start">{{ fouten.artiest }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<!-- DATUM en UUR velden naast elkaar -->
				<ion-row>
					<ion-col size="6">
						<ion-item>
							<ion-input label="Datum" label-placement="stacked" type="date" v-model="datum">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.datum">
							<p class="ion-padding-start">{{ fouten.datum }}</p>
						</ion-text>
					</ion-col>
					<ion-col size="6">
						<ion-item>
							<ion-input label="Uur" label-placement="stacked" type="time" v-model="uur">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.uur">
							<p class="ion-padding-start">{{ fouten.uur }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<!-- LOCATIE veld -->
				<ion-row>
					<ion-col>
						<ion-item>
							<ion-input label="Locatie" label-placement="stacked"
								placeholder="Bijv. Forest National, Brussels" v-model="locatie">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.locatie">
							<p class="ion-padding-start">{{ fouten.locatie }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<!-- KOSTPRIJS en CAPACITEIT velden naast elkaar -->
				<ion-row>
					<ion-col size="6">
						<ion-item>
							<ion-input label="Kostprijs (€)" label-placement="stacked" placeholder="65.00"
								v-model="kostprijs" type="number" step="0.01">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.kostprijs">
							<p class="ion-padding-start">{{ fouten.kostprijs }}</p>
						</ion-text>
					</ion-col>
					<ion-col size="6">
						<ion-item>
							<ion-input label="Capaciteit" label-placement="stacked" placeholder="5000"
								v-model="capaciteit" type="number">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.capaciteit">
							<p class="ion-padding-start">{{ fouten.capaciteit }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<!-- OPSLAAN KNOP -->
				<ion-row>
					<ion-col>
						<ion-button expand="block" @click="opslaanConcert" color="primary" class="ion-margin-top">
							{{ isBewerken ? 'Opslaan' : 'Concert toevoegen' }}
						</ion-button>
					</ion-col>
				</ion-row>

			</ion-grid>
		</ion-content>
	</ion-page>
</template>

<script setup>
// STAP 1: Importeer wat je nodig hebt
import { ref, inject, defineProps, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
	IonButtons, IonButton, IonGrid, IonRow, IonCol,
	IonItem, IonInput, IonText, modalController, toastController
} from '@ionic/vue';
import { closeOutline} from 'ionicons/icons';

// STAP 2: Definieer props (data die we van Home.vue krijgen)
// Props = data die wordt doorgestuurd vanuit de parent component
const props = defineProps({
	// Als we een concert krijgen, dan zijn we aan het BEWERKEN
	// Als we GEEN concert krijgen, dan zijn we aan het TOEVOEGEN
	bestaandConcert: {
		type: Object,
		default: null  // Standaard = null (dus: nieuw concert)
	}
});

// STAP 3: Haal axios op (voor API calls)
const axios = inject('axios');

// STAP 4: API URL - PAS DIT AAN NAAR JOUW URL!
const API_URL = 'https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/concert.php';

// STAP 5: Maak variabelen voor alle invoervelden
const concertId = ref(null);      // ID (alleen bij bewerken)
const artiest = ref('');
const datum = ref('');
const uur = ref('');
const locatie = ref('');
const kostprijs = ref(0);
const capaciteit = ref(0);

// STAP 6: Zijn we aan het bewerken of toevoegen?
const isBewerken = ref(false);

// STAP 7: Maak een object voor foutmeldingen
const fouten = ref({
	artiest: '',
	datum: '',
	uur: '',
	locatie: '',
	kostprijs: '',
	capaciteit: ''
});

// STAP 8: Als de modal opent, vul dan de velden in (als we aan het bewerken zijn)
onMounted(() => {
	// Check: hebben we een bestaand concert gekregen?
	if (props.bestaandConcert) {
		// JA! Dan zijn we aan het BEWERKEN
		isBewerken.value = true;

		// Vul alle velden met de bestaande data
		concertId.value = props.bestaandConcert.id;
		artiest.value = props.bestaandConcert.artiest;
		datum.value = props.bestaandConcert.datum;
		uur.value = props.bestaandConcert.uur;
		locatie.value = props.bestaandConcert.locatie;
		kostprijs.value = props.bestaandConcert.kostprijs;
		capaciteit.value = props.bestaandConcert.capaciteit;

		console.log('Bewerken concert:', props.bestaandConcert);
	} else {
		// NEE! Dan zijn we aan het TOEVOEGEN
		isBewerken.value = false;
		console.log('Nieuw concert toevoegen');
	}
});

// STAP 9: Functie om te controleren of alles goed is ingevuld
const controleerFormulier = () => {
	// Reset alle fouten eerst
	fouten.value = {
		artiest: '',
		datum: '',
		uur: '',
		locatie: '',
		kostprijs: '',
		capaciteit: ''
	};

	let isGeldig = true;

	// Controleer elk veld
	if (!artiest.value || artiest.value.trim() === '') {
		fouten.value.artiest = 'Artiest is verplicht';
		isGeldig = false;
	}

	if (!datum.value) {
		fouten.value.datum = 'Datum is verplicht';
		isGeldig = false;
	}

	if (!uur.value) {
		fouten.value.uur = 'Uur is verplicht';
		isGeldig = false;
	}

	if (!locatie.value || locatie.value.trim() === '') {
		fouten.value.locatie = 'Locatie is verplicht';
		isGeldig = false;
	}

	if (!kostprijs.value || kostprijs.value <= 0) {
		fouten.value.kostprijs = 'Kostprijs moet groter zijn dan 0';
		isGeldig = false;
	}

	if (!capaciteit.value || capaciteit.value <= 0) {
		fouten.value.capaciteit = 'Capaciteit moet groter zijn dan 0';
		isGeldig = false;
	}

	return isGeldig;
};

// STAP 10: Functie om concert op te slaan
const opslaanConcert = () => {
	// Eerst controleren of alles goed is ingevuld
	if (!controleerFormulier()) {
		toonMelding('Gelieve alle velden correct in te vullen', 'warning');
		return;
	}

	// Check: zijn we aan het bewerken of toevoegen?
	if (isBewerken.value) {
		// BEWERKEN: gebruik PUT
		wijzigConcert();
	} else {
		// TOEVOEGEN: gebruik POST
		maakNieuwConcert();
	}
};

// STAP 11: Functie om een NIEUW concert te maken (POST)
const maakNieuwConcert = () => {
	console.log('Nieuw concert aanmaken...');

	axios
		.post(API_URL, {
			artiest: artiest.value,
			datum: datum.value,
			uur: uur.value,
			locatie: locatie.value,
			kostprijs: kostprijs.value,
			capaciteit: capaciteit.value
		})
		.then(response => {
			// Gelukt!
			console.log('Concert aangemaakt:', response);
			toonMelding('Concert toegevoegd', 'success');
			modalController.dismiss({ opgeslagen: true });
		})
		.catch(error => {
			// Mislukt :(
			console.error('Fout bij aanmaken:', error);
			toonMelding('Fout bij toevoegen', 'danger');
		});
};

// STAP 12: Functie om een BESTAAND concert te wijzigen (PUT)
const wijzigConcert = () => {
	console.log('Concert wijzigen...', concertId.value);

	axios
		.put(API_URL, {
			id: concertId.value,  // BELANGRIJK: stuur het ID mee!
			artiest: artiest.value,
			datum: datum.value,
			uur: uur.value,
			locatie: locatie.value,
			kostprijs: kostprijs.value,
			capaciteit: capaciteit.value
		})
		.then(response => {
			// Gelukt!
			console.log('Concert gewijzigd:', response);
			toonMelding('Concert bijgewerkt', 'success');
			modalController.dismiss({ opgeslagen: true });
		})
		.catch(error => {
			// Mislukt :(
			console.error('Fout bij wijzigen:', error);
			toonMelding('Fout bij wijzigen', 'danger');
		});
};

// STAP 13: Functie om modal te sluiten zonder op te slaan
const sluitModal = () => {
	modalController.dismiss({ opgeslagen: false });
};

// STAP 14: Functie om een melding te tonen (toast)
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
/* Styling voor de foutmeldingen */
ion-text p {
	font-size: 0.875rem;
	margin-top: 0.25rem;
}
</style>
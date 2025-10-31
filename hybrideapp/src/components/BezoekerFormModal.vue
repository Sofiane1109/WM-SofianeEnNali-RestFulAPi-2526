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
				<ion-title>{{ isBewerken ? 'Bezoeker bewerken' : 'Bezoeker toevoegen' }}</ion-title>
			</ion-toolbar>
		</ion-header>

		<!-- INHOUD met alle invoervelden -->
		<ion-content>
			<ion-grid>
				<!-- VOORNAAM en FAMILIENAAM velden naast elkaar -->
				<ion-row>
					<ion-col size="6">
						<ion-item>
							<ion-input label="Voornaam" label-placement="stacked" placeholder="Emma" v-model="voornaam">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.voornaam">
							<p class="ion-padding-start">{{ fouten.voornaam }}</p>
						</ion-text>
					</ion-col>
					<ion-col size="6">
						<ion-item>
							<ion-input label="Familienaam" label-placement="stacked" placeholder="De Smet" v-model="familienaam">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.familienaam">
							<p class="ion-padding-start">{{ fouten.familienaam }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<!-- GEBOORTEDATUM veld -->
				<ion-row>
					<ion-col>
						<ion-item>
							<ion-input label="Geboortedatum" label-placement="stacked" type="date" v-model="geboortedatum">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.geboortedatum">
							<p class="ion-padding-start">{{ fouten.geboortedatum }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<!-- EMAILADRES veld -->
				<ion-row>
					<ion-col>
						<ion-item>
							<ion-input label="E-mailadres" label-placement="stacked" type="email" placeholder="emma.desmet@example.com" v-model="emailadres">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="fouten.emailadres">
							<p class="ion-padding-start">{{ fouten.emailadres }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<!-- OPSLAAN KNOP -->
				<ion-row>
					<ion-col>
						<ion-button expand="block" @click="opslaanBezoeker" color="primary" class="ion-margin-top">
							{{ isBewerken ? 'Opslaan' : 'Bezoeker toevoegen' }}
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

// STAP 2: Definieer props (data die we van BezoekerPage.vue krijgen)
const props = defineProps({
	bestaandeBezoeker: {
		type: Object,
		default: null
	}
});

// STAP 3: Haal axios op (voor API calls)
const axios = inject('axios');

// STAP 4: API URL - PAS DIT AAN NAAR JOUW URL!
const API_URL = 'https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/visitor.php';

// STAP 5: Maak variabelen voor alle invoervelden
const bezoekerId = ref(null);
const voornaam = ref('');
const familienaam = ref('');
const geboortedatum = ref('');
const emailadres = ref('');

// STAP 6: Zijn we aan het bewerken of toevoegen?
const isBewerken = ref(false);

// STAP 7: Maak een object voor foutmeldingen
const fouten = ref({
	voornaam: '',
	familienaam: '',
	geboortedatum: '',
	emailadres: ''
});

// STAP 8: Als de modal opent, vul dan de velden in (als we aan het bewerken zijn)
onMounted(() => {
	if (props.bestaandeBezoeker) {
		isBewerken.value = true;
		bezoekerId.value = props.bestaandeBezoeker.id;
		voornaam.value = props.bestaandeBezoeker.voornaam;
		familienaam.value = props.bestaandeBezoeker.familienaam;
		geboortedatum.value = props.bestaandeBezoeker.geboortedatum;
		emailadres.value = props.bestaandeBezoeker.emailadres;
		console.log('Bewerken bezoeker:', props.bestaandeBezoeker);
	} else {
		isBewerken.value = false;
		console.log('Nieuw bezoeker toevoegen');
	}
});

// STAP 9: Functie om te controleren of alles goed is ingevuld
const controleerFormulier = () => {
	fouten.value = {
		voornaam: '',
		familienaam: '',
		geboortedatum: '',
		emailadres: ''
	};

	let isGeldig = true;

	if (!voornaam.value || voornaam.value.trim() === '') {
		fouten.value.voornaam = 'Voornaam is verplicht';
		isGeldig = false;
	}

	if (!familienaam.value || familienaam.value.trim() === '') {
		fouten.value.familienaam = 'Familienaam is verplicht';
		isGeldig = false;
	}

	if (!geboortedatum.value) {
		fouten.value.geboortedatum = 'Geboortedatum is verplicht';
		isGeldig = false;
	} else {
		const birthDate = new Date(geboortedatum.value);
		const today = new Date();
		const age = today.getFullYear() - birthDate.getFullYear();
		if (age < 13) {
			fouten.value.geboortedatum = 'Bezoeker moet minstens 13 jaar oud zijn';
			isGeldig = false;
		}
	}

	if (!emailadres.value || emailadres.value.trim() === '') {
		fouten.value.emailadres = 'E-mailadres is verplicht';
		isGeldig = false;
	} else {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailadres.value)) {
			fouten.value.emailadres = 'Ongeldig e-mailadres';
			isGeldig = false;
		}
	}

	return isGeldig;
};

// STAP 10: Functie om bezoeker op te slaan
const opslaanBezoeker = () => {
	if (!controleerFormulier()) {
		toonMelding('Gelieve alle velden correct in te vullen', 'warning');
		return;
	}

	if (isBewerken.value) {
		wijzigBezoeker();
	} else {
		maakNieuweBezoeker();
	}
};

// STAP 11: Functie om een NIEUW bezoeker te maken (POST)
const maakNieuweBezoeker = () => {
	console.log('Nieuwe bezoeker aanmaken...');

	axios
		.post(API_URL, {
			voornaam: voornaam.value,
			familienaam: familienaam.value,
			geboortedatum: geboortedatum.value,
			emailadres: emailadres.value
		})
		.then(response => {
			console.log('Bezoeker aangemaakt:', response);
			toonMelding('Bezoeker toegevoegd', 'success');
			modalController.dismiss({ opgeslagen: true });
		})
		.catch(error => {
			console.error('Fout bij aanmaken:', error);
			if (error.response && error.response.status === 409) {
				toonMelding('Dit e-mailadres is al in gebruik', 'danger');
			} else {
				toonMelding('Fout bij toevoegen', 'danger');
			}
		});
};

// STAP 12: Functie om een BESTAAND bezoeker te wijzigen (PUT)
const wijzigBezoeker = () => {
	console.log('Bezoeker wijzigen...', bezoekerId.value);

	axios
		.put(API_URL, {
			id: bezoekerId.value,
			voornaam: voornaam.value,
			familienaam: familienaam.value,
			geboortedatum: geboortedatum.value,
			emailadres: emailadres.value
		})
		.then(response => {
			console.log('Bezoeker gewijzigd:', response);
			toonMelding('Bezoeker bijgewerkt', 'success');
			modalController.dismiss({ opgeslagen: true });
		})
		.catch(error => {
			console.error('Fout bij wijzigen:', error);
			if (error.response && error.response.status === 409) {
				toonMelding('Dit e-mailadres is al in gebruik', 'danger');
			} else {
				toonMelding('Fout bij wijzigen', 'danger');
			}
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
ion-text p {
	font-size: 0.875rem;
	margin-top: 0.25rem;
}
</style>
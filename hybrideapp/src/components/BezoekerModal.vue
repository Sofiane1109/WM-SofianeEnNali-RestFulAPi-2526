<template>
	<ion-page>
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-button @click="cancel">Annuleren</ion-button>
				</ion-buttons>
				<ion-title>{{ title }}</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="save" :strong="true">Opslaan</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>

		<ion-content>
			<ion-grid>
				<ion-row>
					<ion-col size="6">
						<ion-item>
							<ion-input 
								label="Voornaam" 
								label-placement="stacked" 
								placeholder="Emma"
								v-model="voornaam" 
								required="true"
								@ion-blur="validateForm()">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="errors.voornaam">
							<p class="ion-padding-start">{{ errors.voornaam }}</p>
						</ion-text>
					</ion-col>
					<ion-col size="6">
						<ion-item>
							<ion-input 
								label="Familienaam" 
								label-placement="stacked" 
								placeholder="De Smet"
								v-model="familienaam" 
								required="true"
								@ion-blur="validateForm()">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="errors.familienaam">
							<p class="ion-padding-start">{{ errors.familienaam }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<ion-row>
					<ion-col>
						<ion-item>
							<ion-input 
								label="Geboortedatum" 
								label-placement="stacked" 
								type="date"
								v-model="geboortedatum" 
								required="true"
								@ion-blur="validateForm()">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="errors.geboortedatum">
							<p class="ion-padding-start">{{ errors.geboortedatum }}</p>
						</ion-text>
					</ion-col>
				</ion-row>

				<ion-row>
					<ion-col>
						<ion-item>
							<ion-input 
								label="E-mailadres" 
								label-placement="stacked" 
								type="email"
								placeholder="emma.desmet@example.com"
								v-model="emailadres" 
								required="true"
								@ion-blur="validateForm()">
							</ion-input>
						</ion-item>
						<ion-text color="danger" v-if="errors.emailadres">
							<p class="ion-padding-start">{{ errors.emailadres }}</p>
						</ion-text>
					</ion-col>
				</ion-row>
			</ion-grid>
		</ion-content>
	</ion-page>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import {
	IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
	IonButtons, IonButton, IonGrid, IonRow, IonCol,
	IonItem, IonInput, IonText, modalController, toastController
} from '@ionic/vue';

const props = defineProps({
	title: {
		type: String,
		default: 'Bezoeker toevoegen'
	},
	bezoeker: {
		type: Object,
		default: null
	},
	apiUrl: {
		type: String,
		required: true
	}
});

const axios = inject('axios');

const voornaam = ref('');
const familienaam = ref('');
const geboortedatum = ref('');
const emailadres = ref('');

const errors = ref({
	voornaam: '',
	familienaam: '',
	geboortedatum: '',
	emailadres: ''
});

onMounted(() => {
	if (props.bezoeker) {
		voornaam.value = props.bezoeker.voornaam;
		familienaam.value = props.bezoeker.familienaam;
		geboortedatum.value = props.bezoeker.geboortedatum;
		emailadres.value = props.bezoeker.emailadres;
	}
});

const validateForm = () => {
	errors.value = {
		voornaam: '',
		familienaam: '',
		geboortedatum: '',
		emailadres: ''
	};

	let isValid = true;

	if (!voornaam.value || voornaam.value.trim() === '') {
		errors.value.voornaam = 'Voornaam is verplicht';
		isValid = false;
	}

	if (!familienaam.value || familienaam.value.trim() === '') {
		errors.value.familienaam = 'Familienaam is verplicht';
		isValid = false;
	}

	if (!geboortedatum.value) {
		errors.value.geboortedatum = 'Geboortedatum is verplicht';
		isValid = false;
	} else {
		const birthDate = new Date(geboortedatum.value);
		const today = new Date();
		const age = today.getFullYear() - birthDate.getFullYear();
		if (age < 13) {
			errors.value.geboortedatum = 'Bezoeker moet minstens 13 jaar oud zijn';
			isValid = false;
		}
	}

	if (!emailadres.value || emailadres.value.trim() === '') {
		errors.value.emailadres = 'E-mailadres is verplicht';
		isValid = false;
	} else if (!validateEmail(emailadres.value)) {
		errors.value.emailadres = 'Ongeldig e-mailadres';
		isValid = false;
	}

	return isValid;
};

const validateEmail = (email) => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
};

const save = () => {
	if (!validateForm()) {
		showToast('Gelieve alle velden correct in te vullen', 'warning');
		return;
	}

	if (props.bezoeker) {
		updateBezoeker();
	} else {
		createBezoeker();
	}
};

const createBezoeker = () => {
	axios
		.post(props.apiUrl, {
			voornaam: voornaam.value,
			familienaam: familienaam.value,
			geboortedatum: geboortedatum.value,
			emailadres: emailadres.value
		})
		.then(response => {
			console.log('Create Response:', response);
			if (response.status === 200 || response.data.status === 200) {
				showToast('Bezoeker toegevoegd', 'success');
				modalController.dismiss({ saved: true });
			} else {
				showToast('Fout bij toevoegen', 'danger');
			}
		})
		.catch(err => {
			if (err.response?.status === 409 || err.response?.data?.error?.includes('emailadres')) {
				showToast('Dit e-mailadres is al in gebruik', 'danger');
			} else {
				showToast('Fout bij toevoegen: ' + (err.response?.data?.error || err.message), 'danger');
			}
			console.error('Create Error:', err);
		});
};

const updateBezoeker = () => {
	axios
		.put(props.apiUrl, {
			id: props.bezoeker.id,  // ID in de body!
			voornaam: voornaam.value,
			familienaam: familienaam.value,
			geboortedatum: geboortedatum.value,
			emailadres: emailadres.value
		})
		.then(response => {
			console.log('Update Response:', response);
			if (response.status === 200 || response.data.status === 200) {
				showToast('Bezoeker bijgewerkt', 'success');
				modalController.dismiss({ saved: true });
			} else {
				showToast('Fout bij bijwerken', 'danger');
			}
		})
		.catch(err => {
			if (err.response?.status === 409 || err.response?.data?.error?.includes('emailadres')) {
				showToast('Dit e-mailadres is al in gebruik', 'danger');
			} else {
				showToast('Fout bij bijwerken: ' + (err.response?.data?.error || err.message), 'danger');
			}
			console.error('Update Error:', err);
		});
};

const cancel = () => {
	modalController.dismiss({ saved: false });
};

const showToast = async (message, color = 'success') => {
	const toast = await toastController.create({
		message: message,
		duration: 2000,
		color: color,
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
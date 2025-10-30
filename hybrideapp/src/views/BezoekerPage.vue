<template>
	<ion-page>
		<ion-header>
			<ion-toolbar>
				<ion-title>Bezoekers</ion-title>
				<ion-buttons slot="end">
					<ion-button @click="openAddModal">
						<ion-icon :icon="addOutline"></ion-icon>
					</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>

		<ion-content :fullscreen="true">
			<ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">Bezoekers</ion-title>
				</ion-toolbar>
			</ion-header>

			<!-- Loading state -->
			<ion-grid v-if="loading">
				<ion-row>
					<ion-col class="ion-text-center">
						<ion-spinner></ion-spinner>
						<p>Laden...</p>
					</ion-col>
				</ion-row>
			</ion-grid>

			<!-- Error state -->
			<ion-grid v-if="error">
				<ion-row>
					<ion-col>
						<ion-item color="danger">
							<ion-label>{{ error }}</ion-label>
						</ion-item>
					</ion-col>
				</ion-row>
			</ion-grid>

			<!-- Bezoekers lijst -->
			<ion-list v-if="!loading && bezoekers.length > 0">
				<ion-item v-for="bezoeker in bezoekers" :key="bezoeker.id">
					<ion-label>
						<h2>{{ bezoeker.voornaam }} {{ bezoeker.familienaam }}</h2>
						<p>📧 {{ bezoeker.emailadres }}</p>
						<p>🎂 {{ formatDate(bezoeker.geboortedatum) }}</p>
					</ion-label>
					<ion-buttons slot="end">
						<ion-button @click="editBezoeker(bezoeker)">
							<ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
						</ion-button>
						<ion-button color="danger" @click="confirmDelete(bezoeker)">
							<ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
						</ion-button>
					</ion-buttons>
				</ion-item>
			</ion-list>

			<!-- Empty state -->
			<ion-grid v-if="!loading && bezoekers.length === 0">
				<ion-row>
					<ion-col class="ion-text-center">
						<ion-icon :icon="peopleOutline" size="large"></ion-icon>
						<p>Geen bezoekers gevonden</p>
						<ion-button @click="openAddModal">Eerste bezoeker toevoegen</ion-button>
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
	IonList, IonItem, IonLabel, IonButton, IonButtons,
	IonIcon, IonSpinner, IonGrid, IonRow, IonCol,
	modalController, alertController, toastController
} from '@ionic/vue';
import {
	addOutline, createOutline, trashOutline, peopleOutline
} from 'ionicons/icons';
import BezoekerModal from '@/components/BezoekerModal.vue';

const axios = inject('axios');

// PAS DIT AAN NAAR JOUW API URL!
const API_URL = 'https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/visitor.php';

const bezoekers = ref([]);
const loading = ref(false);
const error = ref(null);

onMounted(() => {
	loadBezoekers();
});

const loadBezoekers = () => {
	loading.value = true;
	error.value = null;

	axios
		.get(API_URL)
		.then(response => {
			console.log('API Response:', response);
			if (response.status === 200) {
				bezoekers.value = Array.isArray(response.data) ? response.data : response.data.data || [];
			} else {
				error.value = 'Kon bezoekers niet laden';
			}
		})
		.catch(err => {
			error.value = 'Fout bij laden van bezoekers';
			console.error('Error:', err);
		})
		.finally(() => {
			loading.value = false;
		});
};

const openAddModal = async () => {
	const modal = await modalController.create({
		component: BezoekerModal,
		componentProps: {
			title: 'Bezoeker toevoegen',
			apiUrl: API_URL
		}
	});

	await modal.present();
	const { data } = await modal.onWillDismiss();

	if (data?.saved) {
		loadBezoekers();
	}
};

const editBezoeker = async (bezoeker) => {
	const modal = await modalController.create({
		component: BezoekerModal,
		componentProps: {
			title: 'Bezoeker bewerken',
			bezoeker: { ...bezoeker },
			apiUrl: API_URL
		}
	});

	await modal.present();
	const { data } = await modal.onWillDismiss();

	if (data?.saved) {
		loadBezoekers();
	}
};

const confirmDelete = async (bezoeker) => {
	const alert = await alertController.create({
		header: 'Bevestigen',
		message: `Weet je zeker dat je "${bezoeker.voornaam} ${bezoeker.familienaam}" wilt verwijderen?`,
		buttons: [
			{
				text: 'Annuleren',
				role: 'cancel'
			},
			{
				text: 'Verwijderen',
				role: 'destructive',
				handler: () => deleteBezoeker(bezoeker.id)
			}
		]
	});

	await alert.present();
};

const deleteBezoeker = (id) => {
	axios
		.delete(API_URL, {
			data: { id: id }  // ID in de body!
		})
		.then(response => {
			console.log('Delete Response:', response);
			if (response.status === 200 || response.data.status === 200) {
				showToast('Bezoeker verwijderd', 'success');
				loadBezoekers();
			} else {
				showToast('Kon bezoeker niet verwijderen', 'danger');
			}
		})
		.catch(err => {
			showToast('Fout bij verwijderen. Mogelijk heeft deze bezoeker nog tickets.', 'danger');
			console.error('Delete Error:', err);
		});
};

const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('nl-BE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
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
ion-icon[size="large"] {
	font-size: 64px;
	opacity: 0.5;
	margin: 20px 0;
}
</style>
(function () {
    "use strict";
    /*jslint browser: true*/
    /*jslint devel: true*/

    const baseApiAddress = "https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/";
    const alertEl = document.getElementById("alert");
    const concertListEl = document.getElementById("concertList");

    // Basis fetch-opties
    let opties = {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit"
    };

    // Concerten ophalen
    function getApiConcerten() {
        let url = baseApiAddress + "concert.php";

        opties.method = "GET";
        opties.body = null;

        fetch(url, opties)
            .then(function (response) {
                return response.json();
            })
            .then(function (responseData) {
                if (responseData.status !== 200) {
                    alerter("❌ Fout bij ophalen: " + (responseData.message || "Onbekende fout"));
                    return;
                }

                let list = responseData.data;
                if (!list || list.length === 0) {
                    concertListEl.innerHTML = "<p>Geen concerten gevonden.</p>";
                    return;
                }

                // Bouw de tabel
                let tabel = `
                    <table class="table table-striped table-hover align-middle">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">Artiest</th>
                                <th scope="col">Datum</th>
                                <th scope="col">Uur</th>
                                <th scope="col">Locatie</th>
                                <th scope="col">Prijs (€)</th>
                                <th scope="col">Capaciteit</th>
                                <th scope="col">Actie</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                list.forEach(function (concert) {
                    tabel += `
                        <tr>
                            <td>${concert.artiest}</td>
                            <td>${concert.datum}</td>
                            <td>${concert.uur}</td>
                            <td>${concert.locatie}</td>
                            <td>${concert.kostprijs}</td>
                            <td>${concert.capaciteit}</td>
                            <td>
                                <button type="button" data-id="${concert.id}" data-artiest="${concert.artiest}" data-datum="${concert.datum}" class="btn btn-sm btn-success btn-buy" aria-label="Ticket kopen">
                                    🎟️ Koop ticket
                                </button>
                            </td>
                        </tr>
                    `;
                });

                tabel += "</tbody></table>";
                concertListEl.innerHTML = tabel;

                document.querySelectorAll(".btn-buy").forEach(btn => {
                    btn.addEventListener("click", () => {
                        openTicketForm(btn.dataset.id, btn.dataset.artiest, btn.dataset.datum);
                    });
                });
            })
            .catch(function (error) {
                alerter("⚠️ API-fout: " + error);
            });
    }

    // Formulier tonen
    function openTicketForm(concertId, artiest, datum) {
        document.getElementById("concertId").value = concertId;

        // Update modal titel
        document.getElementById("ticketModalLabel").textContent = `🎫 Ticket kopen voor ${artiest} (${datum})`;

        // Clear velden
        document.getElementById("voornaam").value = "";
        document.getElementById("familienaam").value = "";
        document.getElementById("emailadres").value = "";
        document.getElementById("geboortedatum").value = "";
        document.getElementById("aantal").value = 1;

        // Modal tonen
        const ticketModal = new bootstrap.Modal(document.getElementById("ticketModal"));
        ticketModal.show();
    }

    // Ticket form submit
    document.getElementById("ticketForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const concertId = document.getElementById("concertId").value;
        saveTicket(concertId);
    });

    // Ticket opslaan
    function saveTicket(concertId) {
        const voornaam = document.getElementById("voornaam").value.trim();
        const familienaam = document.getElementById("familienaam").value.trim();
        const email = document.getElementById("emailadres").value.trim();
        const geboortedatum = document.getElementById("geboortedatum").value;
        const aantal = parseInt(document.getElementById("aantal").value);

        if (!voornaam || !familienaam || !email || !aantal || !geboortedatum) {
            alerter("⚠️ Vul alle velden in!");
            return;
        }

        // Check of bezoeker al bestaat
        let url = baseApiAddress + "visitor.php";
        opties.method = "GET";

        fetch(url, opties)
            .then(res => res.json())
            .then(visitorData => {
                if (visitorData.status !== 200 || !visitorData.data) {
                    alerter("❌ Fout bij ophalen bezoekers!");
                    return;
                }

                let bezoekers = visitorData.data;
                let bestaande = bezoekers.find(b => b.emailadres.toLowerCase() === email.toLowerCase());

                if (bestaande) {
                    voegTicketToe(bestaande.id, concertId, aantal);
                } else {
                    // Nieuwe bezoeker toevoegen
                    let urlAddVis = baseApiAddress + "visitor.php";
                    let optiesAddVis = {
                        method: "POST",
                        body: JSON.stringify({
                            voornaam: voornaam,
                            familienaam: familienaam,
                            emailadres: email,
                            geboortedatum: geboortedatum
                        })
                    };

                    fetch(urlAddVis, optiesAddVis)
                        .then(resp => resp.json())
                        .then(addData => {
                            if (addData.status === 200) {
                                voegTicketToe(addData.VIS_ID, concertId, aantal);
                            } else {
                                alerter("❌ Fout bij toevoegen bezoeker: " + (addData.message || "Onbekende fout"));
                            }
                        })
                        .catch(err => alerter("⚠️ API-fout: " + err));
                }
            })
            .catch(err => alerter("⚠️ Fout bij bezoekerscontrole: " + err));
    }

    // Ticket toevoegen
    function voegTicketToe(bezoekerId, concertId, aantal) {
        let url = baseApiAddress + "ticket.php";
        let optiesTicket = {
            method: "POST",
            body: JSON.stringify({
                bezoeker_id: bezoekerId,
                concert_id: concertId,
                aantal: aantal
            })
        };

        fetch(url, optiesTicket)
            .then(res => res.json())
            .then(data => {
                if (data.status === 200) {
                    // Modal sluiten
                    const ticketModal = bootstrap.Modal.getInstance(document.getElementById("ticketModal"));
                    if (ticketModal) {
                        ticketModal.hide();
                    }
                    // Formulier resetten
                    document.getElementById("ticketForm").reset();
                    // Alert tonen
                    alerter("✅ Ticket succesvol aangekocht!");
                } else {
                    alerter("❌ Fout bij aankoop: " + (data.message || "Onbekende fout"));
                }
            })
            .catch(err => alerter("⚠️ API-fout: " + err));
    }

    // Helperfunctie om meldingen te tonen
    function alerter(message) {
        alertEl.innerHTML = `<div class="alert alert-info" role="alert">${message}</div>`;
    }

    // Event listeners
    document.addEventListener("DOMContentLoaded", getApiConcerten);

})();
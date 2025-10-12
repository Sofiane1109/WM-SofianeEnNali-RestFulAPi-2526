(function () {
    "use strict";
    /*jslint browser: true*/
    /*jslint devel: true*/

    const baseApiAddress = "https://sofianeennali-odisee.be/wm/project/ConcertAPI/api/";
    const alertEl = document.getElementById("alert");
    const bezoekerListEl = document.getElementById("bezoekerList");

    // Basis fetch-opties
    let opties = {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit"
    };

    // Bezoekers ophalen
    function getApiBezoekers() {
        let url = baseApiAddress + "visitor.php";

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
                    bezoekerListEl.innerHTML = "<p>Geen bezoekers gevonden.</p>";
                    return;
                }

                // Bouw de tabel met scope="col" voor toegankelijkheid
                let tabel = `
                    <table class="table table-striped table-hover align-middle">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">Voornaam</th>
                                <th scope="col">Familienaam</th>
                                <th scope="col">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                list.forEach(function (bezoeker) {
                    tabel += `
                        <tr>
                            <td>${bezoeker.voornaam}</td>
                            <td>${bezoeker.familienaam}</td>
                            <td>
                                <button type="button" data-id="${bezoeker.id}" class="btn btn-sm btn-info me-1 btn-details" aria-label="Details bekijken">👁️</button>
                                <button type="button" data-id="${bezoeker.id}" class="btn btn-sm btn-warning me-1 btn-edit" aria-label="Bezoeker bewerken">✏️</button>
                                <button type="button" data-id="${bezoeker.id}" class="btn btn-sm btn-danger btn-delete" aria-label="Bezoeker verwijderen">🗑️</button>
                            </td>
                        </tr>
                    `;
                });

                tabel += "</tbody></table>";
                bezoekerListEl.innerHTML = tabel;
            })
            .catch(function (error) {
                alerter("⚠️ API-fout: " + error);
            });
    }

    // Bezoeker toevoegen
    function addApiBezoeker(e) {
        e.preventDefault();
        let url = baseApiAddress + "visitor.php";

        opties.method = "POST";
        opties.body = JSON.stringify({
            voornaam: document.getElementById("voornaam").value.trim(),
            familienaam: document.getElementById("familienaam").value.trim(),
            emailadres: document.getElementById("emailadres").value.trim(),
            geboortedatum: document.getElementById("geboortedatum").value
        });

        fetch(url, opties)
            .then((response) => response.json())
            .then((responseData) => {
                if (responseData.status === 200) {
                    alerter("✅ Bezoeker toegevoegd! (ID: " + responseData.VIS_ID + ")");
                    getApiBezoekers();
                    document.getElementById("bezoekerForm").reset();
                } else {
                    alerter("❌ Toevoegen mislukt: " + (responseData.message || "Onbekende fout"));
                }
            })
            .catch((error) => {
                alerter("⚠️ API-fout: " + error);
            });
    }

    // Event delegation voor knoppen in bezoekerlijst
    bezoekerListEl.addEventListener("click", function (e) {
        const target = e.target.closest("button");
        if (!target) return;

        const bezoekerIdd = target.dataset.id;
        if (target.classList.contains("btn-details")) {
            showBezoekerDetails(bezoekerIdd);
        }
        if (target.classList.contains("btn-edit")) {
            editBezoeker(bezoekerIdd);
        }
        if (target.classList.contains("btn-delete")) {
            deleteBezoeker(bezoekerIdd);
        }
    });

    function showBezoekerDetails(id) {
        const detailsEl = document.getElementById("bezoekerDetailsContent");
        detailsEl.innerHTML = "<p>Even geduld, gegevens worden geladen...</p>";

        const modalEl = new bootstrap.Modal(document.getElementById("bezoekerDetailsModal"));
        modalEl.show();

        let url = baseApiAddress + "visitor.php";
        opties.method = "GET";

        fetch(url, opties)
            .then(res => res.json())
            .then(data => {
                if (data.status !== 200) {
                    detailsEl.innerHTML = `<div class="alert alert-danger">❌ Fout bij ophalen: ${data.message || "Onbekende fout"}</div>`;
                    return;
                }

                const bezoeker = data.data.find(b => b.id == id);
                if (!bezoeker) {
                    detailsEl.innerHTML = "<p>Bezoeker niet gevonden.</p>";
                    return;
                }

                let html = `
                <ul class="list-group mb-3">
                    <li class="list-group-item"><strong>Voornaam:</strong> ${bezoeker.voornaam}</li>
                    <li class="list-group-item"><strong>Familienaam:</strong> ${bezoeker.familienaam}</li>
                    <li class="list-group-item"><strong>E-mailadres:</strong> ${bezoeker.emailadres}</li>
                    <li class="list-group-item"><strong>Geboortedatum:</strong> ${bezoeker.geboortedatum}</li>
                </ul>
                <h5>Tickets</h5>
                <div id="ticketListModal">Tickets laden...</div>
            `;
                detailsEl.innerHTML = html;

                // Tickets ophalen
                let urlTickets = baseApiAddress + "ticket.php";
                let optiesTicket = { method: "GET" };
                fetch(urlTickets, optiesTicket)
                    .then(res => res.json())
                    .then(ticketsData => {
                        if (ticketsData.status !== 200 || !ticketsData.data) {
                            document.getElementById("ticketListModal").innerHTML = "<p>Geen tickets gevonden.</p>";
                            return;
                        }

                        // Filter tickets voor deze bezoeker
                        const ticketsVoorBezoeker = ticketsData.data.filter(t => t.bezoeker_id == id);
                        if (ticketsVoorBezoeker.length === 0) {
                            document.getElementById("ticketListModal").innerHTML = "<p>Geen tickets gevonden.</p>";
                            return;
                        }

                        // Concerten ophalen
                        let urlConcerten = baseApiAddress + "concert.php";
                        let optiesConcerten = { method: "GET" };
                        fetch(urlConcerten, optiesConcerten)
                            .then(res => res.json())
                            .then(concertData => {
                                if (concertData.status !== 200 || !concertData.data) {
                                    document.getElementById("ticketListModal").innerHTML = "<p>Geen concerten gevonden.</p>";
                                    return;
                                }

                                // Match tickets met concerten
                                let ticketHtml = `<ul class="list-group">`;
                                ticketsVoorBezoeker.forEach(ticket => {
                                    const concert = concertData.data.find(c => c.id == ticket.concert_id);
                                    if (concert) {
                                        ticketHtml += `<li class="list-group-item">${concert.artiest} | ${concert.datum} om ${concert.uur} - ${ticket.aantal} ticket(s)</li>`;
                                    }
                                });
                                ticketHtml += `</ul>`;
                                document.getElementById("ticketListModal").innerHTML = ticketHtml;
                            })
                            .catch(err => {
                                document.getElementById("ticketListModal").innerHTML = `<div class="alert alert-danger">⚠️ Fout bij ophalen concerten: ${err}</div>`;
                            });
                    })
                    .catch(err => {
                        document.getElementById("ticketListModal").innerHTML = `<div class="alert alert-danger">⚠️ Fout bij ophalen tickets: ${err}</div>`;
                    });
            })
            .catch(err => {
                detailsEl.innerHTML = `<div class="alert alert-danger">⚠️ Fout bij ophalen bezoeker: ${err}</div>`;
            });
    }


    function editBezoeker(id) {
        const modalEl = new bootstrap.Modal(document.getElementById("editBezoekerModal"));
        const form = document.getElementById("editBezoekerForm");
        form.innerHTML = "<p>Gegevens laden...</p>";
        modalEl.show();

        let url = baseApiAddress + "visitor.php";
        opties.method = "GET";

        fetch(url, opties)
            .then(res => res.json())
            .then(data => {
                const bezoeker = data.data.find(b => b.id == id);
                if (!bezoeker) {
                    form.innerHTML = "<p>Bezoeker niet gevonden.</p>";
                    return;
                }

                // Formulier invullen
                form.innerHTML = `
                <div class="mb-3">
                    <label>Voornaam</label>
                    <input type="text" id="editVoornaam" class="form-control" value="${bezoeker.voornaam}">
                </div>
                <div class="mb-3">
                    <label>Familienaam</label>
                    <input type="text" id="editFamilienaam" class="form-control" value="${bezoeker.familienaam}">
                </div>
                <div class="mb-3">
                    <label>E-mailadres</label>
                    <input type="email" id="editEmailadres" class="form-control" value="${bezoeker.emailadres}">
                </div>
                <div class="mb-3">
                    <label>Geboortedatum</label>
                    <input type="date" id="editGeboortedatum" class="form-control" value="${bezoeker.geboortedatum}">
                </div>
                <button type="submit" class="btn btn-primary">Opslaan</button>
            `;

                form.onsubmit = function (e) {
                    e.preventDefault();

                    let urlUpdate = baseApiAddress + "visitor.php";
                    let optiesUpdate = {
                        method: "PUT",
                        body: JSON.stringify({
                            id: id,
                            voornaam: document.getElementById("editVoornaam").value.trim(),
                            familienaam: document.getElementById("editFamilienaam").value.trim(),
                            emailadres: document.getElementById("editEmailadres").value.trim(),
                            geboortedatum: document.getElementById("editGeboortedatum").value
                        })
                    };

                    fetch(urlUpdate, optiesUpdate)
                        .then(res => res.json())
                        .then(resp => {
                            if (resp.status === 200) {
                                modalEl.hide();
                                alerter("✅ Bezoeker aangepast!");
                                getApiBezoekers();
                            } else {
                                alerter("❌ Wijzigen mislukt: " + (resp.message || "Onbekende fout"));
                            }
                        })
                        .catch(err => alerter("⚠️ API-fout: " + err));
                };
            })
            .catch(err => {
                form.innerHTML = `<div class="alert alert-danger">⚠️ Fout bij laden bezoeker: ${err}</div>`;
            });
    }

    function deleteBezoeker(id) {
        if (!confirm("Ben je zeker dat je deze bezoeker wilt verwijderen?")) return;

        let url = baseApiAddress + "visitor.php";
        let opties = {
            method: "DELETE",
            body: JSON.stringify({ id: id })
        };

        fetch(url, opties)
            .then(res => res.json())
            .then(resp => {
                if (resp.status === 200) {
                    alerter("🗑️ Bezoeker succesvol verwijderd!");
                    getApiBezoekers();
                } else {
                    alerter("❌ Verwijderen mislukt: " + (resp.message || "Onbekende fout"));
                }
            })
            .catch(err => alerter("⚠️ API-fout: " + err));
    }

    // Helperfunctie om meldingen te tonen
    function alerter(message) {
        alertEl.innerHTML = `<div class="alert alert-info" role="alert">${message}</div>`;
    }

    // Event listeners
    document.addEventListener("DOMContentLoaded", getApiBezoekers);
    document.getElementById("bezoekerForm").addEventListener("submit", addApiBezoeker);

})();
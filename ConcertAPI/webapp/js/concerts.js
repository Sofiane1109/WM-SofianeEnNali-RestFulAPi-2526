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

                let tabel = `
                    <table class="table table-striped table-hover align-middle">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Artiest</th>
                                <th scope="col">Datum</th>
                                <th scope="col">Uur</th>
                                <th scope="col">Locatie</th>
                                <th scope="col">Prijs (€)</th>
                                <th scope="col">Capaciteit</th>
                                <th scope="col">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                list.forEach(function (concert) {
                    tabel += `
                        <tr>
                            <th scope="row">${concert.id}</th>
                            <td>${concert.artiest}</td>
                            <td>${concert.datum}</td>
                            <td>${concert.uur}</td>
                            <td>${concert.locatie}</td>
                            <td>${concert.kostprijs}</td>
                            <td>${concert.capaciteit}</td>
                            <td>
                                <button type="button" data-id="${concert.id}" class="btn btn-sm btn-info me-1 btn-details">👁️</button>
                                <button type="button" data-id="${concert.id}" class="btn btn-sm btn-warning me-1 btn-edit">✏️</button>
                                <button type="button" data-id="${concert.id}" class="btn btn-sm btn-danger btn-delete">🗑️</button>
                            </td>
                        </tr>
                    `;
                });

                tabel += "</tbody></table>";
                concertListEl.innerHTML = tabel;
            })
            .catch(function (error) {
                alerter("⚠️ API-fout: " + error);
            });
    }

    //  Concert toevoegen
    function addApiConcert(e) {
        e.preventDefault();
        let url = baseApiAddress + "concert.php";

        opties.method = "POST";
        opties.body = JSON.stringify({
            artiest: document.getElementById("artiest").value.trim(),
            datum: document.getElementById("datum").value,
            uur: document.getElementById("uur").value,
            locatie: document.getElementById("locatie").value.trim(),
            kostprijs: parseFloat(document.getElementById("kostprijs").value),
            capaciteit: parseInt(document.getElementById("capaciteit").value)
        });

        fetch(url, opties)
            .then((response) => response.json())
            .then((responseData) => {
                if (responseData.status === 200) {
                    alerter("✅ Concert toegevoegd! (ID: " + responseData.id + ")");
                    getApiConcerten();
                    document.getElementById("concertForm").reset();
                } else {
                    alerter("❌ Toevoegen mislukt: " + (responseData.message || "Onbekende fout"));
                }
            })
            .catch((error) => {
                alerter("⚠️ API-fout: " + error);
            });
    }

    // Event voor knoppen in concertlijst
    concertListEl.addEventListener("click", function (e) {
        const target = e.target.closest("button");
        if (!target) return;

        const concertId = target.dataset.id;
        if (target.classList.contains("btn-details")) {
            showConcertDetails(concertId);
        }
        if (target.classList.contains("btn-edit")) {
            editConcert(concertId);
        }
        if (target.classList.contains("btn-delete")) {
            deleteConcert(concertId);
        }
    });

    // Functie om concertdetails te tonen in modal
    function showConcertDetails(id) {
        const detailsEl = document.getElementById("concertDetailsContent");
        detailsEl.innerHTML = "<p>Even geduld, gegevens worden geladen...</p>";

        const modalEl = new bootstrap.Modal(document.getElementById("concertDetailsModal"));
        modalEl.show();

        // Concert ophalen
        let url = baseApiAddress + "concert.php"
        opties.method = "GET";

        fetch(url, opties)
            .then(res => res.json())
            .then(data => {
                if (data.status !== 200) {
                    detailsEl.innerHTML = `<div class="alert alert-danger">❌ Fout bij ophalen: ${data.message || "Onbekende fout"}</div>`;
                    return;
                }

                const concert = data.data.find(c => c.id == id);
                if (!concert) {
                    detailsEl.innerHTML = "<p>Concert niet gevonden.</p>";
                    return;
                }

                let html = `
                <ul class="list-group mb-3">
                    <li class="list-group-item"><strong>Artiest:</strong> ${concert.artiest}</li>
                    <li class="list-group-item"><strong>Datum:</strong> ${concert.datum}</li>
                    <li class="list-group-item"><strong>Uur:</strong> ${concert.uur}</li>
                    <li class="list-group-item"><strong>Locatie:</strong> ${concert.locatie}</li>
                    <li class="list-group-item"><strong>Prijs (€):</strong> ${concert.kostprijs}</li>
                    <li class="list-group-item"><strong>Capaciteit:</strong> ${concert.capaciteit}</li>
                </ul>
                <h5>Bezoekers</h5>
                <div id="visitorListModal">Bezoekers laden...</div>
            `;
                detailsEl.innerHTML = html;

                // Tickets ophalen
                let urlTickets = baseApiAddress + "ticket.php";
                let optiesTicket = { method: "GET" }
                fetch(urlTickets, optiesTicket)
                    .then(res => res.json())
                    .then(ticketsData => {
                        if (ticketsData.status !== 200 || !ticketsData.data) {
                            document.getElementById("visitorListModal").innerHTML = "<p>Geen bezoekers gevonden.</p>";
                            return;
                        }

                        // Filter tickets voor dit concert
                        const ticketsVoorConcert = ticketsData.data.filter(t => t.concert_id == id);
                        if (ticketsVoorConcert.length === 0) {
                            document.getElementById("visitorListModal").innerHTML = "<p>Geen bezoekers gevonden.</p>";
                            return;
                        }

                        // Bezoekers ophalen
                        let urlBezoekers = baseApiAddress + "visitor.php";
                        let optiesBezoekers = { method: "GET" }
                        fetch(urlBezoekers, optiesBezoekers)
                            .then(res => res.json())
                            .then(visitorData => {
                                if (visitorData.status !== 200 || !visitorData.data) {
                                    document.getElementById("visitorListModal").innerHTML = "<p>Geen bezoekers gevonden.</p>";
                                    return;
                                }

                                // Match tickets met bezoekers
                                let visitorHtml = `<ul class="list-group">`;
                                ticketsVoorConcert.forEach(ticket => {
                                    const visitor = visitorData.data.find(v => v.id == ticket.bezoeker_id);
                                    if (visitor) {
                                        visitorHtml += `<li class="list-group-item">${visitor.voornaam} ${visitor.familienaam} | ${visitor.emailadres}- Tickets: ${ticket.aantal}</li>`;
                                    }
                                });
                                visitorHtml += `</ul>`;
                                document.getElementById("visitorListModal").innerHTML = visitorHtml;
                            })
                            .catch(err => {
                                document.getElementById("visitorListModal").innerHTML = `<div class="alert alert-danger">⚠️ Fout bij ophalen bezoekers: ${err}</div>`;
                            });
                    })
                    .catch(err => {
                        document.getElementById("visitorListModal").innerHTML = `<div class="alert alert-danger">⚠️ Fout bij ophalen tickets: ${err}</div>`;
                    });
            })
            .catch(err => {
                detailsEl.innerHTML = `<div class="alert alert-danger">⚠️ Fout bij ophalen concert: ${err}</div>`;
            });
    }

    function editConcert(id) {
        const modalEl = new bootstrap.Modal(document.getElementById("editConcertModal"));
        const form = document.getElementById("editConcertForm");
        form.innerHTML = "<p>Gegevens laden...</p>";
        modalEl.show();

        // Concertgegevens ophalen
        let url = baseApiAddress + "concert.php";
        opties.method = "GET"

        fetch(url, opties)
            .then(res => res.json())
            .then(data => {
                const concert = data.data.find(c => c.id == id);
                if (!concert) {
                    form.innerHTML = "<p>Concert niet gevonden.</p>";
                    return;
                }

                // Formulier invullen
                form.innerHTML = `
                <div class="mb-3">
                    <label>Artiest</label>
                    <input type="text" id="editArtiest" class="form-control" value="${concert.artiest}">
                </div>
                <div class="mb-3">
                    <label>Datum</label>
                    <input type="date" id="editDatum" class="form-control" value="${concert.datum}">
                </div>
                <div class="mb-3">
                    <label>Uur</label>
                    <input type="time" id="editUur" class="form-control" value="${concert.uur}">
                </div>
                <div class="mb-3">
                    <label>Locatie</label>
                    <input type="text" id="editLocatie" class="form-control" value="${concert.locatie}">
                </div>
                <div class="mb-3">
                    <label>Prijs (€)</label>
                    <input type="number" step="0.01" id="editKostprijs" class="form-control" value="${concert.kostprijs}">
                </div>
                <div class="mb-3">
                    <label>Capaciteit</label>
                    <input type="number" id="editCapaciteit" class="form-control" value="${concert.capaciteit}">
                </div>
                <button type="submit" class="btn btn-primary">Opslaan</button>
            `;

                form.onsubmit = function (e) {
                    e.preventDefault();

                    let urlUpdate = baseApiAddress + "concert.php";
                    let optiesUpdate = {
                        method: "PUT",
                        body: JSON.stringify({
                            id: id,
                            artiest: document.getElementById("editArtiest").value.trim(),
                            datum: document.getElementById("editDatum").value,
                            uur: document.getElementById("editUur").value,
                            locatie: document.getElementById("editLocatie").value.trim(),
                            kostprijs: parseFloat(document.getElementById("editKostprijs").value),
                            capaciteit: parseInt(document.getElementById("editCapaciteit").value)
                        })
                    };

                    fetch(urlUpdate, optiesUpdate)
                        .then(res => res.json())
                        .then(resp => {
                            if (resp.status === 200) {
                                modalEl.hide();
                                alerter("✅ Concert aangepast!");
                                getApiConcerten();
                            } else {
                                alerter("❌ Wijzigen mislukt: " + (resp.message || "Onbekende fout"));
                            }
                        })
                        .catch(err => alerter("⚠️ API-fout: " + err));
                };
            })
            .catch(err => {
                form.innerHTML = `<div class="alert alert-danger">⚠️ Fout bij laden concert: ${err}</div>`;
            });
    }

    function deleteConcert(id) {
        if (!confirm("Ben je zeker dat je dit concert wilt verwijderen?")) return;

        let url = baseApiAddress + "concert.php";
        let opties = {
            method: "DELETE",
            body: JSON.stringify({ id: id })
        };

        fetch(url, opties)
            .then(res => res.json())
            .then(resp => {
                if (resp.status === 200) {
                    alerter("🗑️ Concert succesvol verwijderd!");
                    getApiConcerten(); // lijst herladen
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

    //  Event listeners
    document.addEventListener("DOMContentLoaded", getApiConcerten);
    document.getElementById("concertForm").addEventListener("submit", addApiConcert);

})();

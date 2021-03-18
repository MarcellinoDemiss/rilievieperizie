"use strict";

$(document).ready(function () {

    let _boxMap;
    let lastWindow;
    let dataOraLastFoto = "";
    let _btnAddNote = $("#btnAddNote");
    let _btnVisualizzaPercorso = $("#btnVisualizzaPercorso");
    let _txtAddNote = $("#txtAddNote");
    let _btnDistanza = $("#btnDistanza");
    let _carIcon = $("#carIcon");
    let lastLat;
    let lastLon;
    let mappa;
    let directionsRenderer;
    let directionsService;

    _btnAddNote.attr("disabled", true);
    _btnVisualizzaPercorso.attr("disabled", true);
    _txtAddNote.attr("disabled", true);
    _carIcon.hide();

    $("#btnLogout").on("click", function () {
        let request = inviaRichiesta("POST", "/api/logout");
        request.fail(errore);
        request.done(function (data) {
            window.location.href = "login.html";
        })
    })

    $("#btnSignUp").on("click", function () {
        window.location.href = "registrazione.html";
    })
    
    $("#btnUserDatabase").on("click", function () {
        window.location.href = "listaUtenti.html";
    })

    ottieniInfo();

    _boxMap = window.document.getElementById("boxMap");
    let opzions = {
        zoom: 8,
        center: new google.maps.LatLng(44.54482, 8.37120),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mappa = new google.maps.Map(_boxMap, opzions);
    let info;

    _btnAddNote.on("click", function () {
        let request = inviaRichiesta("POST", "/api/getInformazioni");
        request.fail(function (jqXHR, test_status, str_error) {
            errore(jqXHR, test_status, str_error)
        }),
            request.done(function (data) {

                let request = inviaRichiesta("POST", "/api/addNoteAdmin",
                    {
                        "noteAdmin": _txtAddNote.val(),
                        "dataOra": dataOraLastFoto
                    }
                );
                request.fail(function (jqXHR, test_status, str_error) {
                    errore(jqXHR, test_status, str_error)
                }),
                    request.done(function (data) {
                        alert("Note aggiunte correttamente");
                        location.reload();
                    })
            })
    })

    _btnVisualizzaPercorso.on("click", function () {
        let partenza = new google.maps.LatLng(44.65661, 7.81133);
        let arrivo = new google.maps.LatLng(lastLat, lastLon);
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({ "location": partenza }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                geocoder.geocode({ "location": arrivo }, function (results2, status2) {
                    if (status2 == google.maps.GeocoderStatus.OK) {
                        let posPartenza = results[0].geometry.location;
                        let posArrivo = results2[0].geometry.location;
                        disegnaPercorso(posPartenza, posArrivo);
                    }
                    else {
                        alert("Indirizzo arrivo non valido");
                    }
                })
            }
            else {
                alert("Indirizzo partenza non valido")
            }

        })
    })

    function disegnaPercorso(posPartenza, posArrivo) {       
        if (directionsRenderer != null) {
            directionsRenderer.setMap(null);
            directionsRenderer = null;
        }
        directionsRenderer=new google.maps.DirectionsRenderer();

        directionsRenderer = new google.maps.DirectionsRenderer();
        directionsService = new google.maps.DirectionsService();

        let percorso = {
            "origin": posPartenza,
            "destination": posArrivo,
            "travelMode": google.maps.TravelMode.DRIVING
        };
        directionsService.route(percorso, function (route, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsRenderer.setMap(mappa);
                directionsRenderer.setDirections(route);
            }
            _carIcon.show();
            _btnDistanza.html(route.routes[0].legs[0].distance.text + ", " + route.routes[0].legs[0].duration.text);
        })       
    }

    function ottieniInfo() {
        let request = inviaRichiesta("post", "/api/getInformazioni");
        request.fail(errore);
        request.done(function (data) {
            for (let item of data) {
                let marcatore = new google.maps.Marker(
                    {
                        map: mappa,
                        position: new google.maps.LatLng(item.latitudine, item.longitudine),
                        title: item.username,
                        animation: google.maps.Animation.DROP,
                        zIndex: 3
                    });

                info = "<div id='finestra' style='text-align:left'>" +
                    "<img style='height:150px;align='center' src='" + item.immagine + "'>" +
                    "<br><br><p><span style='font-weight:bold;'>Username:</span> " + item.username +
                    "<br><span style='font-weight:bold;'>Codice:</span> " + item.codice +
                    "<br><span style='font-weight:bold;'>Coordinate:</span> " + item.latitudine + ", " + item.longitudine +
                    "<br><span style='font-weight:bold;'>Data/Ora:</span> " + item.dataOra +
                    "<br><span style='font-weight:bold;'>Note operatore:</span> " + item.note +
                    "<br><span style='font-weight:bold;'>Note admin:</span> " + item.noteAdmin + "</p>" +
                    "</div>";

                let infoWindow = new google.maps.InfoWindow({
                    content: info
                });

                marcatore.addListener("click", function () {
                    _btnAddNote.attr("disabled", false);
                    _btnVisualizzaPercorso.attr("disabled", false);
                    _txtAddNote.attr("disabled", false);
                    _txtAddNote.val("");

                    lastLat = item.latitudine;
                    lastLon = item.longitudine;

                    dataOraLastFoto = item.dataOra;

                    if (lastWindow)
                        lastWindow.close();
                    lastWindow = infoWindow;
                    infoWindow.open(mappa, marcatore);
                })

                infoWindow.addListener("closeclick", function () {
                    _btnAddNote.attr("disabled", true);
                    _btnVisualizzaPercorso.attr("disabled", true);
                    _txtAddNote.attr("disabled", true);
                })
            }
        });
    }

});

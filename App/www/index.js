"use strict"

$(document).ready(function () {
    document.addEventListener("deviceready", function () {
        let _wrapper = $("#wrapper")
        let note = $("#btnNote")
        let watchID = null;
        let coordinate;
        let latitudine;
        let longitudine;
        let imgBase64;
        let dataOra;
        let _img;

        let cameraOptions = {
            "quality": 50,
            "correctOrientation":true
        }

        $("#btnUpload").attr("disabled", true);

        $("#btnScatta").on("click", function () {
            cameraOptions.sourceType = Camera.PictureSourceType.CAMERA
            cameraOptions.destinationType = Camera.DestinationType.DATA_URL
            navigator.camera.getPicture(cameraSuccess, error, cameraOptions)
        });

        $("#btnUpload").on("click", function () {
            $("#btnUpload").attr("disabled", true);
            let _imgArray = $("img");
            for (let i = 0 ; i < _imgArray.length; i++) {
                let item = $(_imgArray[i]);
                let request = inviaRichiesta("POST", "https://marcellino-demis-app.herokuapp.com/api/uploadFoto",
                    {
                        "immagine": item.prop("src"),
                        "latitudine": item.prop("latitudine"),
                        "longitudine": item.prop("longitudine"),
                        "dataOra": item.prop("dataOra"),
                        "note": note.val()
                    }
                );
                request.fail(function (jqXHR, test_status, str_error) { });
                request.done(function (data) {
                    $("#btnUpload").attr("disabled", false);
                    navigator.notification.alert("Upload eseguito correttamente", function () { }, "Upload", "OK")
                })
            }
        });

        $("#btnLogout").on("click", function () {
            let request = inviaRichiesta("POST", "https://marcellino-demis-app.herokuapp.com/api/logout");
            request.fail(errore);
            request.done(function (data) {
                window.location.href = "login.html";
            })
        })

        function cameraSuccess(image) {
            let date = (new Date()).toLocaleString();
            dataOra = date;
            _img = $("<img>")
            _img.prop("dataOra", dataOra);
            _img.css({
                "height": 80
            });
            if (cameraOptions.destinationType == Camera.DestinationType.DATA_URL) {
                _img.prop("src", "data:image/jpeg;base64," + image)
                imgBase64 = "data:image/jpeg;base64," + image;
            }

            $("#btnUpload").attr("disabled", false);

            _img.appendTo(_wrapper)
            startWatch();
            _img.on("click", function () {
                navigator.notification.alert("\nCoordinate: " + coordinate + "\nData e ora: " + date + "\nNote operatore: " + note.val(), function () { }, "Informazioni", "OK");
            })
        }

        function startWatch() {
            let gpsOptions = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };
            watchID = navigator.geolocation.watchPosition(getCoordinate, error, gpsOptions);
        }

        function getCoordinate(position) {
            coordinate = (`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}, ± ${position.coords.accuracy.toFixed(0)}mt, altitudine: ${position.coords.altitude.toFixed(0)}mt`)
            latitudine = position.coords.latitude.toFixed(5);
            longitudine = position.coords.longitude.toFixed(5);
            _img.prop("latitudine", latitudine);
            _img.prop("longitudine", longitudine);
            stopWatch()
        }

        function stopWatch() {
            if (watchID != null) {
                navigator.geolocation.clearWatch(watchID);
                watchID = null;
            }
        }

        function error(err) {
            if (err.code)
                alert("Error: " + err.code + " - " + err.message)
        }
    });
})
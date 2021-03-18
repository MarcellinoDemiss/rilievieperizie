"use strict";

$(document).ready(function () {
    let _lUsername = $("#lUsername");
    let _lblErrore = $("#lblErrore");
    let _close = $(".close");

    _lblErrore.hide();
    _close.on("click", function () {
        _lblErrore.hide();
    })

    $("#btnLogin").on("click", controllaLogin);

    function controllaLogin() {

        _lUsername.css("border", "");

        if (_lUsername.val() == "")
            _lUsername.css("border", "1px solid red");
        else {
            let request = inviaRichiesta("POST", "https://marcellino-demis-app.herokuapp.com/api/loginCordova",
                {
                    "username": _lUsername.val(),
                }
            );
            request.fail(function (jqXHR, test_status, str_error) {
                if (jqXHR.status == 401)
                    _lblErrore.show();
                else
                    errore(jqXHR, test_status, str_error)
            }),
                request.done(function (data) {
                    let request1 = inviaRichiesta("POST", "https://marcellino-demis-app.herokuapp.com/api/firstAccess",
                        {
                            "username": _lUsername.val()
                        });
                    request.fail(function (jqXHR, test_status, str_error) {
                        errore(jqXHR, test_status, str_error)
                    }),
                        request1.done(function (data) {
                            if (data.firstAccess == true) {
                                alert(data.password + " è la tua password di accesso temporanea, al primo accesso devi cambiarla.");
                                window.location.href = "cambioPassword.html";
                            }
                            else
                                window.location.href = "inserisciPassword.html";
                        })
                })
        }
    }
});
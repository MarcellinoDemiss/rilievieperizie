"use strict";

$(document).ready(function () {
    let _lPassword = $("#lPassword");
    let _lblErrore = $("#lblErrore");
    let _close = $(".close");

    _lblErrore.hide();
    _close.on("click", function () {
        _lblErrore.hide();
    })

    $("#btnLogin").on("click", controllaLogin);

    function controllaLogin() {

        _lPassword.css("border", "");

        if (_lPassword.val() == "")
            _lPassword.css("border", "1px solid red");
        else {
            let request = inviaRichiesta("POST", "https://marcellino-demis-app.herokuapp.com/api/verificaPassword",
                {
                    "password": _lPassword.val(),
                }
            );
            request.fail(function (jqXHR, test_status, str_error) {
                if (jqXHR.status == 401)
                    _lblErrore.show();
                else
                    errore(jqXHR, test_status, str_error)
            }),
                request.done(function (data) {
                    window.location.href = "index.html";
                })
        }
    }
});
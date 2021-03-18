"use strict";

$(document).ready(function () {
    let lPasswordOld = $("#lPasswordOld");
    let lPasswordNew = $("#lPasswordNew");
    let _lblErrore = $("#lblErrore");
    let _close = $(".close");

    _lblErrore.hide();
    _close.on("click", function () {
        _lblErrore.hide();
    })

    $("#btnLogin").on("click", controllaLogin);

    function controllaLogin() {

        lPasswordOld.css("border", "");
        lPasswordNew.css("border", "");

        if (lPasswordOld.val() == "")
            lPasswordOld.css("border", "1px solid red");
        else if (lPasswordNew.val() == "")
            lPasswordNew.css("border", "1px solid red");
        else {
            let request = inviaRichiesta("POST", "https://marcellino-demis-app.herokuapp.com/api/cambiaPassword",
                {
                    "oldPassword": lPasswordOld.val(),
                    "newPassword": lPasswordNew.val(),
                }
            );
            request.fail(function (jqXHR, test_status, str_error) {
                if (jqXHR.status == 401)
                    _lblErrore.show();
                else
                    errore(jqXHR, test_status, str_error)
            }),
                request.done(function (data) {
                    if(data.modifiedCount == 0)
                    {
                        alert("La vecchia password è sbagliata");
                    }
                    else    
                    {
                        alert("Password cambiata correttamente");
                        window.location.href = "index.html";
                    }
                })
        }
    }

});
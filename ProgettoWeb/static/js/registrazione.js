"use strict";

$(document).ready(function () {

    let _sUsername = $("#sUsername");
    let _sSurname = $("#sSurname");
    let _sName = $("#sName");
    let _sEmail = $("#sEmail");
    let _sDob = $("#sDob");
    let _close = $(".close");

    let _lblErrore = $("#lblErrore");
    _lblErrore.hide();

    _close.on("click", function () {
        _lblErrore.hide();
    })

    $("#btnSignUp").on("click", controllaSignUp)

    function controllaSignUp() {

        removeBorder();

        let username = _sUsername.val();
        let surname = _sSurname.val();
        let name = _sName.val();
        let mail = _sEmail.val();
        let dob = _sDob.val();

        let regMail = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");

        if (name == "")
            _sName.css("border", "1px solid red");
        else if (surname == "")
            _sSurname.css("border", "1px solid red");
        else if (mail == "" || !regMail.test(mail))
            _sEmail.css("border", "1px solid red");
        else if (username == "")
            _sUsername.css("border", "1px solid red");
        else if (dob == "")
            _sDob.css("border", "1px solid red");
        else {
            let request = inviaRichiesta("POST", "/api/signUp",
                { "username": username });
            request.fail(function (jqXHR, test_status, str_error) {
                if (jqXHR.status == 409) {
                    _lblErrore.show();
                } else
                    errore(jqXHR, test_status, str_error)
            });
            request.done(function (data) {
                if (data["ris"] == "nus") {
                    let request2 = inviaRichiesta("POST", "/api/utenti");
                    request2.fail(errore);
                    request2.done(function (data) {
                        let arrayLength = data.length;
                        let num = parseInt(data[arrayLength - 1]["codUtente"].split("c")[1]) + 1
                        let codUtente = "c" + num;
                        let alfabeto = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
                        let pwdRnd = "";
                        for(let i = 0; i < 8; i++)
                        {
                            pwdRnd += alfabeto[random(0, alfabeto.length-1)];
                        }
                        let request3 = inviaRichiesta("POST", "/api/insertUser",
                            {
                                "codUtente": codUtente, "username": username, "surname": surname,
                                "name": name, "mail": mail, "dob": dob, "password": pwdRnd
                            })
                        request3.fail(errore);
                        request3.done(function (data) {
                            alert("Nuovo utente inserito correttamente");
                            window.location.href = "./htmlTemplate/loading.html";
                        })
                    })
                }
            })
        }
    }

    function removeBorder() {
        _sUsername.css("border", "");
        _sSurname.css("border", "");
        _sName.css("border", "");
        _sEmail.css("border", "");
        _sDob.css("border", "");
    }

    function random(min, max){
        let rnd = Math.floor((max - min + 1) * Math.random()) + min;
        return rnd;
    }
});
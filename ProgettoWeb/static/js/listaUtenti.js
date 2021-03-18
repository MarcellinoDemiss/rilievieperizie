"use strict";

$(document).ready(function () {

    ottieniInfoUtenti();

    function ottieniInfoUtenti() {
        let request = inviaRichiesta("post", "/api/getInformazioniUtenti");
        request.fail(errore);
        request.done(function (data) {
            let _dynamicTable = $("#dynamicTable");
            let _table = $("<table>");
            let _thead = $("<thead>");
            let _tr = $("<tr>");
            _tr.append("<th> Codice </th>");
            _tr.append("<th> Username </th>");
            _tr.append("<th> Cognome </th>");
            _tr.append("<th> Nome </th>");
            _tr.append("<th> Mail </th>");
            _tr.appendTo(_thead);
            _thead.appendTo(_table);

            let _tbody = $("<tbody>");
            for (let item of data) {
                let _tr = $("<tr>");
                _tr.append("<td>" + item.codUtente + "</td>");
                _tr.append("<td>" + item.username + "</td>");
                _tr.append("<td>" + item.cognome + "</td>");
                _tr.append("<td>" + item.nome + "</td>");
                _tr.append("<td>" + item.mail + "</td>");
                _tr.appendTo(_tbody);
            }
            _tbody.appendTo(_table);

            _table.addClass("dynamicTable");
            _thead.addClass("dynamicTableTh");
            _tbody.addClass("dynamicTableTd");

            _table.appendTo(_dynamicTable);
        });
    }

});
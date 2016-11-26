/** js/main.js **/
'use strict';

window.PEM = {
    updateTitle: function (title) {
        $('#header').html(title);
    },

    updateMenu: function () {
        $('#mainmenu a').removeClass('selected');
        // подсвечиваю нужную кнопку меню
        var link = location.href.split('/')[3];
        $('#mainmenu a[href="/' + link + '"]').addClass('selected');
    },

    init: function() {
        $(PEM.onLoad);

        // обнволяется меню
        PEM.updateMenu();

        // показываю кнопку сброса если не загрузилась страница
        setTimeout(function() {
            $('#wait-then-reload').show();
        }, 1000);
    },

    onLoad: function() {

    }
}

PEM.init();
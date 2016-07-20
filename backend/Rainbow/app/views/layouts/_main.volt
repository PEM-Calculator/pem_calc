<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        {{ get_title() }}
        {{ stylesheet_link('css/test_bootstrap.css') }}
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Your invoices">
        <meta name="author" content="Phalcon Team">
        <link rel="shortcut icon" href="/favicon.png">
    </head>
    <body>
        {# Бар с языками, логином и картой #}
        <div role="top-bar">
            <div class="container">
                RU - EN
            </div>
        </div>

        {# Бар с лого и контактами #}
        <header class="container">
            <div class="row">
            <div class="col-md-3">
                <a href="/">
                    <img src="/img/gs1.png" width="191" height="82" />
                </a>
            </div>
            <div class="col-md-4 col-md-offset-1">
                <span>
                    {{ settings.HEADER_TITLE }}
                </span>
            </div>
            <div class="col-md-3 col-md-offset-1">
                <address>
                    <h3>{{ settings.HEADER_PHONE }}</h3>
                    <a href="mailto:{{ settings.HEADER_EMAIL }}" class="mail ficon-mail">{{ settings.HEADER_EMAIL }}</a>
                </address>
            </div>
        </header>

        {# Главное меню #}
        <nav class="navbar navbar-default">
            <div class="container">
                {{ sitemenu.getMenu(page) }}
            </div>
        </nav>

        {# Место под ошибки #}
        <div class="container">
            {{ flash.output() }}
        </div>

        {# Контент #}
        <main>
            {{ content() }}
        </main>
        
        {# Футер #}
        <footer>
            <div class="container">
                <p>{{ link_to('http://steamcommunity.com/groups/achis', '&copy; Achievements Slaves 2015', 'local': false, 'target': '_blank') }}</p>
            </div>
        </footer>
        {{ javascript_include('js/jquery.min.js+bootstrap.min.js+utils.js+PageGenerator.js') }}
    </body>
</html>
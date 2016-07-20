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
        <main class="container">
            {{ content() }}
        </main>
        {{ javascript_include('js/jquery-2.1.4.min.js+utils.js+PageGenerator.js+nunjucks.min.js') }}
        {{ javascript_include('js/templates.js') }}
        {{ javascript_include('js/calculator.js') }}
    </body>
</html>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        {{ get_title() }}
        {{ stylesheet_link('css/test_bootstrap.css') }}
        {{ stylesheet_link('css/admin.css') }}
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Your invoices">
        <meta name="author" content="Phalcon Team">
    </head>
    <body>
        <nav class="navbar navbar-default navbar-inverse navbar-fixed-top" role="navigation">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#">{{ adminmenu.getProjectName() }}</a>
                </div>
                {{ adminmenu.getMenu() }}
            </div>
        </nav>

        <div class="under-menu"></div>

        <div role="flashes_block">
            {{ flash.output() }}
        </div>

        <div class="container">
            {{ content() }}
        </div>

        <footer>
            <div class="container">
                <hr/>
                <p>&copy; Company 2014</p>
            </div>
        </footer>
        {{ javascript_include('js/jquery.min.js+bootstrap.min.js') }}
        {{ javascript_include('js/admin.js') }}
    </body>
</html>
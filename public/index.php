<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>ПЭМ-Калькулятор</title>
    <link rel="stylesheet" href="/app/main.css"/>
</head>
<body>
<header>
    <div class="blue-header">
        <div class="container">
            <h3>Монитор эффективности деятельности</h3>
        </div>
    </div>
    <div class="container">
        <h1 id="header">&nbsp;</h1>
    </div>
    <nav class="container" id="mainmenu">
        <a href="/">Монитор</a>
        <a href="/planfact">План и факт</a>
        <a href="/settings">Настройки</a>
    </nav>
</header>

<main class="container" id="calc">
    <div style="text-align: center">
        <img src="/app/img/loading.svg" width="100px" height="100px"/>
        <div id="wait-then-reload" style="display: none;">
            <a href="#" onclick="localStorage.clear();location.reload();">Нажмите если не загрузилось</a>
        </div>
    </div>
</main>

<footer>
    &copy; Все права защищены. Автор прототипа Зуев Григорий. e-mail: g.zuev@mail.ru
</footer>

<script src="/app/jquery-2.1.4.min.js"></script>
<script src="/app/bootstrap.min.js"></script>
<script src="/app/main.js"></script>
<script src="/app/app.js"></script>
</body>
</html>

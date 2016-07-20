<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>ПЭМ-Калькулятор</title>
	<link rel="stylesheet" href="/css/main.css?v=2"/>
</head>
<body>
	<header>
		<div class="container">
			<h1>Строительство моста через Каму</h1>
		</div>
		<nav class="container" id="mainmenu">
			<a class="btn btn-default" href="/">Монитор</a>
			<a class="btn btn-default" href="/planfact">План и факт</a>
			<a class="btn btn-default" href="/settings">Настройки</a>
		</nav>
	</header>

	<main class="container" id="calc">
		<div style="text-align: center">
			<img src="img/loading.svg" width="100px" height="100px" />
			<div>
				<a href="#" onclick="localStorage.clear();location.reload();">Нажмите если не загрузилось</a>
			</div>
		</div>
	</main>

	<footer>
		&copy; Все права защищены. Автор прототипа Зуев Григорий. e-mail: g.zuev@mail.ru
	</footer>

	<script src="/scripts/app.js?v=2"></script>
	<script src="/scripts/jquery-2.1.4.min.js"></script>
	<script src="/scripts/bootstrap.min.js"></script>
	<!--<script src="/scripts/main.js?v=2"></script>-->
</body>
</html>

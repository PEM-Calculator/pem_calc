<div class="jumbotron">
<form class="form-signin" method="post" name="signin">
	<h2 class="form-signin-heading">{{ locale.CALL_TO_SIGNIN }}</h2>

	<label for="inputEmail" class="sr-only">{{ locale.EMAIL_ADDRESS }}</label>
	<input id="inputEmail" class="form-control" placeholder="Email address" required="" autofocus="" type="email" name="email" value="admin@admin.ru">

	<label for="inputPassword" class="sr-only">{{ locale.PASSWORD }}</label>
	<input id="inputPassword" class="form-control" placeholder="Password" required="" type="password" name="password" value="123">

	<div class="checkbox">
		<label>
			<input value="remember-me" type="checkbox"> {{ locale.REMEMBER_ME }}
		</label>
	</div>

	<button class="btn btn-lg btn-primary btn-block" type="submit">{{ locale.SIGN_IN }}</button>
</form></div>
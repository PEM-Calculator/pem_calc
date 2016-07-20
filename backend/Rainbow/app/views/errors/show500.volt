<div class="container">
	<div class="jumbotron">
	    <h1>{{ locale.INTERNAL_ERROR }}</h1>
	    <p>{{ content() }}</p>
	    <p>{{ link_to('index', locale.ACTION_HOME, 'class': 'btn btn-primary') }}</p>
	</div>
</div>
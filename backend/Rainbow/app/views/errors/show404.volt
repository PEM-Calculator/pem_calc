<div class="container">
	<div class="jumbotron">
	    <h1>{{ locale.PAGE_NOT_FOUND }}</h1>
	    <p>{{ content() }}</p>
	    <p>{{ link_to('index', locale.ACTION_HOME, 'class': 'btn btn-primary') }}</p>
	</div>
</div>
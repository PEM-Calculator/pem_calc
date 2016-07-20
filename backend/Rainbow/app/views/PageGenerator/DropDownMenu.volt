<div class="DropDownMenuBlock{% if content.class %} {{ content.class }}{% endif %}"{% if content.style %} style="{{ content.style }}"{% endif %}>
	<div>
		<div class="container">
			<h1>{{ content.title }}</h1>
			{% for item in content.items %}
			{% if loop.first %}
			<table class="menu">
			<tr>
			{% endif %}

				{% set width = 100 / content.items|length %}
				<td width="{{ width }}%">
					<div class="content">
						<h2>{{ item.caption }}</h2>
						<div class="additional">
							{% for subitem in item.items %}
								{% if loop.first %}
								<ul>
								{% endif %}
									<li>
										{% if subitem.link_id %}
										<a href="{{ generator.getUrlByLinkId(subitem.link_id) }}">{{ subitem.text }}</a>
										{% else %}
										<span>{{ subitem.text }}</span>
										{% endif %}
									</li>
								{% if loop.last %}
								</ul>
								{% endif %}
							{% endfor %}

							{% if item.more_link_id %}
							<a class="button button-rarr" href="{{ generator.getUrlByLinkId(item.more_link_id) }}">{{ item.more_text }}</a>
							{% endif %}
						</div>
					</div>
				</td>

			{% if loop.last %}
			</tr>
			</table>
			{% endif %}
			{% endfor %}
		</div>
	</div>
</div>
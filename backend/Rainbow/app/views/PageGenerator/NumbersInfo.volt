<div class="NumbersInfoBlock{% if content.class %} {{ content.class }}{% endif %}"{% if content.style %} style="{{ content.style }}"{% endif %}>
	<div>
		<div class="container">
			<h1>{{ content.title }}</h1>
			{% for item in content.items %}
			{% if loop.first %}
			<table>
			<tr>
			{% endif %}

				{% set width = 100 / content.items|length %}
				<td width="{{ width }}%">
					<div class="icon_here">
						<div class="icon_box">
							<i class="ficon-{{ item.icon }}"></i>
						</div>
					</div>
					<h2>{{ item.prefix }} <span class="number">{{ item.number }}</span> {{ item.suffix }}</h2>
					<div class="description">
						{{ item.description }}
					</div>
				</td>

			{% if loop.last %}
			</tr>
			</table>
			{% endif %}
			{% endfor %}

			{% if content.more_text and content.more_link_id %}
			<center>
				<a class="button button-rarr" href="{{ generator.getUrlByLinkId(content.more_link_id) }}">{{ content.more_text }}</a>
			</center>
			{% endif %}
		</div>
	</div>
</div>
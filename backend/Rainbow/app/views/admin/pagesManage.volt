<h1>{{ locale.PAGE_PAGES_MANAGE }}</h1>

{%- macro out_groups(groups, selectedGroup) %}
  {% if groups %}
    {% for item in groups %}
      {% if loop.first %}
      <ul>
      {% endif %}
        <li id="{{ item.objects.id }}" {% if(item.objects.id == selectedGroup) %}class="selected"{% endif %}>
          <span class="name">
            <a href="?group={{ item.objects.id }}">{{ item.name }}</a>
            <span class="info">close</span>
          </span>
          {{ out_groups(item.pageGroups, selectedGroup) }}
        </li>
      {% if loop.last %}
      </ul>
      {% endif %}
    {% endfor %}
  {% endif %}
{%- endmacro %}

*** Переход в категорию

{% if pageGroups %}
  <div role="pages_tree">
    <h3>Категории</h3>
    {{ out_groups(pageGroups, selectedGroup) }}
  </div>
{% else %}
  <p><i>No one page group exists.</i></p>
{% endif %}

<button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#createGroupModal" onclick="window.getAdmin().createPageGroup();">
	<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> {{ locale.CRAETE_PAGE_GROUP }}
</button>

<div class="modal fade" id="createGroupModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">{{ locale.CRAETE_PAGE_GROUP }}</h4>
      </div>
      <div class="modal-body">
      	<div class="form-group">
        	<label for="inputGroupName">{{ locale.EDIT_GROUP_NAME }}</label>
        	<input type="text" class="form-control" name="groupName" id="inputGroupName" autofocus/>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">{{ locale.CLOSE_WINDOW }}</button>
        {# кнопка создани новой категории #}
        <button type="button" class="btn btn-primary" role="create" onclick="window.getAdmin().createPageGroupSave();">{{ locale.CREATE }}</button>
        {# кнопка редактирования существующей категории #}
        <button type="button" class="btn btn-primary" role="save" onclick="window.getAdmin().editPageGroupSave();">{{ locale.SAVE_CHANGES }}</button>
      </div>
    </div>
  </div>
</div>
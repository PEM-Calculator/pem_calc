window.PEM = {
	updateTitle: function(title)
	{
		$('#header').html(title)
	},

	updateMenu: function()
	{
		$('#mainmenu a').removeClass('selected')
		// подсвечиваю нужную кнопку меню
		var link = location.href.split('/')[3]
		$('#mainmenu a[href="/' + link + '"]').addClass('selected')
	},
}

window.PEM.updateMenu();

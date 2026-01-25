(function() {
    if ('fonts' in document) {
        Promise.all([
            document.fonts.load('400 1em Inter'),
            document.fonts.load('600 1em Inter'),
            document.fonts.load('700 1em Inter'),
            document.fonts.load('800 1em Inter'),
            document.fonts.load('500 1em Outfit'),
            document.fonts.load('700 1em Outfit'),
            document.fonts.load('800 1em Outfit')
        ]).then(function() {
			document.documentElement.classList.add('fonts-loaded');
		});
    }
})();
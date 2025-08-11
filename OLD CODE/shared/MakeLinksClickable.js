function makeLinksClickable(text) {
	const urlPattern = /(https?:\/\/[^\s]+)/g;
	return text.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
};

document.addEventListener('DOMContentLoaded', () => {
    const clickableLinksText = document.getElementsByClassName('clickable-links-text');
    for (let i = 0; i < clickableLinksText.length; i++) {
        const text = clickableLinksText[i].innerHTML;
        clickableLinksText[i].innerHTML = makeLinksClickable(text);
    }
});

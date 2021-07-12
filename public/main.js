function launch() {
    window.open('https://proxy.davidfahim.repl.co/get?url=' + document.getElementById('url').value, '_blank');
}

window.onload = function() {
    document.getElementById('url').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            launch();
        }
    });
}